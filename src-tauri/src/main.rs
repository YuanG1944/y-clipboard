// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lib::{clipboard_monitor, shortcut, window};
use tauri::{GlobalShortcutManager, Manager};

fn main() {
    tauri::Builder::default()
        .plugin(clipboard_monitor::plugin::init(true))
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // 后续做成动态配置快捷键
            let global_shortcut = shortcut::GlobalShortcut::new(
                String::from("CommandOrControl+Shift+B"),
                String::from("f12"),
            );
            global_shortcut.register_global_shortcut(app);

            Ok(())
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Moved(_) => window::resized(event.window()),
            tauri::WindowEvent::Destroyed => {
                let _ = event
                    .window()
                    .app_handle()
                    .global_shortcut_manager()
                    .unregister_all();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            window::show,
            window::hide,
            window::hide_with_switch_app,
            window::toggle_devtool,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
