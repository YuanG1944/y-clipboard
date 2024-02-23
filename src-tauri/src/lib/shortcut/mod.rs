use std::sync::Arc;
use tauri::{App, GlobalShortcutManager, Manager};

use crate::window;

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

    pub fn register_global_shortcut(&self, app: &mut App) {
        let window = Arc::new(app.get_window("main").unwrap());
        let mut shortcut_manager = app.app_handle().global_shortcut_manager();

        let paste = self.paste.as_str();
        let devtool = self.devtool.as_str();

        match shortcut_manager.is_registered(paste) {
            Ok(is) => {
                let window = Arc::clone(&window);
                if !is {
                    let _ = shortcut_manager.register(paste, move || {
                        window.show().expect("failed to show windows");
                        window.set_focus().expect("failed to set fucus");
                        window::repos(window.as_ref());
                    });
                }
            }
            Err(_) => {}
        }

        match shortcut_manager.is_registered(devtool) {
            Ok(is) => {
                let window = Arc::clone(&window);
                if !is {
                    let _ = shortcut_manager.register(paste, move || {
                        window.open_devtools();
                    });
                }
            }
            Err(_) => {}
        }
    }
}
