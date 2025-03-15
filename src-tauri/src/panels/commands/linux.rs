#[tauri::command]
pub fn show_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    let _ = window.show();
    let _ = window.set_focus();
    Ok(())
}

#[tauri::command]
pub fn hide_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    if window.is_visible().unwrap() {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
pub fn hide_with_switch_app(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    if window.is_visible().unwrap() {
        let _ = window.hide();
    }
    Ok(())
}
