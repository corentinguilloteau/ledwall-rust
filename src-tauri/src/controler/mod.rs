use std::{
    net::{IpAddr, Ipv4Addr, SocketAddr},
    sync::mpsc::{Receiver, TryRecvError},
    time::{Duration, Instant},
};

use crate::api::slice::SliceData;
use cxx::let_cxx_string;
use spout_rust::ffi::{self as spoutlib, SpoutDXAdapter};
use tokio::{
    self,
    net::TcpStream,
    sync::watch,
    time::{sleep, timeout},
};

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
    task: tokio::task::JoinHandle<()>,
    taskChannel: tokio::sync::mpsc::Sender<ControlerMessage>,
}

pub async fn runControlerThread(receiver: Receiver<ControlerMessage>, slices: Vec<SliceData>) {
    let mut tasks = Vec::with_capacity(slices.len());

    let (tasksSender, mut tasksReceiver) = tokio::sync::mpsc::channel(slices.len());

    for slice in slices {
        let (taskChannel, taskChannelReceiver) = tokio::sync::mpsc::channel(10);

        let localTaskSender = tasksSender.clone();
        let localSlice = slice.clone();

        let task = tokio::spawn(async move {
            match runSliceTask(taskChannelReceiver, localSlice).await {
                Ok(_) => (),
                Err(_) => {
                    let _ = localTaskSender.send(ControlerMessage::Terminate).await;
                }
            }
        });

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
                terminate(tasks).await;
                return;
            }
            Err(TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                terminate(tasks).await;
                return;
            }
            _ => (),
        }

        let message = tasksReceiver.try_recv();

        match message {
            Err(tokio::sync::mpsc::error::TryRecvError::Disconnected) => {
                terminate(tasks).await;
                return;
            }
            Err(tokio::sync::mpsc::error::TryRecvError::Empty) => (),
            Ok(ControlerMessage::Terminate) => {
                terminate(tasks).await;
                return;
            }
            _ => (),
        }

        for i in 0..tasks.len() {
            let _ = tasks[i].taskChannel.try_send(ControlerMessage::Tick);
        }

        let runtime = start.elapsed();

        if let Some(remaining) = wait_time.checked_sub(runtime) {
            sleep(remaining).await;
        } else {
            eprintln!("Main clock drift");
        }
    }
}

async fn terminate(tasks: Vec<TaskHolder>) {
    for task in tasks {
        match task.taskChannel.try_send(ControlerMessage::Terminate) {
            Err(tokio::sync::mpsc::error::TrySendError::Closed(_)) => (),
            _ => {
                let _ = task.task.await;
            }
        }
    }
}

struct SlabConnection {
    id: u32,
    client: Option<TcpStream>,
}

async fn runSliceTask(
    mut recv: tokio::sync::mpsc::Receiver<ControlerMessage>,
    slice: SliceData,
) -> Result<(), ()> {
    let mut spout = spoutlib::new_spout_adapter();

    let_cxx_string!(spout_name = slice.getSpoutName());

    if !SpoutDXAdapter::AdapterOpenDirectX11(spout.as_mut().unwrap()) {
        println!("Unable to open DX11, aborting !");

        return Err(());
    }

    SpoutDXAdapter::AdapterSetReceiverName(spout.as_mut().unwrap(), spout_name.as_mut());

    let mut imageHolder = ImageHolder {
        image: Vec::new(),
        image_size: ImageSize {
            height: 0,
            width: 0,
        },
    };

    let mut slabConnections = Vec::new();

    for slabLine in slice.getSlab() {
        for slab in slabLine {
            let slabConnection = SlabConnection {
                id: slab,
                client: None,
            };

            slabConnections.push(slabConnection);
        }
    }

    let mut slabRunners = Vec::new();

    let (watchSender, watchReceiver) = watch::channel(());

    for slab in slabConnections {
        slabRunners.push(sendSlice(slab, watchReceiver.clone()))
    }

    loop {
        let message = recv.recv().await;

        match message {
            Some(ControlerMessage::Terminate) => return Ok(()),
            Some(ControlerMessage::Tick) => (),
            None => return Ok(()),
        }

        if SpoutDXAdapter::AdapterReceiveImage(
            spout.as_mut().unwrap(),
            &mut imageHolder.image[..],
            imageHolder.image_size.width,
            imageHolder.image_size.height,
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
                // Put data in shared object

                watchSender.send(());
            }
        }
    }
}

async fn getTcpConnection(slabConnection: &SlabConnection) -> Result<TcpStream, ()> {
    loop {
        if let Some(endip) = u8::try_from(slabConnection.id).ok() {
            let socket = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, endip)), 9999);
            let connection = TcpStream::connect(socket);

            let timeoutResult = timeout(Duration::from_secs(10), connection).await;

            match timeoutResult {
                Err(_) => println!("Cannot connect to slab {}", slabConnection.id),
                Ok(connection) => match connection {
                    Err(_) => println!("Cannot connect to slab {}", slabConnection.id),
                    Ok(c) => return Ok(c),
                },
            }
        } else {
            return Err(());
        }
    }
}

async fn sendSlice(
    slabConnection: SlabConnection,
    mut receiver: watch::Receiver<()>, /*, data*/
) -> Result<(), ()> {
    loop {
        let tcpConnection = getTcpConnection(&slabConnection).await?;

        loop {
            let has_changed;

            match receiver.has_changed() {
                Err(_) => return Err(()),
                Ok(result) => has_changed = result,
            }

            if has_changed {
                receiver.changed().await;
            } else {
                match receiver.changed().await {
                    Err(_) => return Err(()),
                    Ok(_) => (),
                }

                // Get relevant data

                if let Err(_) = tcpConnection.writable().await {
                    break;
                }

                // Send data
                //tcpConnection.try_write()
            }
        }
    }
}
