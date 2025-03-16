use std::sync::{Arc, Mutex};
use tauri::Runtime;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

use crate::constants;

use super::register::handle_paste;

pub mod hotkey_map;

pub struct GlobalShortcut {
    paste: String,
}

impl GlobalShortcut {
    pub fn new(paste: String) -> Self {
        GlobalShortcut { paste }
    }

    pub fn get_paste_shortcut(&self) -> String {
        self.paste.clone()
    }
    pub fn set_paste_shortcut(&mut self, val: String) {
        self.paste = val;
    }

    pub fn register_paste<R: Runtime>(app: &tauri::AppHandle<R>, paste: &str) -> tauri::Result<()> {
        // let window = Arc::new(app.get_webview_window("main").unwrap());

        let shortcut_manager = app.global_shortcut();

        if paste.is_empty() {
            return Ok(());
        }

        let _ = shortcut_manager
            .on_shortcut(paste, move |_app: &tauri::AppHandle<R>, _sc_str, _event| {
                handle_paste(_app)
            });

        Ok(())
    }

    pub fn delete_shortcut<R: Runtime>(app: &tauri::AppHandle<R>, key: &str) -> tauri::Result<()> {
        let shortcut_manager = app.global_shortcut();
        let _ = shortcut_manager.unregister(key);
        Ok(())
    }
}

pub struct ShortcutManage {
    store: Arc<Mutex<GlobalShortcut>>,
}

impl ShortcutManage {
    pub fn default() -> Self {
        Self {
            store: Arc::new(Mutex::from(GlobalShortcut::new(
                constants::DEFAULT_PASTE_HOTKEY.to_string(),
            ))),
        }
    }

    pub fn get_paste(&self) -> Result<String, String> {
        let curr_store = self.store.lock().map_err(|err| err.to_string()).unwrap();
        Ok(curr_store.get_paste_shortcut())
    }

    pub fn set_paste(&self, paste_str: String) -> Result<(), String> {
        self.store
            .lock()
            .map_err(|err| err.to_string())
            .unwrap()
            .set_paste_shortcut(paste_str);

        Ok(())
    }
}
