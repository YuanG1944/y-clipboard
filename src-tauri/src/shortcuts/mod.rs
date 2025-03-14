use tauri::{
    plugin::{Builder, TauriPlugin},
    window, Manager, Runtime,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{constants, panels::monitor::WebviewWindowExt};

pub mod register;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("y-shortcut")
        .setup(move |_app, _api| {
            register::shortcut_register(_app);

            Ok(())
        })
        .build()
}
