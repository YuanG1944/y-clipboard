use super::handler;
use crate::paste::switch_application_action;

#[tauri::command]
pub fn hide(window: tauri::Window) {
    if window.is_visible().unwrap() {
        window.hide().expect("failed to hide windows");
    }
}

#[tauri::command]
pub fn hide_with_switch_app(window: tauri::Window) {
    if window.is_visible().unwrap() {
        switch_application_action();
        window.hide().expect("failed to hide windows");
    }
}

#[tauri::command]
pub fn show(window: tauri::Window) {
    if !window.is_visible().unwrap() {
        window.show().expect("failed to show windows");
        handler::WindowHandler::repos(&window);
        window.set_focus().expect("failed to set window focus");
    }
}

#[tauri::command]
pub fn toggle_devtool(window: tauri::Window) {
    if !window.is_devtools_open() {
        window.open_devtools();
    } else {
        window.close_devtools();
    }
}
