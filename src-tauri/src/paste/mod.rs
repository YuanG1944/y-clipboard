use tauri::{
    generate_handler,
    plugin::{Builder, TauriPlugin},
    Runtime,
};

mod commands;

pub use commands::*;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("paste")
        .setup(move |_app, _api| {
            observe_app();

            Ok(())
        })
        .build()
}
