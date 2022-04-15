use std::{
    net::UdpSocket,
    sync::{
        mpsc::{channel, Sender},
        Arc, Mutex, RwLock,
    },
    thread::{self, JoinHandle},
};

use derive_more::From;
use serde::{Deserialize, Serialize};
use tauri::Window;

use crate::controler::{ledwallRunner, ControlerMessage, ToLedwallResult};

use super::{
    ledwallcontrol::{LedwallControl, LedwallControlStatusEnum},
    slice::SliceData,
};

pub struct LedwallStatusHolder {
    status: Arc<RwLock<LedwallControl>>,
    slices: Vec<SliceData>,
    thread: Option<JoinHandle<()>>,
    messageSender: Option<Sender<ControlerMessage>>,
    window: Option<Arc<Window>>,
}

#[derive(From, Serialize)]
pub enum LedwallError {
    #[serde(skip_serializing)]
    LedwallIOError(std::io::Error),
    #[from(ignore)]
    LedwallPoisonError,
    #[from(ignore)]
    LedwallCustomError,
    #[from(ignore)]
    LedwallFatalError,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum LedwallCommand {
    Live,
    Shutdown,
    Restart,
    Reboot,
    Number,
    Version,
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

    pub fn getStatus(&self) -> Result<LedwallControl, ()> {
        match self.status.read() {
            Ok(res) => return Ok(*res),
            Err(_) => return Err(()),
        }
    }

    pub fn run(&mut self, slicesData: Vec<SliceData>, window: Window) -> Result<(), LedwallError> {
        let statusHandle = self.status.clone();
        let statusResult = statusHandle.write();

        let mut status;

        self.window = Some(Arc::new(window));

        match statusResult {
            Err(_) => return Err(LedwallError::LedwallCustomError),
            Ok(s) => status = s,
        }

        if status.status == LedwallControlStatusEnum::Stopped {
            let localSlices = slicesData.to_vec();

            let sender = self.createControler(localSlices)?;

            self.messageSender = Some(sender);
            self.slices = slicesData;

            status.status = LedwallControlStatusEnum::Displaying;

            if let Some(window) = &self.window {
                let _ = window.emit::<String>("backend-data-update", "status".into());
            }

            return Ok(());
        } else {
            return Err(LedwallError::LedwallCustomError);
        }
    }

    fn createControler(
        &mut self,
        slices: Vec<SliceData>,
    ) -> Result<Sender<ControlerMessage>, LedwallError> {
        let (sender, receiver) = channel();

        let statusHandle = self.status.clone();
        let windowHandle = self.window.clone();

        let socket = UdpSocket::bind("127.0.0.1:8888")?;
        socket.set_broadcast(true)?;
        socket.connect("127.0.0.255:8888")?;

        LedwallStatusHolder::sendCommand(LedwallCommand::Live, socket.try_clone()?)?;

        let socketClone = socket.try_clone()?;

        self.thread = Some(thread::spawn(move || {
            ledwallRunner(receiver, slices, socketClone);

            if let Ok(mut status) = statusHandle.write() {
                status.status = LedwallControlStatusEnum::Stopped;
                if let Some(window) = windowHandle {
                    let _ = window.emit::<String>("backend-data-update", "status".into());
                }
            }
        }));

        return Ok(sender);
    }

    pub fn command(&self, command: LedwallCommand) -> Result<(), LedwallError> {
        let status = self.status.write().toLedwallResult()?;

        if status.status == LedwallControlStatusEnum::Stopped {
            let socket = UdpSocket::bind("127.0.0.1:8888")?;
            socket.set_broadcast(true)?;
            socket.connect("127.0.0.255:8888")?;

            return LedwallStatusHolder::sendCommand(command, socket);
        } else {
            return Err(LedwallError::LedwallCustomError);
        }
    }

    fn sendCommand(command: LedwallCommand, socket: UdpSocket) -> Result<(), LedwallError> {
        let commandChar: char;

        match command {
            LedwallCommand::Live => commandChar = 'l',
            LedwallCommand::Shutdown => commandChar = 'p',
            LedwallCommand::Restart => commandChar = 's',
            LedwallCommand::Reboot => commandChar = 'r',
            LedwallCommand::Number => commandChar = 'n',
            LedwallCommand::Version => commandChar = 'v',
        }

        println!("Command is {}", commandChar);

        socket.send(&[commandChar as u8])?;
        socket.send(&[commandChar as u8])?;

        return Ok(());
    }

    pub fn stop(&mut self) -> Result<(), LedwallError> {
        let status = self.status.read().toLedwallResult()?;

        if status.status == LedwallControlStatusEnum::Displaying {
            drop(status);
            if let Some(sender) = &self.messageSender {
                sender.send(ControlerMessage::Terminate).toLedwallResult()?;

                if let Some(thread) = self.thread.take() {
                    thread.join().toLedwallResult()?;
                }
                self.thread = None;
                self.messageSender = None;
                let mut status = self.status.write().toLedwallResult()?;
                status.status = LedwallControlStatusEnum::Stopped;
            }

            return Ok(());
        } else {
            return Err(LedwallError::LedwallCustomError);
        }
    }
}
