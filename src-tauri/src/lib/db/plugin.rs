use super::database::SqliteDB;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

pub struct DBManage {}

impl DBManage {
    pub fn new() -> Self {
        DBManage {}
    }

    pub fn clear_history(&self) -> anyhow::Result<String> {
        SqliteDB::new().clear_history()
    }

    pub fn get_config(&self, key: String) -> anyhow::Result<String> {
        match SqliteDB::new().get_config(key) {
            Ok(config) => Ok(config),
            Err(_) => Ok(String::from("")),
        }
    }

    pub fn set_config(&self, key: String, value: String) -> anyhow::Result<()> {
        let _ = SqliteDB::new().set_config(key, value);
        Ok(())
    }
}

#[tauri::command]
fn clear_history(manager: State<'_, DBManage>) -> Result<(), String> {
    let _ = manager.clear_history();
    Ok(())
}

#[tauri::command]
fn get_config(manager: State<'_, DBManage>, key: String) -> Result<String, String> {
    match manager.get_config(key) {
        Ok(res) => Ok(res),
        Err(_) => Ok(String::from("")),
    }
}

#[tauri::command]
fn set_config(manager: State<'_, DBManage>, key: String, value: String) -> Result<(), String> {
    let _ = manager.set_config(key, value);
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("database")
        .invoke_handler(tauri::generate_handler![
            clear_history,
            set_config,
            get_config
        ])
        .setup(move |app| {
            let state = DBManage::new();
            app.manage(state);
            Ok(())
        })
        .build()
}
