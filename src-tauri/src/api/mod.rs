use serde::Serialize;
use spout_rust::ffi as spoutlib;
use spoutlib::SpoutDXAdapter;
use tauri::Window;

use self::{
    ledwall_status_holder::{LedwallCommand, LedwallError},
    ledwallcontrol::LedwallControl,
    notification::Notification,
    slice::SliceData,
};

pub mod ledwall_status_holder;
pub mod ledwallcontrol;
pub mod notification;
pub mod slice;

use ledwall_status_holder::SafeLedwallStatusHolder;

#[derive(Serialize)]
pub struct SpoutName {
    value: String,
    label: String,
}

#[tauri::command]
pub fn fetchSpoutNames() -> Vec<SpoutName> {
    let mut spout = spoutlib::new_spout_adapter();

    let senderCount = SpoutDXAdapter::AdapterGetSenderCount(spout.as_mut().unwrap());

    let mut result = Vec::with_capacity(senderCount as usize);

    for i in 0..senderCount {
        let name = SpoutDXAdapter::AdapterGetSenderNameByIndex(spout.as_mut().unwrap(), i);

        result.push(SpoutName {
            value: name.clone(),
            label: name,
        });
    }

    return result;
}

#[tauri::command]
pub async fn startFrameSender(
    window: Window,
    slices: Vec<SliceData>,
    state: tauri::State<'_, SafeLedwallStatusHolder>,
) -> Result<(), LedwallError> {
    let mut holder;

    match state.lock() {
        Ok(state) => holder = state,
        Err(_) => return Err(LedwallError::LedwallPoisonError),
    }

    let result = holder.run(slices, window);

    holder.sendNotification(Notification {
        title: "".into(),
        message: "Starting frame sender".into(),
        kind: "info".into(),
        consoleOnly: true,
        origin: "Command Sender".into(),
    });

    match result {
        Ok(r) => return Ok(r),
        Err(r) => {
            return Err(r);
        }
    }
}

#[tauri::command]
pub async fn stopFrameSender(
    state: tauri::State<'_, SafeLedwallStatusHolder>,
) -> Result<(), LedwallError> {
    let mut holder;

    match state.lock() {
        Ok(state) => holder = state,
        Err(_) => return Err(LedwallError::LedwallPoisonError),
    }
    holder.sendNotification(Notification {
        title: "".into(),
        message: "Stoping frame sender".into(),
        kind: "info".into(),
        consoleOnly: true,
        origin: "Command Sender".into(),
    });

    return holder.stop();
}

#[tauri::command]
pub fn fetch_status(
    state: tauri::State<'_, SafeLedwallStatusHolder>,
) -> Result<LedwallControl, LedwallError> {
    let holder;

    match state.lock() {
        Ok(state) => holder = state,
        Err(_) => return Err(LedwallError::LedwallPoisonError),
    }

    return holder.getStatus();
}

#[tauri::command]
pub fn testSender(
    state: tauri::State<'_, SafeLedwallStatusHolder>,
    command: LedwallCommand,
) -> Result<(), LedwallError> {
    let holder;

    match state.lock() {
        Ok(state) => holder = state,
        Err(_) => return Err(LedwallError::LedwallPoisonError),
    }
    holder.sendNotification(Notification {
        title: "".into(),
        message: format!("Sending {} command", command),
        kind: "info".into(),
        consoleOnly: true,
        origin: "Command Sender".into(),
    });

    return holder.command(command);
}
