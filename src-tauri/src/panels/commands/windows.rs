#[tauri::command]
pub fn show_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn hide_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    Ok(())
}
