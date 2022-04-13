use serde::Serialize;
use spout_rust::ffi as spoutlib;
use spoutlib::SpoutDXAdapter;
use tauri::Window;

use self::{ledwall_status_holder::LedwallError, ledwallcontrol::LedwallControl, slice::SliceData};

pub mod ledwall_status_holder;
pub mod ledwallcontrol;
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
        Err(_) => return Err(LedwallError::LedwallIOCustomError),
    }

    return holder.run(slices, window);
}

#[tauri::command]
pub async fn stopFrameSender(state: tauri::State<'_, SafeLedwallStatusHolder>) -> Result<(), ()> {
    let mut holder;

    println!("Stop call");

    match state.lock() {
        Ok(state) => holder = state,
        Err(_) => return Err(()),
    }

    return holder.stop();
}

#[tauri::command]
pub fn fetch_status(
    state: tauri::State<'_, SafeLedwallStatusHolder>,
) -> Result<LedwallControl, ()> {
    let holder;

    match state.lock() {
        Ok(state) => holder = state,
        Err(_) => return Err(()),
    }

    return holder.getStatus();
}
