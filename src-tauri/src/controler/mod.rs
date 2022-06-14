use std::{
    io::Write,
    net::{IpAddr, Ipv4Addr, SocketAddr, TcpStream, UdpSocket},
    sync::{
        mpsc::{channel, sync_channel, Receiver, Sender, SyncSender, TryRecvError},
        Arc, Condvar, Mutex, RwLock,
    },
    thread::{self, sleep, JoinHandle},
    time::{Duration, Instant},
};

use crate::api::{
    ledwall_status_holder::LedwallError, notification::Notification, slice::SliceData,
};
use cxx::let_cxx_string;
use spout_rust::ffi::{self as spoutlib, SpoutDXAdapter};

pub enum ControlerMessage {
    Terminate,
    Tick(u8),
}
struct ImageSize {
    height: u32,
    width: u32,
}
struct ImageHolder {
    image: Vec<u8>,
    image_size: ImageSize,
}

struct TaskHolder {
    task: JoinHandle<()>,
    taskChannel: SyncSender<ControlerMessage>,
}

pub trait ToLedwallResult<R> {
    fn toLedwallResult(self, error: LedwallError) -> Result<R, LedwallError>;
}

impl<R, E> ToLedwallResult<R> for Result<R, E> {
    fn toLedwallResult(self, error: LedwallError) -> Result<R, LedwallError> {
        match self {
            Ok(a) => return Ok(a),
            Err(_) => return Err(error),
        }
    }
}

struct FrameIdentifier {
    frameIdentifier: Option<u8>,
    fIdShift1: Option<u8>,
    fIdShift2: Option<u8>,
}

impl FrameIdentifier {
    pub fn new() -> Self {
        return Self {
            frameIdentifier: None,
            fIdShift1: None,
            fIdShift2: None,
        };
    }

    pub fn getRunnerFrameIdentifier(&self) -> Option<u8> {
        return self.frameIdentifier;
    }

    pub fn getCommandFrameIdentifier(&self) -> Option<u8> {
        return self.fIdShift2;
    }

    pub fn next(&mut self) {
        self.fIdShift2 = self.fIdShift1;
        self.fIdShift1 = self.frameIdentifier;

        if let Some(fId) = self.frameIdentifier {
            self.frameIdentifier = Some((fId + 1) % 26);
        } else {
            self.frameIdentifier = Some(0);
        }
    }
}

