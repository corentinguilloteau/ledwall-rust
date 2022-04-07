use std::time::Duration;

use async_std::task::sleep;
use serde::Serialize;
use spout_rust::ffi as spoutlib;
use spoutlib::SpoutDXAdapter;

pub mod ledwall_status_holder;
pub mod ledwallcontrol;
pub mod slice;

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
pub async fn testRPCStatusSuccess() -> Result<(), ()> {
    sleep(Duration::from_secs(3)).await;

    return Err(());
}

#[tauri::command]
pub async fn testRPCStatusErrore() -> Result<(), ()> {
    sleep(Duration::from_secs(3)).await;

    return Err(());
}
