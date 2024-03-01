// todo tray

// use tauri::{
//     AppHandle, CustomMenuItem, Manager, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
//     SystemTraySubmenu,
// };

// pub struct Tray {}

// impl Tray {
//     pub fn tray_menu(app_handle: &AppHandle) -> SystemTrayMenu {
//         let version = app_handle.package_info().version.to_string();
//         SystemTrayMenu::new()
//             .add_item(CustomMenuItem::new("open_window", "Show Window"))
//             .add_item(CustomMenuItem::new("hide_window", "Hide Window").accelerator("Esc"))
//             .add_native_item(SystemTrayMenuItem::Separator)
//             .add_item(CustomMenuItem::new("more_config", "More Config"))
//             .add_native_item(SystemTrayMenuItem::Separator)
//             .add_item(CustomMenuItem::new("app_version", format!("Version {version}")).disabled())
//             .add_item(CustomMenuItem::new("quit", "Quit").accelerator("CmdOrControl+Q"))
//     }

//     pub fn update_systray(app_handle: &AppHandle) -> Result<(), ()> {
//         app_handle
//             .tray_handle()
//             .set_menu(Tray::tray_menu(app_handle))?;
//         Tray::update_select_item(app_handle)?;
//         Ok(())
//     }

//     pub fn update_select_item(app_handle: &AppHandle) -> Result<(), ()> {
//         let language = {};

//         let tray = app_handle.tray_handle();
//         let _ = tray.get_item("language_en").set_selected(true);

//         Ok(())
//     }

//     pub fn on_system_tray_event(app_handle: &AppHandle, event: SystemTrayEvent) {
//         match event {
//             SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
//                 "open_window" => {}
//                 "hide_window" => {
//                     let window = app_handle.get_window("main");
//                     if let Some(window) = window {
//                         window.hide().unwrap();
//                     }
//                 }
//                 "more_config" => {}
//                 "quit" => {
//                     app_handle.exit(0);
//                     std::process::exit(0);
//                 }
//                 _ => {}
//             },
//             #[cfg(target_os = "windows")]
//             SystemTrayEvent::LeftClick { .. } => {
//                 if let Some(window) = app_handle.get_window("main") {
//                     if let Err(err) = window.show() {
//                         println!("Failed to show window: {}", err);
//                     }
//                     if let Err(err) = window.set_focus() {
//                         println!("Failed to set focus on window: {}", err);
//                     }
//                 }
//             }
//             _ => {}
//         }
//     }
// }
