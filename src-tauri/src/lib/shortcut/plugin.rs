use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use crate::shortcut::hotkey_map::get_short_cut_name;

use super::manage::{GlobalShortcut, ShortcutManage};

#[tauri::command]
fn set_paste_shortcut<R: Runtime>(
    app: tauri::AppHandle<R>,
    shortcut: State<'_, ShortcutManage>,
    value: String,
) -> Result<(), String> {
    let hot_key_arr: Vec<u32> = value
        .split("+")
        .map(|x| x.parse::<u32>().unwrap())
        .collect();

    let short_cut_str = get_short_cut_name(hot_key_arr, true);

    let _ = GlobalShortcut::register_paste(&app, short_cut_str.as_str());

    shortcut.set_paste(short_cut_str)
}

#[tauri::command]
fn del_shortcut<R: Runtime>(app: tauri::AppHandle<R>, value: String) -> Result<(), String> {
    let hot_key_arr: Vec<u32> = value
        .split("+")
        .map(|x| x.parse::<u32>().unwrap())
        .collect();

    let short_cut_str = get_short_cut_name(hot_key_arr, true);

    let _ = GlobalShortcut::delete_shortcut(&app, short_cut_str.as_str());
    Ok(())
}

#[tauri::command]
fn get_paste_shortcut(shortcut: State<'_, ShortcutManage>) -> Result<String, String> {
    shortcut.get_paste()
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("shortcut")
        .invoke_handler(tauri::generate_handler![
            set_paste_shortcut,
            get_paste_shortcut,
            del_shortcut,
        ])
        .setup(move |app| {
            let state = ShortcutManage::default();
            app.manage(state);
            Ok(())
        })
        .build()
}
