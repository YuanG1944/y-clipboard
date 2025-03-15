use super::{key_operate, sleep};
use rdev::{simulate, EventType, Key, SimulateError};
use std::{thread, time};

pub fn switch_application_action() {
    // linux do not need this
}

pub fn paste_action() {
    sleep(300);
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyPress(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(100);
}

pub fn os_paste() {
    std::thread::spawn(move || {
        paste_action();
    });
}
