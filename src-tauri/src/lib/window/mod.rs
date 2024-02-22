use tauri::{Position, Size};

use crate::device::get_cursor_monitor;

fn repos(window: &tauri::Window) {
    let monitors = window.available_monitors().unwrap();
    let cursor_monitor = get_cursor_monitor(&monitors).unwrap();

    let pos = cursor_monitor
        .position()
        .to_logical(cursor_monitor.scale_factor());

    window
        .set_position(Position::Logical(pos))
        .expect("failed to set window position");
}

pub fn resized(window: &tauri::Window) {
    let monitors = window.available_monitors().unwrap();
    let cursor_monitor = get_cursor_monitor(&monitors).unwrap();

    let size = cursor_monitor
        .size()
        .to_logical(cursor_monitor.scale_factor());

    window
        .set_size(Size::Logical(size))
        .expect("failed to set window size");
}

#[tauri::command]
pub fn hide(window: tauri::Window) {
    if window.is_visible().unwrap() {
        window.hide().expect("failed to hide windows");
    }
}

#[tauri::command]
pub fn show(window: tauri::Window) {
    if !window.is_visible().unwrap() {
        repos(&window);
        window.show().expect("failed to show windows");
        window.set_focus().expect("failed to set fucus");
    } else {
        window.hide().expect("failed to hide windows");
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
