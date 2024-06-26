use std::sync::{Arc, Mutex};

use clipboard_master::Master;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use crate::{
    clipboard_history::FindHistoryReq,
    paste::{key_register, os_paste},
};

use super::monitor::{ClipboardManager, ClipboardMonitor};

#[tauri::command]
fn get_history(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.get_history()
}

#[tauri::command]
fn get_history_by_page(
    manager: State<'_, ClipboardManager>,
    page: usize,
    page_size: usize,
) -> Result<String, String> {
    manager.get_history_by_page(page, page_size)
}

#[tauri::command]
fn find_histories(
    manager: State<'_, ClipboardManager>,
    query: FindHistoryReq,
) -> Result<String, String> {
    manager.find_histories(query)
}

#[tauri::command]
fn set_history_str(
    manager: State<'_, ClipboardManager>,
    json_str: String,
) -> Result<String, String> {
    manager.set_history_str(json_str)
}

#[tauri::command]
fn update_pasted_create_time(
    manager: State<'_, ClipboardManager>,
    id: String,
) -> Result<String, String> {
    manager.update_pasted_create_time(id)
}

#[tauri::command]
fn update_pasted_active(
    manager: State<'_, ClipboardManager>,
    id: String,
    active: String,
) -> Result<String, String> {
    manager.update_pasted_active(id, active)
}

#[tauri::command]
fn delete_items(manager: State<'_, ClipboardManager>, json_str: String) -> Result<String, String> {
    manager.delete_items(json_str)
}

#[tauri::command]
fn get_tags_all(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.get_tags_all()
}

#[tauri::command]
fn add_tag(manager: State<'_, ClipboardManager>, name: String) -> Result<String, String> {
    manager.add_tag(name)
}

#[tauri::command]
fn set_tag(
    manager: State<'_, ClipboardManager>,
    id: String,
    name: String,
) -> Result<String, String> {
    manager.set_tag(id, name)
}

#[tauri::command]
fn subscribe_history_to_tags(
    manager: State<'_, ClipboardManager>,
    history_id: String,
    tag_id: String,
) -> Result<String, String> {
    manager.subscribe_history_to_tags(history_id, tag_id)
}

#[tauri::command]
fn cancel_single_history_to_tags(
    manager: State<'_, ClipboardManager>,
    history_id: String,
    tag_id: String,
) -> Result<String, String> {
    manager.cancel_single_history_to_tags(history_id, tag_id)
}

#[tauri::command]
fn delete_tag(manager: State<'_, ClipboardManager>, id: String) -> Result<String, String> {
    manager.delete_tag(id)
}

#[tauri::command]
fn has_text(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_text()
}

#[tauri::command]
fn has_image(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_image()
}

#[tauri::command]
fn has_html(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_html()
}

#[tauri::command]
fn has_rtf(manager: State<'_, ClipboardManager>) -> Result<bool, String> {
    manager.has_rtf()
}

#[tauri::command]
fn read_text(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_text()
}

#[tauri::command]
fn read_html(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_html()
}

#[tauri::command]
fn read_rtf(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_rtf()
}

#[tauri::command]
fn read_files(manager: State<'_, ClipboardManager>) -> Result<Vec<String>, String> {
    manager.read_files()
}

#[tauri::command]
fn write_text(manager: State<'_, ClipboardManager>, text: String) -> Result<(), String> {
    manager.write_text(text)
}

#[tauri::command]
fn write_html(manager: State<'_, ClipboardManager>, html: String) -> Result<(), String> {
    manager.write_html(html)
}

#[tauri::command]
fn write_rtf(manager: State<'_, ClipboardManager>, rtf: String) -> Result<(), String> {
    manager.write_rtf(rtf)
}

/// read image from clipboard and return a base64 string
#[tauri::command]
fn read_image_base64(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_image_base64()
}

#[tauri::command]
fn read_image_binary(manager: State<'_, ClipboardManager>) -> Result<Vec<u8>, String> {
    manager.read_image_binary()
}

/// write base64 image to clipboard
#[tauri::command]
fn write_image_base64(
    manager: State<'_, ClipboardManager>,
    base64_image: String,
) -> Result<(), String> {
    manager.write_image_base64(base64_image)
}

#[tauri::command]
fn write_image_binary(manager: State<'_, ClipboardManager>, bytes: Vec<u8>) -> Result<(), String> {
    manager.write_image_binary(bytes)
}

#[tauri::command]
fn write_files_path(
    manager: State<'_, ClipboardManager>,
    files: Vec<String>,
) -> Result<(), String> {
    manager.write_files_path(files)
}

#[tauri::command]
fn open_file(manager: State<'_, ClipboardManager>, file_path: String) -> Result<(), String> {
    manager.open_file(file_path)
}

#[tauri::command]
fn paste() {
    os_paste();
}

#[tauri::command]
fn clear(manager: State<'_, ClipboardManager>) -> Result<(), String> {
    manager.clear()
}

#[tauri::command]
async fn start_monitor<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, ClipboardManager>,
) -> Result<(), String> {
    let _ = app.emit_all("plugin:clipboard://clipboard-monitor/status", true);
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

fn start_monitor_setup<R: Runtime>(app_handle: tauri::AppHandle<R>) {
    let running = Arc::new(Mutex::new(true));

    std::thread::spawn(move || {
        let _ = Master::new(ClipboardMonitor::new(app_handle, running)).run();
    });
}

#[tauri::command]
async fn stop_monitor<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, ClipboardManager>,
) -> Result<(), String> {
    *state.running.lock().unwrap() = false;
    let _ = app.emit_all("plugin:clipboard://clipboard-monitor/status", false);
    Ok(())
}

fn stop_monitor_exit(state: &tauri::State<'_, ClipboardManager>) {
    *state.running.lock().unwrap() = false;
}

#[tauri::command]
fn is_monitor_running(state: tauri::State<'_, ClipboardManager>) -> bool {
    *state.running.lock().unwrap()
}

pub fn init<R: Runtime>(open_watch: bool) -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            stop_monitor,
            start_monitor,
            is_monitor_running,
            get_history,
            get_history_by_page,
            find_histories,
            set_history_str,
            update_pasted_create_time,
            update_pasted_active,
            delete_items,
            set_tag,
            add_tag,
            get_tags_all,
            delete_tag,
            subscribe_history_to_tags,
            cancel_single_history_to_tags,
            has_text,
            has_image,
            has_html,
            has_rtf,
            read_text,
            read_files,
            read_html,
            read_image_base64,
            read_image_binary,
            read_rtf,
            write_text,
            write_html,
            write_rtf,
            write_image_binary,
            write_image_base64,
            write_files_path,
            open_file,
            paste,
            clear
        ])
        .setup(move |app| {
            let state = ClipboardManager::default();
            let app_handle = app.app_handle();
            if open_watch {
                start_monitor_setup(app_handle);
            }
            app.manage(state);
            key_register();
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
