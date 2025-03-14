use tauri::{
    plugin::{Builder, TauriPlugin},
    window, Manager, Runtime,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{constants, panels::monitor::WebviewWindowExt};

pub fn os_register<R: Runtime>(app: &tauri::AppHandle<R>) {
    let _ = app.app_handle().global_shortcut().on_shortcut(
        Shortcut::new(Some(Modifiers::CONTROL), Code::KeyK),
        |app, shortcut, event| {
            if event.state == ShortcutState::Pressed
                && shortcut.matches(Modifiers::CONTROL, Code::KeyK)
            {
                let window = app.get_webview_window(constants::MAIN_LABEL).unwrap();

                if window.is_visible().unwrap() {
                    let _ = window.hide();
                } else {
                    window.center_at_cursor_monitor().unwrap();
                    let _ = window.show();
                }
            }
        },
    );
}
