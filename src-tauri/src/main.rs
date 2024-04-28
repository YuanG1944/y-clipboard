// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lib::{clipboard_monitor, db, shortcut, tray, window};
use tauri::{App, GlobalShortcutManager, Manager};

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(clipboard_monitor::plugin::init(true))
        .plugin(shortcut::plugin::init())
        // 86400s == 1 day
        .plugin(db::plugin::init(86400 as u64))
        .setup(|app| {
            set_up(app);
            Ok(())
        })
        .system_tray(tauri::SystemTray::new())
        .on_system_tray_event(tray::Tray::on_system_tray_event)
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Moved(_) => {
                if event.window().label()
                    == window::route::extract_string(window::route::RoutesEnum::Main(String::from(
                        "main",
                    )))
                    .as_str()
                {
                    window::handler::WindowHandler::resized(event.window())
                }
            }
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                let window = event.window();
                window.hide().expect("Could not hide window");
            }
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
            window::invoke::show,
            window::invoke::hide,
            window::invoke::hide_with_switch_app,
            window::invoke::toggle_devtool,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn set_up(app: &mut App) {
    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    window::handler::WindowHandler::new().init(app.app_handle());
    tray::Tray::register_stray(&app.app_handle()).unwrap();
    db::database::SqliteDB::init();
}
