// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lib::window;

fn main() {
    tauri::Builder::default()
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Moved(_) => window::resized(event.window()),
            tauri::WindowEvent::Focused(focused) => {
                if !focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            window::show,
            window::hide,
            window::toggle_devtool,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