pub fn ledwallRunner(
    receiver: Receiver<ControlerMessage>,
    notificationSender: Sender<Notification>,
    slices: Vec<SliceData>,
    commandSocket: UdpSocket,
) {
    let mut tasks = Vec::with_capacity(slices.len());

    // This channel is used to by tasks to notifiy this thread that they finished, either correctly or with an error
    let (taskToLocalSender, taskToLocalReceiver) = channel();

    // We create slice runners
    for slice in slices {
        // This channel is used by this thread to ask the runners to stop
        let (localToTaskSender, localToTaskReceiver) = sync_channel(1);

        let taskToLocalSenderClone = taskToLocalSender.clone();
        let localSlice = slice.clone();
        let notificationSenderCopy = notificationSender.clone();
        let task = thread::spawn(move || {
            match sliceRunner(
                localToTaskReceiver,
                localSlice,
                notificationSenderCopy.clone(),
            ) {
                Ok(_) => (),
                Err(_) => {
                    let _ = taskToLocalSenderClone.send(ControlerMessage::Terminate);
                }
            }

            let _r = notificationSenderCopy.send(Notification {
                title: "Information".into(),
                message: "Thread terminé".into(),
                kind: "info".into(),
                consoleOnly: true,
                origin: format!("Slice {} thread", slice.getSliceId()),
            });
        });

        let taskHolder = TaskHolder {
            task,
            taskChannel: localToTaskSender,
        };

        tasks.push(taskHolder);
    }

    // 60 fps, this is the interval between each frame
    // i.e 16ms
    let wait_time = Duration::from_millis(16);
    // This is the frame identifier
    let mut frameId = FrameIdentifier::new();
    let mut start = Instant::now();

    let mut frameCounter = 0;
    let mut durationCounter = Duration::from_millis(0);

    // This loop checks that no thread is asking for termination
    // Then it increments the frame identifer and notify all slice runners they should process a new frame
    // Then it waits until the end of the period and then send a upd command to make slabs display the next frame
    loop {
        // Here we look at a potential incoming message from the parent thread
        match receiver.try_recv() {
            Err(TryRecvError::Disconnected) => {
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: "Sender corrupted, stopping the sender.".into(),
                    kind: "error".into(),
                    consoleOnly: false,
                    origin: "ledwall thread".into(),
                });
                terminateSliceRunners(tasks);
                return;
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                terminateSliceRunners(tasks);
                return;
            }
            _ => (),
        }

        // We do the same for messages comming from child threads
        match taskToLocalReceiver.try_recv() {
            Err(TryRecvError::Disconnected) => {
                terminateSliceRunners(tasks);
                return;
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                terminateSliceRunners(tasks);
                return;
            }
            _ => (),
        }

        // We go to the next frame
        frameId.next();

        // We then notify all slice runners that a new frame should be processed
        if let Some(fId) = frameId.getRunnerFrameIdentifier() {
            for i in 0..tasks.len() {
                let _ = tasks[i].taskChannel.send(ControlerMessage::Tick(fId));
            }
        }

        // Then we can wait for the end of the period
        let runtime = start.elapsed();
        // println!("before {:?}", runtime);

        if let Some(remaining) = wait_time.checked_sub(runtime) {
            // TODO: Remove busy waiting and optimize this.
            // Using sleep tends to add an extra 15ms to the waiting time which is a problem.
            // This is why a busy wait is used
            // Figuring out why may be the solution here
            while wait_time.checked_sub(start.elapsed()).is_some() {}
            // We also need to add a sync with all slab senders
        } else {
            let _r = notificationSender.send(Notification {
                title: "Avertissement".into(),
                message: "Décalage détecté dans l'horloge globale, le nombre de FPS est peut-être trop élevé".into(),
                kind: "warning".into(),
                consoleOnly: true,
                origin: "ledwall thread".into(),
            });
        }

        let runtime = start.elapsed();
        // println!("after {:?}", runtime);

        start = Instant::now();

        // We then send a the new frame command
        // It is delayed by 2 frame to accomodate jitter
        if let Some(fId) = frameId.getCommandFrameIdentifier() {
            if let Err(_) = commandSocket.send(&[fId]) {
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: "Erreur lors de l'envoie de la trame de synchronisation UDP.".into(),
                    kind: "error".into(),
                    consoleOnly: true,
                    origin: "ledwall thread".into(),
                });
            }
        }

        if durationCounter.as_secs() >= 1 {
            let measuredFps = frameCounter * 1000 / durationCounter.as_millis();

            let _r = notificationSender.send(Notification {
                title: "fps".into(),
                message: measuredFps.to_string(),
                kind: "status".into(),
                consoleOnly: true,
                origin: "ledwall thread".into(),
            });

            frameCounter = 0;
            durationCounter = Duration::from_millis(0);
        }

        frameCounter += 1;
        durationCounter += runtime;
    }
}

fn terminateSliceRunners(tasks: Vec<TaskHolder>) {
    for task in tasks {
        println!("terminate slices");
        match task.taskChannel.send(ControlerMessage::Terminate) {
            Err(_) => (),
            _ => {
                let _ = task.task.join();
            }
        }
    }
}

struct SlabData {
    id: u32,
    slabWidth: usize,
    slabHeight: usize,
    xOffset: usize,
    yOffset: usize,
}

struct SlabRunner {
    thread: JoinHandle<()>,
    sliceChannel: Sender<ControlerMessage>,
}

