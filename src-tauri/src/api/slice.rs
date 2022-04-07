use std::{sync::mpsc::Sender, thread::JoinHandle};

use serde::Deserialize;

use crate::controler::ControlerMessage;

#[derive(Deserialize, Clone)]
pub struct SliceData {
    spoutName: String,
    slabHeight: u32,
    slabWidth: u32,
    color: String,
    slabs: Vec<Vec<u32>>,
}
