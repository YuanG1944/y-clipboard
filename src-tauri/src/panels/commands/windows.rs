use crate::panels::monitor::{shared_hide_window, shared_show_window};

#[tauri::command]
pub fn show_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    shared_show_window(&app_handle, &window);

    Ok(())
}

#[tauri::command]
pub fn hide_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    shared_hide_window(&app_handle, &window);

    Ok(())
}
