#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use image::codecs::bmp::BmpEncoder;
use std::{
    sync::{atomic::AtomicUsize, Arc},
    vec,
};

struct ImageHolder(Arc<Vec<u8>>);

struct ImageSize {
    height: u32,
    width: u32,
}

static IMAGE_SIZE: ImageSize = ImageSize {
    height: 4,
    width: 4,
};

#[tauri::command]
fn get_image(data: tauri::State<ImageHolder>) -> String {
    let rData = vec![0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255];

    let mut bmpImage: Vec<u8> = Vec::new();

    let mut imageEncoder = BmpEncoder::new(&mut bmpImage);

    imageEncoder.encode(&rData, 2, 2, image::ColorType::Rgb8);

    let imageBase = base64::encode(&bmpImage);

    println!("{}", imageBase);

    return format!("{}{}", "data:image/bmp;base64,", imageBase);
}

fn main() {
    tauri::Builder::default()
        .manage(ImageHolder(Arc::new(vec![
            0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255,
            0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255,
        ])))
        .invoke_handler(tauri::generate_handler![get_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
