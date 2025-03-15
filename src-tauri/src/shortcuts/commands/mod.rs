use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use super::manager::{hotkey_map::get_short_cut_name, GlobalShortcut, ShortcutManage};

#[tauri::command]
pub fn set_paste_shortcut(
    app: tauri::AppHandle,
    shortcut: State<'_, ShortcutManage>,
    value: String,
) -> Result<(), String> {
    let hot_key_arr: Vec<u32> = value
        .split("+")
        .map(|x| x.parse::<u32>().unwrap())
        .collect();

    let short_cut_str = get_short_cut_name(hot_key_arr, true);

    if short_cut_str.is_empty() {
        return Ok(());
    }

    let _ = GlobalShortcut::register_paste(&app, short_cut_str.as_str());

    shortcut.set_paste(short_cut_str)
}

#[tauri::command]
pub fn del_shortcut(app: tauri::AppHandle, value: String) -> Result<(), String> {
    let hot_key_arr: Vec<u32> = value
        .split("+")
        .map(|x| x.parse::<u32>().unwrap())
        .collect();

    let short_cut_str = get_short_cut_name(hot_key_arr, true);

    let _ = GlobalShortcut::delete_shortcut(&app, short_cut_str.as_str());
    Ok(())
}

#[tauri::command]
pub fn get_paste_shortcut(shortcut: State<'_, ShortcutManage>) -> Result<String, String> {
    shortcut.get_paste()
}