fn sliceRunner(
    recv: Receiver<ControlerMessage>,
    slice: SliceData,
    notificationSender: Sender<Notification>,
) -> Result<(), LedwallError> {
    println!("slice");

    // Create the adapter to get the frames
    let mut spout = spoutlib::new_spout_adapter();

    let_cxx_string!(spout_name = slice.getSpoutName());

    let spout = spout.as_mut().ok_or(LedwallError::LedwallPoisonError);

    let mut localSpout;

    match spout {
        Err(e) => {
            let _r = notificationSender.send(Notification {
                title: "Erreur".into(),
                message: format!(
                    "Impossible de se connecter au spout '{}'",
                    slice.getSpoutName()
                ),
                kind: "error".into(),
                consoleOnly: true,
                origin: "ledwall thread".into(),
            });

            return Err(e);
        }
        Ok(lS) => localSpout = lS,
    }

    // We create the adapter
    if !SpoutDXAdapter::AdapterOpenDirectX11(localSpout.as_mut()) {
        let _r = notificationSender.send(Notification {
            title: "Erreur".into(),
            message: "Impossible d'ouvrir DirectX 11. Arret du sender.".into(),
            kind: "error".into(),
            consoleOnly: false,
            origin: format!("Slice {}", slice.getSliceId()),
        });
        eprintln!("Unable to open DX11, aborting !");
        return Err(LedwallError::LedwallDX11);
    }
    SpoutDXAdapter::AdapterSetReceiverName(localSpout.as_mut(), spout_name.as_mut());

    // We initialize a new empty image holder
    let secureImageHolder = Arc::new(RwLock::new(ImageHolder {
        image: Vec::new(),
        image_size: ImageSize {
            height: 0,
            width: 0,
        },
    }));

    // This is used to transfer the actual frame identifier to the slab runners ans to synchronize them
    let frameIdentifier: Arc<(Mutex<Option<u8>>, Condvar)> =
        Arc::new((Mutex::new(None), Condvar::new()));

    // This channel is used to by slabs to notifiy this thread that they finished, either correctly or with an error
    let (slabToLocalSender, slabToLocalReceiver) = channel();

    let mut slabRunners: Vec<SlabRunner> = Vec::new();
    initSlice(
        &mut slabRunners,
        &slice,
        frameIdentifier.clone(),
        secureImageHolder.clone(),
        slabToLocalSender,
        notificationSender.clone(),
    );

    let (frameIdentifierMutex, frameIdentifierCVar) = &*frameIdentifier;
    let mut localFrameIdentifier;

    let mut receiveErrorCount = 0;
    let mut errorDetected = false;

    loop {
        // We wait for the synchronization message from the parent thread
        let message = recv.recv();

        // PROFILING: This is for profiling and should be included only in debug build
        #[cfg(debug_assertions)]
        let start = Instant::now();

        // We look for the message, if it tells to terminate, then we kill all child threads and terminate this one
        match message {
            Ok(ControlerMessage::Terminate) => return terminateSlabRunners(slabRunners),
            Ok(ControlerMessage::Tick(fId)) => localFrameIdentifier = fId,
            Err(_) => return terminateSlabRunners(slabRunners),
        }

        println!(" fid{}", localFrameIdentifier);

        // We do the same for messages comming from child threads
        match slabToLocalReceiver.try_recv() {
            Err(TryRecvError::Disconnected) => {
                return terminateSlabRunners(slabRunners);
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                return terminateSlabRunners(slabRunners);
            }
            _ => (),
        }

        let mut imageHolder = secureImageHolder
            .write()
            .toLedwallResult(LedwallError::LedwallPoisonError)?;
        let width = imageHolder.image_size.width;
        let height = imageHolder.image_size.height;

        // We try to receive an image from the Spout adapter
        if SpoutDXAdapter::AdapterReceiveImage(
            localSpout.as_mut(),
            &mut imageHolder.image[..],
            width,
            height,
            false,
            false,
        ) {
            if errorDetected {
                errorDetected = false;
                receiveErrorCount = 0;
                let _r = notificationSender.send(Notification {
                    title: "Succès".into(),
                    message: format!("Le sender spout {} a été reconnecté.", slice.getSpoutName(),),
                    kind: "success".into(),
                    consoleOnly: false,
                    origin: format!("Slice {}", slice.getSliceId()),
                });
            }
            if SpoutDXAdapter::AdapterIsUpdated(localSpout.as_mut()) {
                // If the adapter has been updated sinc the last time we fetched the frame, we reset the buffer and
                // update the data structure
                let imageHeight = SpoutDXAdapter::AdapterGetSenderHeight(localSpout.as_mut());
                let imageWidth = SpoutDXAdapter::AdapterGetSenderWidth(localSpout.as_mut());

                let imageSize = (imageHeight * imageWidth * 3) as usize;

                imageHolder.image = vec![0; imageSize];
                imageHolder.image_size.height = imageHeight;
                imageHolder.image_size.width = imageWidth;

                let _r = notificationSender.send(Notification {
                    title: "Information".into(),
                    message: format!(
                        "La slice {} a été resize aux dimensions WxH:{}x{}",
                        slice.getSpoutName(),
                        slice.getWidth(),
                        slice.getHeight()
                    ),
                    kind: "info".into(),
                    consoleOnly: true,
                    origin: format!("Slice {}", slice.getSliceId()),
                });
            } else {
                // Else, we can immedialty release the image holder to make it available to child threads
                drop(imageHolder);

                // We update the frame identifier
                let mut frameIdentifier = frameIdentifierMutex
                    .lock()
                    .toLedwallResult(LedwallError::LedwallPoisonError)?;
                *frameIdentifier = Some(localFrameIdentifier);

                // Notify slab runners a new frame is available and should be processed
                frameIdentifierCVar.notify_all();
            }
        } else {
            if receiveErrorCount == 0 {
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: format!("Impossible de recevoir une image depuis le sender spout {}. Verifiez la connexion.", slice.getSpoutName()),
                    kind: "error".into(),
                    consoleOnly: false,
                    origin: format!("Slice {}",  slice.getSliceId()),
                });
            }

            receiveErrorCount = (receiveErrorCount + 1) % (60 * 5);
            errorDetected = true;
        }

        // PROFILING: This is for profiling and should be included only in debug build
        // if cfg!(debug_assertions) {
        //     let runtime = start.elapsed();
        //     println!("Spent {:?} ms on slice task", runtime);
        // }
    }
}

