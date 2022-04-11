use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
#[derive(PartialEq, Debug, Clone, Copy)]
pub enum LedwallControlStatusEnum {
    Displaying,
    Stopped,
}
#[derive(Serialize, Debug, Clone, Copy)]
pub struct LedwallControl {
    pub status: LedwallControlStatusEnum,
}
