#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#![allow(non_snake_case)]
use cxx::let_cxx_string;
use image::codecs::bmp::BmpEncoder;
use spout_rust::ffi as spoutlib;
use spoutlib::SpoutDXAdapter;
use std::{
    sync::{atomic::AtomicUsize, Arc, Mutex},
    thread,
    time::{Duration, Instant},
    vec,
};

struct ImageSize {
    height: u32,
    width: u32,
}

struct ImageHolder {
    image: Vec<u8>,
    image_size: ImageSize,
}

type SafeImageHolder = Arc<Mutex<ImageHolder>>;

#[tauri::command]
fn get_image(data: tauri::State<SafeImageHolder>) -> String {
    let mut bmpImage: Vec<u8> = Vec::new();

    let mut imageEncoder = BmpEncoder::new(&mut bmpImage);

    let image = data.lock().unwrap();

    imageEncoder.encode(
        &image.image,
        image.image_size.width,
        image.image_size.height,
        image::ColorType::Rgb8,
    );

    drop(image);

    let imageBase64 = base64::encode(&bmpImage);

    return format!("{}{}", "data:image/bmp;base64,", imageBase64);
}

fn spoutThreadMain(safeImageHolder: SafeImageHolder) {
    let mut spout = spoutlib::new_spout_adapter();

    let_cxx_string!(spout_name = "Arena - test2");

    if !SpoutDXAdapter::AdapterOpenDirectX11(spout.as_mut().unwrap()) {
        println!("Unable to open DX11, aborting !");

        return;
    }

    SpoutDXAdapter::AdapterSetReceiverName(spout.as_mut().unwrap(), spout_name.as_mut());

    loop {
        let start = Instant::now();
        let wait_time = Duration::from_millis(100);

        {
            let mut imageHolder = safeImageHolder.lock().unwrap();

            let imageWidth = imageHolder.image_size.width;
            let imageHeight = imageHolder.image_size.height;

            if SpoutDXAdapter::AdapterReceiveImage(
                spout.as_mut().unwrap(),
                &mut imageHolder.image[..],
                imageWidth,
                imageHeight,
                false,
                false,
            ) {
                if SpoutDXAdapter::AdapterIsUpdated(spout.as_mut().unwrap()) {
                    let imageHeight =
                        SpoutDXAdapter::AdapterGetSenderHeight(spout.as_mut().unwrap());
                    let imageWidth = SpoutDXAdapter::AdapterGetSenderWidth(spout.as_mut().unwrap());

                    let imageSize = (imageHeight * imageWidth * 3) as usize;

                    imageHolder.image = vec![0; imageSize];
                    imageHolder.image_size.height = imageHeight;
                    imageHolder.image_size.width = imageWidth;
                } else {
                }
            }
        }

        let runtime = start.elapsed();

        if let Some(remaining) = wait_time.checked_sub(runtime) {
            thread::sleep(remaining);
        } else {
            println!("Drift");
        }
    }
}

fn main() {
    let safeImageHolder = Arc::new(Mutex::new(ImageHolder {
        image: vec![],
        image_size: ImageSize {
            width: 0,
            height: 0,
        },
    }));

    let spoutSafeImageHolder = Arc::clone(&safeImageHolder);

    let spoutThread = thread::spawn(move || {
        spoutThreadMain(spoutSafeImageHolder);
    });

    tauri::Builder::default()
        .manage(safeImageHolder)
        .invoke_handler(tauri::generate_handler![get_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
