use std::{
    fmt::Display,
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
use thiserror::Error;

use crate::controler::{ledwallRunner, ControlerMessage, ToLedwallResult};

use super::{
    ledwallcontrol::{LedwallControl, LedwallControlStatusEnum},
    notification::Notification,
    slice::SliceData,
};

pub struct LedwallStatusHolder {
    status: Arc<RwLock<LedwallControl>>,
    slices: Vec<SliceData>,
    thread: Option<JoinHandle<()>>,
    messageSender: Option<Sender<ControlerMessage>>,
    window: Option<Arc<Window>>,
    notificationSender: Sender<Notification>,
}

#[derive(From, Serialize, Error, Debug)]
pub enum LedwallError {
    #[serde(skip_serializing)]
    #[error("Une erreur réseau a été détectée.")]
    LedwallIOError(std::io::Error),
    #[error("The core has been corrupted, please restart the app.")]
    #[from(ignore)]
    LedwallPoisonError,
    #[from(ignore)]
    #[error("Les images sont déjà en cours d'affichage.")]
    LedwallNotStopped,
    #[from(ignore)]
    #[error("Impossible d'envoyer une commande tant que le mur de led est live.")]
    NoCommandWhileRunning,
    #[from(ignore)]
    #[error("Le mur de led est déjà arrêté.")]
    LedwallNotRunning,
    #[from(ignore)]
    #[error("Erreur liée à DX11.")]
    LedwallDX11,
    #[from(ignore)]
    #[error("Erreur de connection TCP à la dalle {0}.")]
    SlabTCP(u32),
    #[from(ignore)]
    #[error("Erreur de connection TCP à la dalle {0}.")]
    SlabTCPTimeout(u32),
    #[from(ignore)]
    #[error("Delai d'attente de la synchronisation des frame dépassé.")]
    FrameSyncTimeout(u32),
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

impl Display for LedwallCommand {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match *self {
            LedwallCommand::Live => write!(f, "live"),
            LedwallCommand::Shutdown => write!(f, "shutdown"),
            LedwallCommand::Restart => write!(f, "restart"),
            LedwallCommand::Reboot => write!(f, "reboot"),
            LedwallCommand::Number => write!(f, "show number"),
            LedwallCommand::Version => write!(f, "show version"),
        }
    }
}

pub type SafeLedwallStatusHolder = Arc<Mutex<LedwallStatusHolder>>;

impl LedwallStatusHolder {
    pub fn new(notificationSender: Sender<Notification>) -> Self {
        LedwallStatusHolder {
            status: Arc::new(RwLock::new(LedwallControl {
                status: LedwallControlStatusEnum::Stopped,
            })),
            slices: Vec::new(),
            thread: None,
            messageSender: None,
            window: None,
            notificationSender: notificationSender,
        }
    }

    pub fn sendNotification(&self, notif: Notification) {
        let _r = self.notificationSender.send(notif);
    }

    pub fn getStatus(&self) -> Result<LedwallControl, LedwallError> {
        match self.status.read() {
            Ok(res) => return Ok(*res),
            Err(_) => return Err(LedwallError::LedwallPoisonError),
        }
    }

    pub fn run(&mut self, slicesData: Vec<SliceData>, window: Window) -> Result<(), LedwallError> {
        let statusHandle = self.status.clone();
        let statusResult = statusHandle.write();

        let mut status;

        self.window = Some(Arc::new(window));

        match statusResult {
            Err(_) => return Err(LedwallError::LedwallPoisonError),
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
            return Err(LedwallError::LedwallNotStopped);
        }
    }

    fn createControler(
        &mut self,
        slices: Vec<SliceData>,
    ) -> Result<Sender<ControlerMessage>, LedwallError> {
        let (sender, receiver) = channel();

        let statusHandle = self.status.clone();
        let windowHandle = self.window.clone();

        let socket = UdpSocket::bind(("0.0.0.0", 0))?;
        socket.set_broadcast(true)?;
        socket.connect(("192.168.1.255", 8888))?;

        LedwallStatusHolder::sendCommand(LedwallCommand::Live, socket.try_clone()?)?;

        let socketClone = socket.try_clone()?;
        let notificationSenderClone = self.notificationSender.clone();

        self.thread = Some(thread::spawn(move || {
            ledwallRunner(receiver, notificationSenderClone, slices, socketClone);

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
        let status = self
            .status
            .write()
            .toLedwallResult(LedwallError::LedwallPoisonError)?;

        if status.status == LedwallControlStatusEnum::Stopped {
            let socket = UdpSocket::bind(("0.0.0.0", 0))?;
            socket.set_broadcast(true)?;
            socket.connect(("192.168.1.255", 8888))?;

            return LedwallStatusHolder::sendCommand(command, socket);
        } else {
            return Err(LedwallError::NoCommandWhileRunning);
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
        let status = self
            .status
            .read()
            .toLedwallResult(LedwallError::LedwallPoisonError)?;

        if status.status == LedwallControlStatusEnum::Displaying {
            drop(status);
            if let Some(sender) = &self.messageSender {
                sender
                    .send(ControlerMessage::Terminate)
                    .toLedwallResult(LedwallError::LedwallPoisonError)?;

                if let Some(thread) = self.thread.take() {
                    thread
                        .join()
                        .toLedwallResult(LedwallError::LedwallPoisonError)?;
                }
                self.thread = None;
                self.messageSender = None;
                let mut status = self
                    .status
                    .write()
                    .toLedwallResult(LedwallError::LedwallPoisonError)?;
                status.status = LedwallControlStatusEnum::Stopped;
            }

            return Ok(());
        } else {
            return Err(LedwallError::LedwallNotRunning);
        }
    }
}
