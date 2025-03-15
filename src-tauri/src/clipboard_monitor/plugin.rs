use std::sync::{Arc, Mutex};

use clipboard_master::Master;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Emitter, Manager, Runtime, State,
};

use crate::clipboard_history::FindHistoryReq;

use super::monitor::{ClipboardManager, ClipboardMonitor};

#[tauri::command]
pub fn get_history(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.get_history()
}

#[tauri::command]
pub fn get_history_by_page(
    manager: State<'_, ClipboardManager>,
    page: usize,
    page_size: usize,
) -> Result<String, String> {
    manager.get_history_by_page(page, page_size)
}

#[tauri::command]
pub fn find_histories(
    manager: State<'_, ClipboardManager>,
    query: FindHistoryReq,
) -> Result<String, String> {
    manager.find_histories(query)
}

#[tauri::command]
pub fn set_history_str(
    manager: State<'_, ClipboardManager>,
    json_str: String,
) -> Result<String, String> {
    manager.set_history_str(json_str)
}

#[tauri::command]
pub fn update_pasted_create_time(
    manager: State<'_, ClipboardManager>,
    id: String,
) -> Result<String, String> {
    manager.update_pasted_create_time(id)
}

#[tauri::command]
pub fn update_pasted_active(
    manager: State<'_, ClipboardManager>,
    id: String,
    active: String,
) -> Result<String, String> {
    manager.update_pasted_active(id, active)
}

#[tauri::command]
pub fn delete_items(
    manager: State<'_, ClipboardManager>,
    json_str: String,
) -> Result<String, String> {
    manager.delete_items(json_str)
}

#[tauri::command]
pub fn get_tags_all(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.get_tags_all()
}

#[tauri::command]
pub fn add_tag(manager: State<'_, ClipboardManager>, name: String) -> Result<String, String> {
    manager.add_tag(name)
}

#[tauri::command]
pub fn set_tag(
    manager: State<'_, ClipboardManager>,
    id: String,
    name: String,
) -> Result<String, String> {
    manager.set_tag(id, name)
}

#[tauri::command]
pub fn subscribe_history_to_tags(
    manager: State<'_, ClipboardManager>,
    history_id: String,
    tag_id: String,
) -> Result<String, String> {
    manager.subscribe_history_to_tags(history_id, tag_id)
}

#[tauri::command]
pub fn cancel_single_history_to_tags(
    manager: State<'_, ClipboardManager>,
    history_id: String,
    tag_id: String,
) -> Result<String, String> {
    manager.cancel_single_history_to_tags(history_id, tag_id)
}

#[tauri::command]
pub fn delete_tag(manager: State<'_, ClipboardManager>, id: String) -> Result<String, String> {
    manager.delete_tag(id)
}

#[tauri::command]
pub fn has_text(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_text()
}

#[tauri::command]
pub fn has_image(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_image()
}

#[tauri::command]
pub fn has_html(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_html()
}

#[tauri::command]
pub fn has_rtf(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_rtf()
}

#[tauri::command]
pub fn read_text(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_text()
}

#[tauri::command]
pub fn read_html(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_html()
}

#[tauri::command]
pub fn read_rtf(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_rtf()
}

#[tauri::command]
pub fn read_files(manager: State<'_, ClipboardManager>) -> Result<Vec<String>, String> {
    manager.read_files()
}

#[tauri::command]
pub fn write_text(manager: State<'_, ClipboardManager>, text: String) -> Result<(), String> {
    manager.write_text(text)
}

#[tauri::command]
pub fn write_html(manager: State<'_, ClipboardManager>, html: String) -> Result<(), String> {
    manager.write_html(html)
}

#[tauri::command]
pub fn write_rtf(manager: State<'_, ClipboardManager>, rtf: String) -> Result<(), String> {
    manager.write_rtf(rtf)
}

/// read image from clipboard and return a base64 string
#[tauri::command]
pub fn read_image_base64(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_image_base64()
}

#[tauri::command]
pub fn read_image_binary(manager: State<'_, ClipboardManager>) -> Result<Vec<u8>, String> {
    manager.read_image_binary()
}

/// write base64 image to clipboard
#[tauri::command]
pub fn write_image_base64(
    manager: State<'_, ClipboardManager>,
    base64_image: String,
) -> Result<(), String> {
    manager.write_image_base64(base64_image)
}

#[tauri::command]
pub fn write_image_binary(
    manager: State<'_, ClipboardManager>,
    bytes: Vec<u8>,
) -> Result<(), String> {
    manager.write_image_binary(bytes)
}

#[tauri::command]
pub fn write_files_path(
    manager: State<'_, ClipboardManager>,
    files: Vec<String>,
) -> Result<(), String> {
    manager.write_files_path(files)
}

#[tauri::command]
pub fn open_file(manager: State<'_, ClipboardManager>, file_path: String) -> Result<(), String> {
    manager.open_file(file_path)
}

#[tauri::command]
pub fn clear(manager: State<'_, ClipboardManager>) -> Result<(), String> {
    manager.clear()
}

#[tauri::command]
pub async fn start_monitor(
    app: tauri::AppHandle,
    state: tauri::State<'_, ClipboardManager>,
) -> Result<(), String> {
    let _ = app.emit("plugin:clipboard://clipboard-monitor/status", true);
    let mut running = state.running.lock().unwrap();
    if *running {
        return Ok(());
    }
    *running = true;
    let running = state.running.clone();

    std::thread::spawn(move || {
        let _ = Master::new(ClipboardMonitor::new(app, running)).run();
    });

    Ok(())
}

// #[tauri::command]
// pub fn paste() {
//     os_paste();
// }

pub fn start_monitor_setup<R: Runtime>(app_handle: tauri::AppHandle<R>) {
    let running = Arc::new(Mutex::new(true));

    std::thread::spawn(move || {
        let _ = Master::new(ClipboardMonitor::new(app_handle, running)).run();
    });
}

#[tauri::command]
pub async fn stop_monitor(
    app: tauri::AppHandle,
    state: tauri::State<'_, ClipboardManager>,
) -> Result<(), String> {
    *state.running.lock().unwrap() = false;
    let _ = app.emit("plugin:clipboard://clipboard-monitor/status", false);
    Ok(())
}

pub fn stop_monitor_exit(state: &tauri::State<'_, ClipboardManager>) {
    *state.running.lock().unwrap() = false;
}

#[tauri::command]
pub fn is_monitor_running(state: tauri::State<'_, ClipboardManager>) -> bool {
    *state.running.lock().unwrap()
}

pub fn init<R: Runtime>(open_watch: bool) -> TauriPlugin<R> {
    Builder::new("clipboard")
        .setup(move |app, _api| {
            let state = ClipboardManager::default();
            if open_watch {
                start_monitor_setup(app.clone());
            }
            app.manage(state);
            Ok(())
        })
        .on_event(
            move |clipboard, on_event: &tauri::RunEvent| match on_event {
                tauri::RunEvent::Exit => {
                    let state: tauri::State<'_, ClipboardManager> = clipboard.state();
                    if open_watch {
                        stop_monitor_exit(&state);
                    }
                }
                _ => {}
            },
        )
        .build()
}
