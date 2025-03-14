pub trait WebviewWindowExt {
    fn to_spotlight_panel(&self) -> tauri::Result<()>;

    fn center_at_cursor_monitor(&self) -> tauri::Result<()>;
}

impl<R: Runtime> WebviewWindowExt for WebviewWindow<R> {
    fn to_spotlight_panel(&self) -> tauri::Result<Panel> {
        Ok(())
    }

    fn center_at_cursor_monitor(&self) -> tauri::Result<()> {
        Ok(())
    }
}
