use monitor::WebviewWindowExt;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use crate::constants;

pub mod commands;
pub mod monitor;

pub fn set_up(handle: &tauri::AppHandle) -> tauri::Result<()> {
    let _ = handle.plugin(tauri_nspanel::init());

    let main_window = handle.get_webview_window(constants::MAIN_LABEL).unwrap();

    let _preference_window = handle.get_webview_window(constants::CONFIG_LABEL).unwrap();

    let _main_panel = main_window.to_spotlight_panel()?;

    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("panels").build()
}
