#[tauri::command]
pub fn hide(window: tauri::Window) {
    if window.is_visible().unwrap() {
        window.hide().unwrap();
    }
}

#[tauri::command]
pub fn show(window: tauri::Window) {
    if !window.is_visible().unwrap() {
        window.show().unwrap();
        window.set_focus().unwrap();
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
