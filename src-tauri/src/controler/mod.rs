use std::{
    sync::mpsc::{Receiver, TryRecvError},
    time::{Duration, Instant},
};

use crate::api::slice::SliceData;
use tokio::{self, time::sleep};

pub enum ControlerMessage {
    Terminate,
    Tick,
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

async fn runSliceTask(
    mut recv: tokio::sync::mpsc::Receiver<ControlerMessage>,
    slice: SliceData,
) -> Result<(), ()> {
    loop {
        let message = recv.recv().await;

        match message {
            Some(ControlerMessage::Terminate) => return Ok(()),
            Some(ControlerMessage::Tick) => (),
            None => return Ok(()),
        }

        // Actual code
        println!("Send frame (placeholder)");
    }
}
