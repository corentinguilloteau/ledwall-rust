use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[derive(PartialEq)]
pub enum LedwallControlStatusEnum {
    Displaying,
    Stopped,
}

#[derive(Serialize)]
pub struct LedwallControl {
    pub status: LedwallControlStatusEnum,
}

impl LedwallControl {
    pub fn new() -> Self {
        return LedwallControl {
            status: LedwallControlStatusEnum::Stopped,
        };
    }
}
