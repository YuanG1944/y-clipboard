use panels as mod_panels;
use tauri::Manager;
use tauri_plugin_global_shortcut::{self, GlobalShortcutExt};
use trays as mod_tray;

mod clipboard_history;
mod clipboard_monitor;
mod constants;
mod db;
mod panels;
mod paste;
mod shortcuts;
mod trays;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(db::plugin::init(86400 as u64))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(shortcuts::init())
        .plugin(mod_tray::init())
        .plugin(clipboard_monitor::plugin::init(true))
        // 86400s == 1 day
        .plugin(paste::init())
        .invoke_handler(tauri::generate_handler![
            mod_panels::commands::show_panel,
            mod_panels::commands::hide_panel,
            shortcuts::commands::set_paste_shortcut,
            shortcuts::commands::del_shortcut,
            shortcuts::commands::get_paste_shortcut,
            clipboard_monitor::plugin::stop_monitor,
            clipboard_monitor::plugin::start_monitor,
            clipboard_monitor::plugin::is_monitor_running,
            clipboard_monitor::plugin::get_history,
            clipboard_monitor::plugin::get_history_by_page,
            clipboard_monitor::plugin::find_histories,
            clipboard_monitor::plugin::set_history_str,
            clipboard_monitor::plugin::update_pasted_create_time,
            clipboard_monitor::plugin::update_pasted_active,
            clipboard_monitor::plugin::delete_items,
            clipboard_monitor::plugin::set_tag,
            clipboard_monitor::plugin::add_tag,
            clipboard_monitor::plugin::get_tags_all,
            clipboard_monitor::plugin::delete_tag,
            clipboard_monitor::plugin::subscribe_history_to_tags,
            clipboard_monitor::plugin::cancel_single_history_to_tags,
            clipboard_monitor::plugin::has_text,
            clipboard_monitor::plugin::has_image,
            clipboard_monitor::plugin::has_html,
            clipboard_monitor::plugin::has_rtf,
            clipboard_monitor::plugin::read_text,
            clipboard_monitor::plugin::read_files,
            clipboard_monitor::plugin::read_html,
            clipboard_monitor::plugin::read_image_base64,
            clipboard_monitor::plugin::read_image_binary,
            clipboard_monitor::plugin::read_rtf,
            clipboard_monitor::plugin::write_text,
            clipboard_monitor::plugin::write_html,
            clipboard_monitor::plugin::write_rtf,
            clipboard_monitor::plugin::write_image_binary,
            clipboard_monitor::plugin::write_image_base64,
            clipboard_monitor::plugin::write_files_path,
            clipboard_monitor::plugin::open_file,
            // clipboard_monitor::plugin::paste,
            paste::paste,
            clipboard_monitor::plugin::clear,
            db::plugin::clear_history,
            db::plugin::set_config,
            db::plugin::get_config,
            db::plugin::restart_clear_history_interval
        ])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                window.hide().expect("Could not hide window");
            }
            tauri::WindowEvent::Destroyed => {
                let _ = window.app_handle().global_shortcut().unregister_all();
            }
            _ => {}
        })
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            mod_panels::set_up(app.app_handle())?;
            db::database::SqliteDB::init();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
