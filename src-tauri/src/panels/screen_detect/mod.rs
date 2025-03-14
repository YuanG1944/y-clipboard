use device_query::{DeviceQuery, DeviceState, MouseState};
use tauri::Monitor;

#[derive(Debug)]
pub struct MousePosition {
    x: i32,
    y: i32,
}

impl MousePosition {
    pub fn new(pos: (i32, i32)) -> Self {
        MousePosition { x: pos.0, y: pos.1 }
    }
}

fn get_mouse_position() -> MousePosition {
    let device_state = DeviceState::new();
    let mouse: MouseState = device_state.get_mouse();
    MousePosition::new((mouse.coords.0, mouse.coords.1))
}

fn is_mouse_on_monitor(monitors: &Monitor, mouse_position: &MousePosition) -> bool {
    let mo_size = monitors.size();
    let mo_pos = monitors.position();
    let is_within_width =
        mouse_position.x >= mo_pos.x && mouse_position.x < (mo_pos.x + mo_size.width as i32);
    let is_within_height =
        mouse_position.y >= mo_pos.y && mouse_position.y < (mo_pos.y + mo_size.height as i32);
    is_within_width && is_within_height
}

pub fn get_cursor_monitor(available_monitors: &Vec<Monitor>) -> Option<&Monitor> {
    let mouse_position: MousePosition = get_mouse_position();

    let cursor_monitor: Vec<&Monitor> = available_monitors
        .into_iter()
        .filter(|item| is_mouse_on_monitor(*item, &mouse_position))
        .collect();

    match cursor_monitor.len() {
        0 => None,
        _ => Some(cursor_monitor[0]),
    }
}
