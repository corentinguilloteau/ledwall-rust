use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
pub struct SliceData {
    spoutName: String,
    slabHeight: u32,
    slabWidth: u32,
    color: String,
    slabs: Vec<Vec<u32>>,
}

impl SliceData {
    pub fn getSpoutName(&self) -> String {
        return self.spoutName;
    }

    pub fn getSlab(&self) -> Vec<Vec<u32>> {
        return self.slabs;
    }
}