fn terminateSlabRunners(runners: Vec<SlabRunner>) -> Result<(), LedwallError> {
    for runner in runners {
        println!("terminating slabs");
        match runner.sliceChannel.send(ControlerMessage::Terminate) {
            Err(_) => (),
            _ => {
                let _ = runner.thread.join();
            }
        }
    }

    return Ok(());
}

fn initSlice(
    runners: &mut Vec<SlabRunner>,
    slice: &SliceData,
    frameCountCondVar: Arc<(Mutex<Option<u8>>, Condvar)>,
    secureImageHolder: Arc<RwLock<ImageHolder>>,
    slabToLocalSender: Sender<ControlerMessage>,
    notificationSender: Sender<Notification>,
) {
    let slabs = slice.getSlab();

    // We gather all needed informations for the slabs in the slice
    for slabLine in 0..slabs.len() {
        for slab in 0..slabs[slabLine].len() {
            if slabs[slabLine][slab] != 0 {
                let slabInformation = SlabData {
                    id: slabs[slabLine][slab],
                    slabWidth: slice.getSlabWidth() as usize,
                    slabHeight: slice.getSlabHeight() as usize,
                    xOffset: slab,
                    yOffset: slabLine,
                };

                let (localToSlabSender, localToSlabReceiver) = channel();

                let frameCountCondVarClone = frameCountCondVar.clone();
                let secureImageHolderClone = secureImageHolder.clone();
                let slabToLocalSenderClone = slabToLocalSender.clone();

                let notificationSenderCopy = notificationSender.clone();

                // For each slab, we create the slab runner thread
                let thread = thread::spawn(move || {
                    let id = slabInformation.id;
                    let _ = slabRunner(
                        slabInformation,
                        frameCountCondVarClone,
                        secureImageHolderClone,
                        localToSlabReceiver,
                        notificationSenderCopy.clone(),
                    );

                    let _r = notificationSenderCopy.send(Notification {
                        title: "Information".into(),
                        message: "Thread terminé".into(),
                        kind: "info".into(),
                        consoleOnly: true,
                        origin: format!("Slab {} thread", id),
                    });

                    let _ = slabToLocalSenderClone.send(ControlerMessage::Terminate);
                });

                runners.push(SlabRunner {
                    thread: thread,
                    sliceChannel: localToSlabSender,
                });
            }
        }
    }
}

fn getTcpConnection(
    slabConnection: &SlabData,
    notificationSender: Sender<Notification>,
) -> Result<TcpStream, LedwallError> {
    if let Some(endip) = u8::try_from(slabConnection.id).ok() {
        let socket = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(192, 168, 1, endip + 50)), 9999);
        let connectionResult = TcpStream::connect_timeout(&socket, Duration::from_secs(10));

        let connection;
        match connectionResult {
            Err(_) => {
                println!("Cannot connect to slab {}", slabConnection.id);
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: format!(
                        "Impossible de se connecter via TCP à la dalle {} (IP: {})",
                        slabConnection.id, socket
                    ),
                    kind: "error".into(),
                    consoleOnly: false,
                    origin: format!("Slab {}", slabConnection.id),
                });
                return Err(LedwallError::SlabTCP(slabConnection.id));
            }
            Ok(c) => connection = c,
        }

        match connection.set_write_timeout(Some(Duration::from_secs(5))) {
            Err(_) => {
                eprintln!("Cannot set timeout for slab {}", slabConnection.id);
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: "Impossible de se connecter via TCP: Timeout".into(),
                    kind: "error".into(),
                    consoleOnly: false,
                    origin: format!("Slab {}", slabConnection.id),
                });
                return Err(LedwallError::SlabTCPTimeout(slabConnection.id));
            }
            Ok(_) => return Ok(connection),
        }
    } else {
        return Err(LedwallError::LedwallPoisonError);
    }
}

