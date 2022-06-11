use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct Notification {
    pub title: String,
    pub message: String,
    pub kind: String,
    pub consoleOnly: bool,
    pub origin: String,
}
