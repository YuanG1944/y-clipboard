use tauri_nspanel::ManagerExt;

use crate::{
    constants,
    panels::monitor::{is_main_window, set_macos_panel, shared_hide_window, MacOSPanelStatus},
};

#[tauri::command]
pub fn show_panel(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    if is_main_window(&window) {
        set_macos_panel(&app_handle, &window, MacOSPanelStatus::Hide);
    } else {
        shared_hide_window(&app_handle, &window);
    }

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
