use rdev::{simulate, EventType, Key, SimulateError};
use std::{thread, time};

#[cfg(target_os = "macos")]
pub fn os_paste() {
    // todo  第一次复制指令不生效问题
    std::thread::spawn(|| {
        dispatch(&EventType::KeyPress(Key::ControlLeft));
        dispatch(&EventType::KeyPress(Key::F4));
        dispatch(&EventType::KeyRelease(Key::F4));
        dispatch(&EventType::KeyRelease(Key::ControlLeft));

        sleep(100);

        dispatch(&EventType::KeyPress(Key::MetaLeft));
        dispatch(&EventType::KeyPress(Key::KeyV));
        dispatch(&EventType::KeyRelease(Key::KeyV));
        dispatch(&EventType::KeyRelease(Key::MetaLeft));
    });
}

#[cfg(target_os = "windows")]
pub fn os_paste() {
    println!("This is running on Windows");
}

#[cfg(target_os = "linux")]
pub fn os_paste() {
    println!("This is running on Linux");
}

fn dispatch(event_type: &EventType) {
    match simulate(event_type) {
        Ok(()) => (),
        Err(SimulateError) => {
            println!("We could not dispatch {:?}", event_type);
        }
    }
    // Let the OS catchup (at least MacOS)
    sleep(20)
}

fn sleep(ms: u64) {
    let delay = time::Duration::from_millis(ms);
    thread::sleep(delay);
}
