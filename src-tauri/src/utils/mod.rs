use std::{thread, time};

pub fn sleep(ms: u64) {
    let delay = time::Duration::from_millis(ms);
    thread::sleep(delay);
}
