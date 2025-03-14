use tauri::{
    plugin::{Builder, TauriPlugin},
    window, Manager, Runtime,
};
use tauri_nspanel::ManagerExt;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{constants, panels::monitor::WebviewWindowExt};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("y-shortcut")
        .setup(move |_app: &tauri::AppHandle<R>, _api| {
            let _ = _app.app_handle().global_shortcut().on_shortcut(
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

            // let _ = _app.app_handle().global_shortcut().on_shortcut(
            //     Shortcut::new(Some(Modifiers::SUPER), Code::KeyI),
            //     |app, shortcut, event| {
            //         if event.state == ShortcutState::Pressed
            //             && shortcut.matches(Modifiers::SUPER, Code::KeyI)
            //         {
            //             let window = app.get_webview_window(constants::CONFIG_LABEL).unwrap();

            //             if window.is_visible().unwrap() {
            //                 let _ = window.hide();
            //             } else {
            //                 let _ = window.show();
            //             }
            //         }
            //     },
            // );

            Ok(())
        })
        .build()
}
