// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lib::window;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            window::show,
            window::hide,
            window::toggle_devtool,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
