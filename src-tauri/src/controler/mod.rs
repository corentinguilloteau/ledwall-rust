use std::{
    io::Write,
    net::{IpAddr, Ipv4Addr, SocketAddr, TcpStream},
    sync::{
        mpsc::{channel, Receiver, Sender, TryRecvError},
        Arc, Condvar, Mutex, RwLock,
    },
    thread::{self, sleep, JoinHandle},
    time::{Duration, Instant},
};

use crate::api::slice::SliceData;
use cxx::let_cxx_string;
use spout_rust::ffi::{self as spoutlib, SpoutDXAdapter};

pub enum ControlerMessage {
    Terminate,
    Tick,
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
    taskChannel: Sender<ControlerMessage>,
}

pub fn runControlerThread(receiver: Receiver<ControlerMessage>, slices: Vec<SliceData>) {
    let mut tasks = Vec::with_capacity(slices.len());

    let (tasksSender, tasksReceiver) = channel();

    for slice in slices {
        let (taskChannel, taskChannelReceiver) = channel();

        let localTaskSender = tasksSender.clone();
        let localSlice = slice.clone();

        println!("Creating slice thread");
        let task = thread::spawn(
            move || match runSliceTask(taskChannelReceiver, localSlice) {
                Ok(_) => (),
                Err(_) => {
                    let _ = localTaskSender.send(ControlerMessage::Terminate);
                }
            },
        );

        let taskHolder = TaskHolder { task, taskChannel };

        tasks.push(taskHolder);
    }

    // 30 fps
    // let wait_time = Duration::from_millis(33);
    let wait_time = Duration::from_millis(1000);

    loop {
        let start = Instant::now();

        let message = receiver.try_recv();

        match message {
            Err(TryRecvError::Disconnected) => {
                terminate(tasks);
                return;
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                terminate(tasks);
                return;
            }
            _ => (),
        }

        let message = tasksReceiver.try_recv();

        match message {
            Err(TryRecvError::Disconnected) => {
                terminate(tasks);
                return;
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                terminate(tasks);
                return;
            }
            _ => (),
        }

        println!("Sending main tick");

        for i in 0..tasks.len() {
            let _ = tasks[i].taskChannel.send(ControlerMessage::Tick);
        }

        let runtime = start.elapsed();

        if let Some(remaining) = wait_time.checked_sub(runtime) {
            sleep(remaining);
        } else {
            eprintln!("Main clock drift");
        }
    }
}

fn terminate(tasks: Vec<TaskHolder>) {
    for task in tasks {
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

fn runSliceTask(recv: Receiver<ControlerMessage>, slice: SliceData) -> Result<(), ()> {
    println!("Slice thread started");

    let mut spout = spoutlib::new_spout_adapter();

    let_cxx_string!(spout_name = slice.getSpoutName());

    if !SpoutDXAdapter::AdapterOpenDirectX11(spout.as_mut().unwrap()) {
        println!("Unable to open DX11, aborting !");

        return Err(());
    }

    SpoutDXAdapter::AdapterSetReceiverName(spout.as_mut().unwrap(), spout_name.as_mut());

    let secureImageHolder = Arc::new(RwLock::new(ImageHolder {
        image: Vec::new(),
        image_size: ImageSize {
            height: 0,
            width: 0,
        },
    }));

    let mut slabConnections = Vec::new();

    let slabs = slice.getSlab();

    for slabLine in 0..slabs.len() {
        for slab in 0..slabs[slabLine].len() {
            println!("Handling slab {}", slabs[slabLine][slab]);
            if slabs[slabLine][slab] != 0 {
                let slabConnection = SlabData {
                    id: slabs[slabLine][slab],
                    slabWidth: slice.getSlabWidth() as usize,
                    slabHeight: slice.getSlabHeight() as usize,
                    xOffset: slab,
                    yOffset: slabLine,
                };

                slabConnections.push(slabConnection);
            }
        }
    }

    let mut slabRunners = Vec::new();

    let frameCount: Arc<(Mutex<Option<u32>>, Condvar)> =
        Arc::new((Mutex::new(None), Condvar::new()));

    for slab in slabConnections {
        let frameCountClone = frameCount.clone();
        let secureImageHolderClone = secureImageHolder.clone();

        let thread = thread::spawn(move || {
            println!("Starting slab thread");
            let _ = sendSlice(slab, frameCountClone, secureImageHolderClone);
        });

        slabRunners.push(thread);
    }

    let (frameIdMutex, cvar) = &*frameCount;

    loop {
        let message = recv.recv();

        match message {
            Ok(ControlerMessage::Terminate) => return Ok(()),
            Ok(ControlerMessage::Tick) => (),
            Err(_) => return Ok(()),
        }

        println!("Received main tick");

        let imageHolderResult = secureImageHolder.write();
        let mut imageHolder;

        match imageHolderResult {
            Err(_) => return Err(()),
            Ok(h) => imageHolder = h,
        }

        let width = imageHolder.image_size.width;
        let height = imageHolder.image_size.height;

        if SpoutDXAdapter::AdapterReceiveImage(
            spout.as_mut().unwrap(),
            &mut imageHolder.image[..],
            width,
            height,
            false,
            false,
        ) {
            if SpoutDXAdapter::AdapterIsUpdated(spout.as_mut().unwrap()) {
                let imageHeight = SpoutDXAdapter::AdapterGetSenderHeight(spout.as_mut().unwrap());
                let imageWidth = SpoutDXAdapter::AdapterGetSenderWidth(spout.as_mut().unwrap());

                let imageSize = (imageHeight * imageWidth * 3) as usize;

                imageHolder.image = vec![0; imageSize];
                imageHolder.image_size.height = imageHeight;
                imageHolder.image_size.width = imageWidth;
            } else {
                drop(imageHolder);

                let frameIdResult = frameIdMutex.lock();

                let mut frameId;

                match frameIdResult {
                    Err(_) => return Err(()),
                    Ok(fi) => frameId = fi,
                }

                if let Some(fId) = *frameId {
                    *frameId = Some((fId + 1) % 25);
                } else {
                    *frameId = Some(0);
                }

                println!("Sending slab tick");

                cvar.notify_all();
            }
        }
    }
}

fn getTcpConnection(slabConnection: &SlabData) -> Result<TcpStream, ()> {
    loop {
        if let Some(endip) = u8::try_from(slabConnection.id).ok() {
            let socket = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, endip)), 9999);
            let connectionResult = TcpStream::connect_timeout(&socket, Duration::from_secs(10));

            let connection;
            match connectionResult {
                Err(_) => {
                    println!("Cannot connect to slab {}", slabConnection.id);
                    continue;
                }
                Ok(c) => connection = c,
            }

            match connection.set_write_timeout(Some(Duration::from_secs(5))) {
                Err(_) => println!("Cannot set timeout for slab {}", slabConnection.id),
                Ok(_) => return Ok(connection),
            }
        } else {
            return Err(());
        }
    }
}

