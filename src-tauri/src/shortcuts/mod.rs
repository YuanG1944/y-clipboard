use tauri::{
    plugin::{Builder, TauriPlugin},
    window, Manager, Runtime,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{constants, panels::monitor::WebviewWindowExt};

pub mod commands;
pub mod manager;
pub mod register;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("y-shortcut")
        .setup(move |_app, _api| {
            let state = manager::ShortcutManage::default();
            let _ = manager::GlobalShortcut::register_paste(_app, constants::DEFAULT_PASTE_HOTKEY);
            _app.manage(state);
            Ok(())
        })
        .build()
}
