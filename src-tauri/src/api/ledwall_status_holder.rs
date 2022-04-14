use std::{
    net::UdpSocket,
    sync::{
        mpsc::{channel, Sender},
        Arc, Mutex, RwLock,
    },
    thread::{self, JoinHandle},
};

use derive_more::From;
use serde::Serialize;
use tauri::Window;

use crate::controler::{ledwallRunner, ControlerMessage};

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
    commandSocket: Option<UdpSocket>,
}

#[derive(From, Serialize)]
pub enum LedwallError {
    #[serde(skip_serializing)]
    LedwallIOError(std::io::Error),
    #[from(ignore)]
    LedwallPoisonError,
    #[from(ignore)]
    LedwallCustomError,
}

pub enum LedwallCommand {
    Live,
    Shutdown,
    Restart,
    ShowNumber,
    ShowVersion,
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
            commandSocket: None,
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

        let socket = UdpSocket::bind("127.0.0.1:8888")?;
        socket.set_broadcast(true)?;
        socket.connect("127.0.0.255:8888")?;

        self.commandSocket = Some(socket);

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

        let commandSocket = self
            .commandSocket
            .as_ref()
            .ok_or(LedwallError::LedwallCustomError)?
            .try_clone()?;

        self.thread = Some(thread::spawn(move || {
            println!("Starting controler");
            ledwallRunner(receiver, slices, commandSocket.try_clone().unwrap());

            println!("Sending live command");

            LedwallStatusHolder::sendCommand(LedwallCommand::Live, commandSocket);

            if let Ok(mut status) = statusHandle.write() {
                status.status = LedwallControlStatusEnum::Stopped;
                if let Some(window) = windowHandle {
                    let _ = window.emit::<String>("backend-data-update", "status".into());
                }
            }
        }));

        return Ok(sender);
    }

    fn sendCommand(command: LedwallCommand, socket: UdpSocket) -> Result<(), LedwallError> {
        let commandChar: char;

        match command {
            LedwallCommand::Live => commandChar = 'l',
            LedwallCommand::Shutdown => commandChar = 's',
            LedwallCommand::Restart => commandChar = 'r',
            LedwallCommand::ShowNumber => commandChar = 'n',
            LedwallCommand::ShowVersion => commandChar = 'v',
        }

        socket.send(&[commandChar as u8])?;
        socket.send(&[commandChar as u8])?;

        return Ok(());
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