fn sendSlice(
    slabConnection: SlabData,
    frameIdPair: Arc<(Mutex<Option<u32>>, Condvar)>,
    data: Arc<RwLock<ImageHolder>>,
) -> Result<(), ()> {
    let (frameIdMutex, cvar) = &*frameIdPair;

    let mut previousFrameId = None;

    loop {
        println!("Trying to connect slab");
        let mut tcpConnection = getTcpConnection(&slabConnection)?;

        loop {
            let frameIdResult = frameIdMutex.lock();

            let mut frameId;

            match frameIdResult {
                Err(_) => return Err(()),
                Ok(fi) => frameId = fi,
            }

            while *frameId == previousFrameId {
                match cvar.wait(frameId) {
                    Err(_) => return Err(()),
                    Ok(fi) => frameId = fi,
                }
            }

            previousFrameId = *frameId;

            let realFrameId;

            match *frameId {
                None => continue,
                Some(fId) => realFrameId = fId,
            }

            // Get relevant data
            let imageResult = data.read();

            let image;
            match imageResult {
                Err(_) => return Err(()),
                Ok(im) => image = im,
            }

            // 3 byte per pixel + 1 byte for the frame identifier
            let mut buffer = Vec::<u8>::with_capacity(
                3 * slabConnection.slabWidth * slabConnection.slabHeight + 1,
            );

            buffer[0] = realFrameId as u8;

            // Number of lines before the slab * the number of pixels in a line * the size of a pixel + the x shift pixel count of the beginnning of the slab
            let mut lineOffset = slabConnection.slabHeight * slabConnection.yOffset;
            let mut localFramePosition: usize = 1;
            let mut localOffset: usize;

            let imageLength = image.image.len();

            for _ in 0..slabConnection.slabHeight {
                for j in 0..slabConnection.slabWidth {
                    if lineOffset % 2 == 0 {
                        localOffset = (3 * j)
                            + lineOffset
                                * (image.image_size.width as usize)
                                * slabConnection.slabWidth
                                * 3
                            + 3 * slabConnection.slabWidth * slabConnection.xOffset;

                        if localOffset + 2 < imageLength {
                            buffer[localFramePosition + 2] = image.image[localOffset];
                            buffer[localFramePosition + 1] = image.image[localOffset + 1];
                            buffer[localFramePosition] = image.image[localOffset + 2];
                        }
                    } else {
                        localOffset = (lineOffset
                            * (image.image_size.width as usize)
                            * slabConnection.slabWidth
                            * 3
                            + 3 * slabConnection.slabWidth * (slabConnection.xOffset + 1)
                            - 1)
                            - (3 * j);

                        if localOffset < imageLength {
                            buffer[localFramePosition + 2] = image.image[localOffset - 2];
                            buffer[localFramePosition + 1] = image.image[localOffset - 1];
                            buffer[localFramePosition] = image.image[localOffset];
                        }
                    }

                    localFramePosition += 3;
                }

                lineOffset += 1;
            }

            if let Err(_) = tcpConnection.write_all(&buffer[..]) {
                break;
            }

            if let Err(_) = tcpConnection.flush() {
                break;
            }
        }
    }
}
