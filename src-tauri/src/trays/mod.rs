use tauri::menu::{Menu, MenuItemBuilder, PredefinedMenuItem};
use tauri::plugin::{Builder, TauriPlugin};

use tauri::{Manager, Runtime};

use crate::constants;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("y-tray")
        .setup(move |_app: &tauri::AppHandle<R>, _api| {
            let preferences = MenuItemBuilder::with_id("preferences", "Preferences")
                .accelerator("CmdOrControl+,")
                .build(_app)?; // Preferences item with accelerator
            let restart = MenuItemBuilder::with_id("restart", "Restart").build(_app)?; // Restart item
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(_app)?; // Quit item
            let separator = &PredefinedMenuItem::separator(_app)?; //

            let menu = Menu::with_items(_app, &[&preferences, separator, &restart, &quit])?;

            let sys_tray = _app.tray_by_id(constants::TRAY_ID).unwrap();

            let _ = sys_tray.set_menu(Some(menu));

            sys_tray.on_menu_event(move |app, event| match event.id.as_ref() {
                "preferences" => {
                    let window = app.get_webview_window(constants::CONFIG_LABEL).unwrap();
                    let _ = window.show();
                }
                "restart" => {
                    app.restart();
                }
                "quit" => {
                    app.exit(0);
                    std::process::exit(0);
                }
                _ => {}
            });

            Ok(())
        })
        .build()
}
