use crate::window;
use anyhow::Result;
use std::sync::{Arc, Mutex};
use tauri::{App, GlobalShortcutManager, Manager, Runtime};

pub struct GlobalShortcut {
    paste: String,
    devtool: String,
}

impl GlobalShortcut {
    pub fn new(paste: String, devtool: String) -> Self {
        GlobalShortcut { paste, devtool }
    }

    pub fn get_paste_shortcut(&self) -> String {
        self.paste.clone()
    }
    pub fn set_paste_shortcut(&mut self, val: String) {
        self.paste = val;
    }

    pub fn get_devtool_shortcut(&self) -> String {
        self.devtool.clone()
    }
    pub fn set_devtool_shortcut(&mut self, val: String) {
        self.devtool = val;
    }

    pub fn register_paste<R: Runtime>(app: &tauri::AppHandle<R>, paste: &str) -> Result<()> {
        let window = Arc::new(app.get_window("main").unwrap());

        let mut shortcut_manager = app.app_handle().global_shortcut_manager();

        if paste.is_empty() {
            return Ok(());
        }

        let _ = shortcut_manager.register(paste, move || {
            if !window.is_visible().unwrap() {
                window::handler::WindowHandler::open_window(window::route::RoutesEnum::Main(
                    String::from("main"),
                ));
                window::handler::WindowHandler::repos(window.as_ref());
            }
        });

        Ok(())
    }

    pub fn delete_shortcut<R: Runtime>(app: &tauri::AppHandle<R>, key: &str) -> Result<()> {
        let mut shortcut_manager = app.app_handle().global_shortcut_manager();
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
                "CommandOrControl+Shift+B".to_string(),
                "f12".to_string(),
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
