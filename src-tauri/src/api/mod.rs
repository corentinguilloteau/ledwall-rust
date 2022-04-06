use serde::Serialize;
use spout_rust::ffi as spoutlib;
use spoutlib::SpoutDXAdapter;

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
