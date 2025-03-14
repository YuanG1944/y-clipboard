use tauri::{Manager, Position, Runtime, Size, WebviewWindow};

use crate::panels::screen_detect::get_cursor_monitor;

pub trait WebviewWindowExt {
    fn to_spotlight_panel(&self) -> tauri::Result<()>;

    fn center_at_cursor_monitor(&self) -> tauri::Result<()>;
}

impl<R: Runtime> WebviewWindowExt for WebviewWindow<R> {
    fn to_spotlight_panel(&self) -> tauri::Result<()> {
        Ok(())
    }

    fn center_at_cursor_monitor(&self) -> tauri::Result<()> {
        let monitors_res = self.available_monitors();

        //repos
        match monitors_res {
            Ok(monitors) => {
                let cursor_monitor = get_cursor_monitor(&monitors).unwrap();

                let pos = cursor_monitor
                    .position()
                    .to_logical(cursor_monitor.scale_factor());

                let size = cursor_monitor
                    .size()
                    .to_logical(cursor_monitor.scale_factor());

                self.set_position(Position::Logical(pos))
                    .expect("failed to set window position");

                self.set_size(Size::Logical(size))
                    .expect("failed to set window size");
            }
            Err(_) => self.app_handle().restart(),
        }

        Ok(())
    }
}
