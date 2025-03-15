use tauri_nspanel::ManagerExt;

use crate::constants;

use rdev::{simulate, EventType, Key, SimulateError};
use std::{thread, time};

use super::{key_operate, sleep};

pub fn switch_application_action() {
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyPress(Key::F4));
    key_operate(&EventType::KeyRelease(Key::F4));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(200);
}

pub fn paste_action() {
    key_operate(&EventType::KeyPress(Key::MetaLeft));
    key_operate(&EventType::KeyPress(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::MetaLeft));
    sleep(100);
}

pub fn os_paste() {
    std::thread::spawn(move || {
        switch_application_action();
        paste_action();
    });
}

pub fn key_register() {
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(100);
}
