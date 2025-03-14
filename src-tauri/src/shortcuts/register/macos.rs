use tauri::Runtime;
use tauri::{
    plugin::{Builder, TauriPlugin},
    window, Manager, Runtime,
};
use tauri_nspanel::ManagerExt;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{constants, panels::monitor::WebviewWindowExt};

pub fn os_register<R: Runtime>(app: &tauri::AppHandle<R>) {
    let _ = app.app_handle().global_shortcut().on_shortcut(
        Shortcut::new(Some(Modifiers::SUPER), Code::KeyK),
        |app, shortcut, event| {
            if event.state == ShortcutState::Pressed
                && shortcut.matches(Modifiers::SUPER, Code::KeyK)
            {
                let window = app.get_webview_window(constants::MAIN_LABEL).unwrap();

                let panel = app.get_webview_panel(window.label()).unwrap();

                if panel.is_visible() {
                    panel.order_out(None);
                } else {
                    window.center_at_cursor_monitor().unwrap();

                    panel.show();
                }
            }
        },
    );
}
