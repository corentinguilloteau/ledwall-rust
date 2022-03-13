use std::f32::consts::E;

use cxx::let_cxx_string;
use spout_rust::ffi as spoutlib;
use spoutlib::SpoutDXAdapter;

fn main() {
    let mut spout = spoutlib::new_spout_adapter();

    let_cxx_string!(spout_name = "Arena - test2");

    if !SpoutDXAdapter::AdapterOpenDirectX11(spout.as_mut().unwrap()) {
        println!("Unable to open DX11, aborting !");

        return;
    }

    SpoutDXAdapter::AdapterSetReceiverName(spout.as_mut().unwrap(), spout_name.as_mut());

    println!(
        "Updated: {}",
        SpoutDXAdapter::AdapterIsUpdated(spout.as_mut().unwrap())
    );

    let mut pixels: [u8; 201 * 106 * 4] = [0; 201 * 106 * 4];

    println!(
        "Receive: {}",
        SpoutDXAdapter::AdapterReceiveImage(
            spout.as_mut().unwrap(),
            &mut pixels,
            201,
            106,
            false,
            false
        )
    );

    let height = SpoutDXAdapter::AdapterGetSenderHeight(spout.as_mut().unwrap());
    let width = SpoutDXAdapter::AdapterGetSenderWidth(spout.as_mut().unwrap());

    println!("Height: {}", height);
    println!("Width: {}", width);

    let pixels = &mut pixels;

    loop {
        if (SpoutDXAdapter::AdapterReceiveImage(
            spout.as_mut().unwrap(),
            pixels,
            201,
            106,
            false,
            false,
        )) {
            if (SpoutDXAdapter::AdapterIsUpdated(spout.as_mut().unwrap())) {
                println!("Udpated")
            } else {
                println!(
                    "Center pixel R:{} G:{} B:{}",
                    pixels[100], pixels[101], pixels[102]
                )
            }
        } else {
            println!("Nothing new");
        }
    }
}
