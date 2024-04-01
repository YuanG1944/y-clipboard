use anyhow::{bail, Result};
use once_cell::sync::OnceCell;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::{AppHandle, Manager, PhysicalSize, Position, Runtime, Size, Window};

use crate::{device::get_cursor_monitor, tray::Tray};

use super::route;

pub struct PreviousProcessId(Mutex<i32>);

#[derive(Debug, Default, Clone)]
pub struct WindowHandler {
    pub app_handle: Arc<Mutex<Option<AppHandle>>>,
}

impl WindowHandler {
    pub fn new() -> &'static WindowHandler {
        static HANDLE: OnceCell<WindowHandler> = OnceCell::new();
        HANDLE.get_or_init(|| WindowHandler {
            app_handle: Arc::new(Mutex::new(None)),
        })
    }

    pub fn init(&self, app_handle: AppHandle) {
        *self.app_handle.lock() = Some(app_handle);
    }

    pub fn get_window(&self) -> Option<Window> {
        self.app_handle
            .lock()
            .as_ref()
            .and_then(|app| app.get_window("main"))
    }

    pub fn update_sys_tray() -> Result<()> {
        let app_handle = Self::new().app_handle.lock();
        if app_handle.is_none() {
            bail!("update_sys_tray unhandled error");
        }
        Tray::register_stray(app_handle.as_ref().unwrap())?;
        Ok(())
    }

    pub fn open_window(window_config: route::RoutesEnum) {
        let binding = Self::new().app_handle.lock();

        let app_handle = binding.as_ref().unwrap();
        let window_info = match window_config {
            route::RoutesEnum::Config(_) => route::WindowConfig::config(),
            route::RoutesEnum::Main(_) => route::WindowConfig::main(),
        };

        let label = route::extract_string(window_info.label);
        let title = window_info.title;
        let url = window_info.url;

        if let Some(window) = app_handle.get_window(label.as_str()) {
            if label.as_str() == "config" && window.is_minimized().unwrap() {
                let _ = window.unminimize();
                return;
            }
            if window.is_visible().unwrap() {
                let _ = window.hide();
                return;
            }

            let _ = window.show().expect("failed to show windows");
            let _ = window.set_focus();
            return;
        }

        let new_window = tauri::window::WindowBuilder::new(
            app_handle,
            label.to_string(),
            tauri::WindowUrl::App(url.into()),
        )
        .title(title)
        .visible(true)
        .resizable(window_info.resizable)
        .fullscreen(window_info.fullscreen)
        .always_on_top(window_info.always_on_top)
        .transparent(window_info.transparent)
        .decorations(window_info.decorations)
        .skip_taskbar(window_info.skip_taskbar)
        .closable(window_info.closable)
        .center()
        .build();

        match new_window {
            Ok(window) => {
                if window.is_visible().unwrap() {
                    let _ = window.hide();
                }
                let _ = window.show();
                let _ = window.set_focus();
            }
            Err(e) => {
                println!("create_window error: {}", e);
            }
        }
    }

    pub fn repos<R: Runtime>(window: &tauri::Window<R>) {
        let monitors_res = window.available_monitors();
        match monitors_res {
            Ok(monitors) => {
                let cursor_monitor = get_cursor_monitor(&monitors).unwrap();

                let pos = cursor_monitor
                    .position()
                    .to_logical(cursor_monitor.scale_factor());

                window
                    .set_position(Position::Logical(pos))
                    .expect("failed to set window position");
            }
            Err(_) => window.app_handle().restart(),
        }
    }

    pub fn resized(window: &tauri::Window) {
        let monitors_res = window.available_monitors();

        match monitors_res {
            Ok(monitors) => {
                let cursor_monitor = get_cursor_monitor(&monitors).unwrap();

                let size = cursor_monitor
                    .size()
                    .to_logical(cursor_monitor.scale_factor());

                window
                    .set_size(Size::Logical(size))
                    .expect("failed to set window size");
            }
            Err(_) => window.app_handle().restart(),
        }
    }
}