fn slabRunner(
    slabConnection: SlabData,
    frameIdentifierPair: Arc<(Mutex<Option<u8>>, Condvar)>,
    frameHolder: Arc<RwLock<ImageHolder>>,
    fromSliceReceiver: Receiver<ControlerMessage>,
    notificationSender: Sender<Notification>,
) -> Result<(), LedwallError> {
    let (frameIdentifierMutex, frameIdentifierCondVar) = &*frameIdentifierPair;

    let mut previousFrameId = None;

    // This is the buffer used to hold the bytes sent to the slab
    let mut buffer = Vec::<u8>::new();
    // It initialize the buffer with 0 values. It can be done only once because the slab size is constant
    // during the execution of this thread
    // 3 byte per pixel + 1 byte for the frame identifier
    buffer.resize(
        1 + 3 * slabConnection.slabHeight * slabConnection.slabWidth,
        0,
    );

    // This is the main loop of the thread, it connects the thread to the slab and then the image is sent to the slab when required
    // If a network error happens, the connection is rebuilt and then the image is sent again
    loop {
        match fromSliceReceiver.try_recv() {
            Err(TryRecvError::Disconnected) => {
                return Err(LedwallError::LedwallPoisonError);
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                println!("termi");
                return Ok(());
            }
            _ => (),
        }

        println!("loop tcp");

        let mut tcpConnection;
        match getTcpConnection(&slabConnection, notificationSender.clone()) {
            Ok(c) => tcpConnection = c,
            Err(LedwallError::LedwallPoisonError) => return Err(LedwallError::LedwallPoisonError),
            Err(_) => continue,
        }

        let _r = notificationSender.send(Notification {
            title: "Succès".into(),
            message: "Dalle connectée.".into(),
            kind: "success".into(),
            consoleOnly: true,
            origin: format!("Slab {}", slabConnection.id),
        });

        // This loop sends the image to the slab periodically
        loop {
            let mut frameIdentifier = frameIdentifierMutex
                .lock()
                .toLedwallResult(LedwallError::LedwallPoisonError)?;

            // We wait here until the parent thread finish fetching the new frame and notifies the slab threads the new frame is available to be sent
            while *frameIdentifier == previousFrameId {
                // Here we look at a potential incoming message from the parent thread
                // It is here to avoid deadlocks caused by the controller thread not sending updates anymore after
                // a termination
                match fromSliceReceiver.try_recv() {
                    Err(TryRecvError::Disconnected) => {
                        return Err(LedwallError::LedwallPoisonError);
                    }
                    Err(TryRecvError::Empty) => (),
                    Ok(ControlerMessage::Terminate) => {
                        return Ok(());
                    }
                    _ => (),
                }

                let result = frameIdentifierCondVar
                    .wait_timeout(frameIdentifier, Duration::from_secs(2))
                    .toLedwallResult(LedwallError::FrameSyncTimeout(slabConnection.id))?;

                frameIdentifier = result.0
            }

            // PROFILING: This is for profiling and should be included only in debug build
            #[cfg(debug_assertions)]
            let start = Instant::now();

            // Get the current frame identifier, it also drops the mutex as soon as possible so that other slabRunners for this slice can take it
            let frameIdentifier = *frameIdentifier;
            previousFrameId = frameIdentifier;

            // If we don't have a valid frame identifier, we just skip this turn
            let realFrameIdentifier;
            match frameIdentifier {
                None => continue,
                Some(fId) => realFrameIdentifier = fId,
            }

            // Get the frame data. This uses a read/write mutex so that all slabRunners can access the frame at the same time
            let frame = frameHolder
                .read()
                .toLedwallResult(LedwallError::LedwallPoisonError)?;

            // We copy the subframe of this slab to the buffer
            populateFrameBuffer(&mut buffer, &*frame, &slabConnection, realFrameIdentifier);

            // We write the buffer to the socket to the slab using the previously opened socket
            // If it fails, we exit the inner loop to create a new TCP socket to the slab
            if let Err(_) = tcpConnection.write_all(&buffer[..]) {
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: "Impossible d'écrire le buffer TCP".into(),
                    kind: "error".into(),
                    consoleOnly: true,
                    origin: format!("Slab {}", slabConnection.id),
                });
                break;
            }
            // We send the buffer to the slab using the previously opened socket
            // If it fails, we exit the inner loop to create a new TCP socket to the slab
            if let Err(_) = tcpConnection.flush() {
                let _r = notificationSender.send(Notification {
                    title: "Erreur".into(),
                    message: "Impossible de flush le buffer TCP".into(),
                    kind: "error".into(),
                    consoleOnly: true,
                    origin: format!("Slab {}", slabConnection.id),
                });
                break;
            }

            // PROFILING: This is for profiling and should be included only in debug build
            // if cfg!(debug_assertions) {
            //     let runtime = start.elapsed();

            //     println!("Spent {:?} on slabRunner {}", runtime, slabConnection.id);
            // }
        }
    }
}

