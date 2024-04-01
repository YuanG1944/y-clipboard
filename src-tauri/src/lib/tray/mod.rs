use anyhow::Result;
use tauri::{AppHandle, CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

use crate::window;

pub struct Tray {}

impl Tray {
    pub fn tray_menu(app_handle: &AppHandle) -> SystemTrayMenu {
        // let version = app_handle.package_info().version.to_string();
        SystemTrayMenu::new()
            .add_item(
                CustomMenuItem::new("preferences", "Preferences").accelerator("CmdOrControl+,"),
            )
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(CustomMenuItem::new("quit", "Quit"))
    }

    pub fn register_stray(app_handle: &AppHandle) -> Result<()> {
        app_handle
            .tray_handle()
            .set_menu(Tray::tray_menu(app_handle))?;
        Ok(())
    }

    pub fn on_system_tray_event(app_handle: &AppHandle, event: SystemTrayEvent) {
        match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "preferences" => {
                    window::handler::WindowHandler::open_window(window::route::RoutesEnum::Config(
                        String::from("config"),
                    ));
                }
                "quit" => {
                    app_handle.exit(0);
                    std::process::exit(0);
                }
                _ => {}
            },

            _ => {}
        }
    }
}
