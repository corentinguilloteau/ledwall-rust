use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[derive(PartialEq, Debug)]
pub enum LedwallControlStatusEnum {
    Displaying,
    Stopped,
}

#[derive(Debug)]
pub struct LedwallControl {
    pub status: LedwallControlStatusEnum,
}
