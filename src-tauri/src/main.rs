#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#![allow(non_snake_case)]
mod api;
mod controler;
use api::ledwall_status_holder::LedwallStatusHolder;
use std::{
    sync::{mpsc::channel, Arc, Mutex},
    thread, vec,
};
use tauri::Manager;

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    // Show main window
    window.get_window("main").unwrap().show().unwrap();
}
struct ImageSize {
    height: u32,
    width: u32,
}

struct ImageHolder {
    image: Vec<u8>,
    image_size: ImageSize,
}

fn main() {
    let safeImageHolder = Arc::new(Mutex::new(ImageHolder {
        image: vec![],
        image_size: ImageSize {
            width: 0,
            height: 0,
        },
    }));

    let (notificationSender, notificationReceiver) = channel();

    let safeLedwallStatusHolder =
        Arc::new(Mutex::new(LedwallStatusHolder::new(notificationSender)));

    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();

            thread::spawn(move || loop {
                let notification = notificationReceiver.recv();

                let notif;

                match notification {
                    Ok(n) => notif = n,
                    Err(_) => continue,
                };

                match main_window.emit_all("backend-notification", notif) {
                    Ok(_) => (),
                    Err(_) => (),
                };
            });
            Ok(())
        })
        .manage(safeImageHolder)
        .manage(safeLedwallStatusHolder)
        .invoke_handler(tauri::generate_handler![
            api::fetchSpoutNames,
            api::stopFrameSender,
            api::startFrameSender,
            api::fetch_status,
            api::testSender,
            close_splashscreen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
