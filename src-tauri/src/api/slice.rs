use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
pub struct SliceData {
    id: u32,
    spoutName: String,
    slabHeight: u32,
    slabWidth: u32,
    color: String,
    slabs: Vec<Vec<u32>>,
}

impl SliceData {
    pub fn getSpoutName(&self) -> String {
        return self.spoutName.clone();
    }

    pub fn getSlab(&self) -> Vec<Vec<u32>> {
        return self.slabs.clone();
    }

    pub fn getSliceId(&self) -> u32 {
        return self.id;
    }

    pub fn getSlabWidth(&self) -> u32 {
        return self.slabWidth;
    }

    pub fn getSlabHeight(&self) -> u32 {
        return self.slabHeight;
    }

    pub fn getHeight(&self) -> usize {
        if self.slabs.len() == 0 {
            return 0;
        } else {
            return self.slabs[0].len();
        }
    }

    pub fn getWidth(&self) -> usize {
        return self.slabs.len();
    }
}