fn populateFrameBuffer(
    buffer: &mut Vec<u8>,
    frame: &ImageHolder,
    slabInformations: &SlabData,
    frameIdentifier: u8,
) {
    // The first byte sent to the slab is the frame identifier, between 0 and 25
    buffer[0] = frameIdentifier as u8;

    // Number of pixels in the frame, used to avoid out of bound exception
    let frameLength = frame.image.len();
    let frameWidth = frame.image_size.width as usize;
    let slabHeight = slabInformations.slabHeight;
    let slabWidth = slabInformations.slabWidth;
    let slabXOffset = slabInformations.xOffset;
    // The line offset is the pixel index corresponding the index of the line we want to copy, to start, it is the first line of the slab
    // Number of lines in a slab * vertical position of the slab, starting from the top
    let mut lineOffset = slabHeight * slabInformations.yOffset;
    // This is the index of the current pixel being copied, in the frame buffer to be sent to the slab
    // It starts at 1 because the first byte is for the frame identifier
    let mut localFramePosition: usize = 1;

    // Here, we want to copy the subframe corresponding to the slab from the actual frame to the buffer
    // NOTE: It should be noted that the slab LEDs wiring is such that each even rows (stating from 0) are controlled
    // from left to right and each odd rows are controlled from right to left. Thus, each odd row here is reversed
    // We iterate over each rows of the slab
    for _ in 0..slabHeight {
        // We iterate over each pixel of the considered row
        for j in 0..slabWidth {
            let framePixelIndexInLine;
            // We compute the start index in the frame of the pixel we want to copy
            if lineOffset % 2 == 0 {
                // This is an even row, thus we go left to right
                // Here, we look for the index of the pixel we want in the current line
                // It is: (the number of pixels before this slab in this row + the index of the pixel in this slab) * |RGB|
                framePixelIndexInLine = (slabWidth * slabXOffset + j) * 3;
            } else {
                // This is an odd row, thus we go right to left
                // Here, we look for the index of the pixel we want in the current line
                // It is: (the number of pixels before the last pixel of this slab in this row + the index of the pixel in this slab) * |RGB|
                framePixelIndexInLine = (slabWidth * (slabXOffset + 1) - 1 - j) * 3;
            }

            // We then get the actual pixel in the whole frame
            let framePixelIndex = (lineOffset * frameWidth) * 3 + framePixelIndexInLine;

            // We then copy the pixel to the buffer
            // NOTE: the pixels in the buffer are in RGB format but in BGR format in the frame
            // We also skip the copy if the pixel is out of the frame line
            if framePixelIndex + 2 < frameLength && framePixelIndexInLine + 2 < frameWidth * 3 {
                buffer[localFramePosition + 2] = frame.image[framePixelIndex];
                buffer[localFramePosition + 1] = frame.image[framePixelIndex + 1];
                buffer[localFramePosition] = frame.image[framePixelIndex + 2];
            }

            // We can increment the buffer pixel index by |RGB|
            localFramePosition += 3;
        }

        // We finished the line, we can go to the next one
        lineOffset += 1;
    }
}
