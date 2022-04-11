use std::sync::{
    mpsc::{channel, Sender},
    Arc, Mutex, RwLock,
};

use tauri::Window;

use crate::controler::{runControlerThread, ControlerMessage};

use super::{
    ledwallcontrol::{LedwallControl, LedwallControlStatusEnum},
    slice::SliceData,
};

pub struct LedwallStatusHolder {
    status: Arc<RwLock<LedwallControl>>,
    slices: Vec<SliceData>,
    thread: Option<tokio::task::JoinHandle<()>>,
    messageSender: Option<Sender<ControlerMessage>>,
    window: Option<Arc<Window>>,
}

pub type SafeLedwallStatusHolder = Arc<Mutex<LedwallStatusHolder>>;

impl LedwallStatusHolder {
    pub fn new() -> Self {
        LedwallStatusHolder {
            status: Arc::new(RwLock::new(LedwallControl {
                status: LedwallControlStatusEnum::Stopped,
            })),
            slices: Vec::new(),
            thread: None,
            messageSender: None,
            window: None,
        }
    }

    pub fn run(&mut self, slicesData: Vec<SliceData>, window: Window) -> Result<(), ()> {
        let statusHandle = self.status.clone();
        let statusResult = statusHandle.write();

        let mut status;

        self.window = Some(Arc::new(window));

        match statusResult {
            Err(_) => return Err(()),
            Ok(s) => status = s,
        }

        if status.status == LedwallControlStatusEnum::Stopped {
            let localSlices = slicesData.to_vec();

            let sender = self.createControler(localSlices);

            self.messageSender = Some(sender);
            self.slices = slicesData;

            status.status = LedwallControlStatusEnum::Displaying;

            return Ok(());
        } else {
            return Err(());
        }
    }

    fn createControler(&mut self, slices: Vec<SliceData>) -> Sender<ControlerMessage> {
        let (sender, receiver) = channel();

        let statusHandle = self.status.clone();
        let windowHandle = self.window.clone();

        tokio::spawn(async move {
            runControlerThread(receiver, slices).await;
            if let Ok(mut status) = statusHandle.write() {
                status.status = LedwallControlStatusEnum::Stopped;
                if let Some(window) = windowHandle {
                    let _ = window.emit::<String>("backend-data-update", "status".into());
                }
            }
        });

        return sender;
    }

    pub fn stop(&mut self) -> Result<(), ()> {
        let statusResult = self.status.write();
        let mut status;

        println!("Stopping");

        match statusResult {
            Err(_) => return Err(()),
            Ok(s) => status = s,
        }

        println!("Status: {:?}", *status);

        if status.status == LedwallControlStatusEnum::Displaying {
            if let Some(sender) = &self.messageSender {
                match sender.send(ControlerMessage::Terminate) {
                    Err(_) => return Err(()),
                    _ => (()),
                }

                self.thread = None;
                self.messageSender = None;

                status.status = LedwallControlStatusEnum::Stopped;
            }

            return Ok(());
        } else {
            return Err(());
        }
    }
}
