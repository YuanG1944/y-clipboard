use crate::{constants, utils::sleep};

use super::wait;
use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Keyboard, Settings,
};
use rdev::{simulate, EventType, Key, SimulateError};
use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use std::ptr;
use std::sync::Mutex;
use tauri::command;
use winapi::shared::minwindef::DWORD;
use winapi::shared::windef::{HWINEVENTHOOK, HWND};
use winapi::um::winuser::{
    GetWindowTextLengthW, GetWindowTextW, SetForegroundWindow, SetWinEventHook,
    EVENT_SYSTEM_FOREGROUND, WINEVENT_OUTOFCONTEXT,
};

static PREVIOUS_WINDOW: Mutex<Option<isize>> = Mutex::new(None);

unsafe fn get_window_title(hwnd: HWND) -> String {
    let length = GetWindowTextLengthW(hwnd);

    if length == 0 {
        return String::new();
    }

    let mut buffer: Vec<u16> = vec![0; (length + 1) as usize];

    GetWindowTextW(hwnd, buffer.as_mut_ptr(), length + 1);

    OsString::from_wide(&buffer[..length as usize])
        .to_string_lossy()
        .into_owned()
}

unsafe extern "system" fn event_hook_callback(
    _h_win_event_hook: HWINEVENTHOOK,
    event: DWORD,
    hwnd: HWND,
    _id_object: i32,
    _id_child: i32,
    _dw_event_thread: DWORD,
    _dwms_event_time: DWORD,
) {
    if event == EVENT_SYSTEM_FOREGROUND {
        let window_title = get_window_title(hwnd);

        if window_title == constants::MAIN_WINDOW_TITLE {
            return;
        }

        let mut previous_window = PREVIOUS_WINDOW.lock().unwrap();
        let _ = previous_window.insert(hwnd as isize);
    }
}

pub fn observe_app() {
    unsafe {
        let hook = SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_SYSTEM_FOREGROUND,
            ptr::null_mut(),
            Some(event_hook_callback),
            0,
            0,
            WINEVENT_OUTOFCONTEXT,
        );

        if hook.is_null() {
            log::error!("设置事件钩子失败");
            return;
        }
    }
}

pub fn get_previous_window() -> Option<isize> {
    return PREVIOUS_WINDOW.lock().unwrap().clone();
}

fn focus_previous_window() {
    unsafe {
        let hwnd = match get_previous_window() {
            Some(hwnd) => hwnd as HWND,
            None => return,
        };

        if hwnd.is_null() {
            return;
        }

        SetForegroundWindow(hwnd);
    }
}

fn paste_action() {
    sleep(300);
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyPress(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(100);
}

#[cfg(target_os = "windows")]
pub fn os_paste() {
    std::thread::spawn(move || {
        paste_action();
    });
}

fn key_operate(event_type: &EventType) {
    match simulate(event_type) {
        Ok(()) => (),
        Err(SimulateError) => {
            println!("We could not key_operate {:?}", event_type);
        }
    }

    sleep(20)
}

#[command]
pub async fn paste() {
    // os_paste();
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    focus_previous_window();

    wait(100);

    enigo.key(enigo::Key::Shift, Press).unwrap();
    // insert 的微软虚拟键码：https://learn.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes
    enigo.key(enigo::Key::Other(0x2D), Click).unwrap();
    enigo.key(enigo::Key::Shift, Release).unwrap();
}
