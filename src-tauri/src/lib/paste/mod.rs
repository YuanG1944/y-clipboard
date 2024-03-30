use rdev::{simulate, EventType, Key, SimulateError};
use std::{thread, time};

pub fn key_register() {
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(100);
}

#[cfg(target_os = "macos")]
pub fn switch_application_action() {
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyPress(Key::F4));
    key_operate(&EventType::KeyRelease(Key::F4));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(100);
}

#[cfg(target_os = "windows")]
pub fn switch_application_action() {
    // windows do not need this
}

#[cfg(target_os = "windows")]
fn paste_action() {
    sleep(300);
    key_operate(&EventType::KeyPress(Key::ControlLeft));
    key_operate(&EventType::KeyPress(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::ControlLeft));
    sleep(100);
}

#[cfg(target_os = "macos")]
fn paste_action() {
    key_operate(&EventType::KeyPress(Key::MetaLeft));
    key_operate(&EventType::KeyPress(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::KeyV));
    key_operate(&EventType::KeyRelease(Key::MetaLeft));
    sleep(100);
}

#[cfg(target_os = "macos")]
pub fn os_paste() {
    std::thread::spawn(move || {
        switch_application_action();
        paste_action();
    });
}

#[cfg(target_os = "windows")]
pub fn os_paste() {
    std::thread::spawn(move || {
        paste_action();
    });
}

#[cfg(target_os = "linux")]
pub fn os_paste() {
    println!("This is running on Linux");
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

fn sleep(ms: u64) {
    let delay = time::Duration::from_millis(ms);
    thread::sleep(delay);
}
