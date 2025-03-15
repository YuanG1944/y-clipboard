use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use error::{Error, Result};

mod clipboard_monitor;
mod clipboard_history;
mod error;

pub use clipboard_monitor::monitor::Clipboard;
/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            clipboard_monitor::commands::stop_monitor,
            clipboard_monitor::commands::start_monitor,
            clipboard_monitor::commands::is_monitor_running,
            clipboard_monitor::commands::has_text,
            clipboard_monitor::commands::has_image,
            clipboard_monitor::commands::has_html,
            clipboard_monitor::commands::has_rtf,
            clipboard_monitor::commands::has_files,
            clipboard_monitor::commands::available_types,
            clipboard_monitor::commands::read_text,
            clipboard_monitor::commands::read_files,
            clipboard_monitor::commands::read_files_uris,
            clipboard_monitor::commands::read_html,
            clipboard_monitor::commands::read_image_base64,
            clipboard_monitor::commands::read_image_binary,
            clipboard_monitor::commands::read_rtf,
            clipboard_monitor::commands::write_text,
            clipboard_monitor::commands::write_html,
            clipboard_monitor::commands::write_html_and_text,
            clipboard_monitor::commands::write_rtf,
            clipboard_monitor::commands::write_image_binary,
            clipboard_monitor::commands::write_image_base64,
            clipboard_monitor::commands::write_files_uris,
            clipboard_monitor::commands::write_files,
            clipboard_monitor::commands::clear
        ])
        .setup(|app, api| {
            let clipboard = clipboard_monitor::monitor::init(api)?;
            app.manage(clipboard);
            Ok(())
        })
        .build()
}
