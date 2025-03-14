use tauri_nspanel::ManagerExt;

use crate::constants;

#[tauri::command]
pub fn show_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    let panel = app_handle.get_webview_panel(constants::MAIN_LABEL).unwrap();

    panel.show();

    Ok(())
}

#[tauri::command]
pub fn hide_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    let panel = app_handle.get_webview_panel(constants::MAIN_LABEL).unwrap();

    if panel.is_visible() {
        panel.order_out(None);
    }

    Ok(())
}
