use tauri::{AppHandle, Runtime, WebviewWindow};
#[cfg(target_os = "macos")]
mod macos;

#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "linux")]
mod linux;

#[cfg(target_os = "macos")]
pub use macos::*;

#[cfg(target_os = "windows")]
pub use windows::*;

#[cfg(target_os = "linux")]
pub use linux::*;

use crate::constants;

pub fn is_main_window<R: Runtime>(window: &WebviewWindow<R>) -> bool {
    window.label() == constants::MAIN_LABEL
}

pub fn shared_show_window<R: Runtime>(app_handle: &AppHandle<R>, window: &WebviewWindow<R>) {
    let _ = window.show();
    let _ = window.set_focus();

    let _ = app_handle;
}

// 共享隐藏窗口的方法
pub fn shared_hide_window<R: Runtime>(app_handle: &AppHandle<R>, window: &WebviewWindow<R>) {
    let _ = window.hide();

    let _ = app_handle;
}
