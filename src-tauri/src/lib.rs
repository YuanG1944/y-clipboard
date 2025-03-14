use panels as mod_panels;
use tauri::Manager;
use tauri_plugin_global_shortcut;
use trays as mod_tray;

mod clipboards;
mod constants;
mod panels;
mod shortcuts;
mod trays;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(shortcuts::init())
        .plugin(mod_tray::init())
        .invoke_handler(tauri::generate_handler![
            mod_panels::commands::show_panel,
            mod_panels::commands::hide_panel
        ])
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            mod_panels::set_up(app.app_handle())?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
