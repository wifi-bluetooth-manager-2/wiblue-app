// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use wlan::get_interfaces::get_interfaces;

pub mod wlan;

fn main() {
    let interfaces = match get_interfaces() {
        Ok(iface) => iface,
        Err(_) => return,
    };

    for i in interfaces {
        println!("{}", i);
    }
    wiblue_lib::run();
}
