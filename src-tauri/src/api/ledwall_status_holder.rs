use std::sync::{mpsc::Sender, Arc, RwLock};

use crate::controler::{createControler, ControlerMessage};

use super::{
    ledwallcontrol::{LedwallControl, LedwallControlStatusEnum},
    slice::SliceData,
};

pub struct LedwallStatusHolder {
    status: Arc<RwLock<LedwallControl>>,
    slices: Vec<SliceData>,
    thread: Option<tokio::task::JoinHandle<()>>,
    messageSender: Option<Sender<ControlerMessage>>,
}

impl LedwallStatusHolder {
    pub fn new() -> Self {
        LedwallStatusHolder {
            status: Arc::new(RwLock::new(LedwallControl {
                status: LedwallControlStatusEnum::Stopped,
            })),
            slices: Vec::new(),
            thread: None,
            messageSender: None,
        }
    }

    pub fn run(mut self, slicesData: Vec<SliceData>) -> Result<(), ()> {
        let statusResult = self.status.write();

        let mut status;

        match statusResult {
            Err(_) => return Err(()),
            Ok(s) => status = s,
        }

        if status.status == LedwallControlStatusEnum::Stopped {
            let localSlices = slicesData.to_vec();

            let (sender, threadHandle) = createControler(localSlices);

            self.thread = Some(threadHandle);
            self.messageSender = Some(sender);
            self.slices = slicesData;

            status.status = LedwallControlStatusEnum::Displaying;

            return Ok(());
        } else {
            return Err(());
        }
    }

    pub fn stop(mut self) -> Result<(), ()> {
        let statusResult = self.status.write();
        let mut status;

        match statusResult {
            Err(_) => return Err(()),
            Ok(s) => status = s,
        }

        if status.status == LedwallControlStatusEnum::Displaying {
            if let Some(sender) = self.messageSender {
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
