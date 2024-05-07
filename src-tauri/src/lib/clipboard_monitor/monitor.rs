use base64::{engine::general_purpose, Engine as _};
use clipboard_master::{CallbackResult, ClipboardHandler};
use clipboard_rs::{common::RustImage, Clipboard, ClipboardContext, ContentFormat, RustImageData};
use image::EncodableLayout;
use serde_json;
use std::collections::VecDeque;
use std::path::Path;
use std::process::Command;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::{Manager, Runtime};
use uuid::Uuid;

use crate::clipboard_history::FindHistoryReq;
use crate::clipboard_history::HistoryItem;
use crate::clipboard_history::HistoryStore;
use crate::db::database::SqliteDB;
use crate::utils::active::ActiveEnum;
use crate::utils::stringify;

pub struct ClipboardMonitor<R>
where
    R: Runtime,
{
    app_handle: tauri::AppHandle<R>,
    running: Arc<Mutex<bool>>,
    manager: ClipboardManager,
}

impl<R> ClipboardMonitor<R>
where
    R: Runtime,
{
    pub fn new(app_handle: tauri::AppHandle<R>, running: Arc<Mutex<bool>>) -> Self {
        let manager: ClipboardManager = ClipboardManager::default();
        Self {
            app_handle,
            running,
            manager,
        }
    }

    pub fn item_collect(&self) -> HistoryItem {
        let mut item = HistoryItem::new();

        if self.manager.has_text().unwrap() {
            let text = self.manager.read_text().unwrap();
            item.set_text(text.clone());
            item.md5_text = stringify::md5(text.as_str().trim());
            item.push_formats(String::from("text"));
        }
        if self.manager.has_html().unwrap() {
            let html = self.manager.read_html().unwrap();
            item.set_html(html.clone());
            item.md5_html = stringify::md5(html.as_str().trim());
            item.push_formats(String::from("html"));
        }
        if self.manager.has_rtf().unwrap() {
            let rtf = self.manager.read_rtf().unwrap();
            item.set_rtf(rtf.clone());
            item.md5_rtf = stringify::md5(rtf.as_str().trim());
            item.push_formats(String::from("rtf"));
        }
        if self.manager.has_image().unwrap() {
            let image = self.manager.read_image_base64().unwrap();
            item.set_image(image.clone());
            item.md5_image = stringify::md5(image.as_str().trim());
            item.push_formats(String::from("image"));
        }

        if self.manager.has_file_url().unwrap() {
            let files = self.manager.read_files().unwrap();
            println!("files--->{:?}", files);

            if self.manager.has_text().unwrap() == false {
                let files_name: Vec<&str> = files
                    .iter()
                    .map(|f| {
                        let path = Path::new(f);
                        path.file_name().unwrap().to_str().unwrap()
                    })
                    .collect();
                let text = files_name.join(" ");
                item.set_text(text.clone());
                item.md5_text = stringify::md5(text.as_str());
                item.push_formats(String::from("text"));
            }

            if self.manager.read_files().unwrap().len() > 0 {
                item.set_files(self.manager.read_files().unwrap());
                item.push_formats(String::from("files"));
            }
        }

        if item.formats.len() > 0 {
            let default_active = ActiveEnum::default_format(&item.formats);
            item.set_active(ActiveEnum::to_str(default_active));
        }

        item
    }
}

impl<R> ClipboardHandler for ClipboardMonitor<R>
where
    R: Runtime,
{
    fn on_clipboard_change(&mut self) -> CallbackResult {
        if !*self.running.lock().unwrap() {
            let _ = self
                .app_handle
                .emit_all("plugin:clipboard://clipboard-monitor/status", false);
            return CallbackResult::Stop;
        }
        let _ = self.app_handle.emit_all(
            "plugin:clipboard://clipboard-monitor/update",
            format!("clipboard update"),
        );

        // push item to history store
        let item: HistoryItem = self.item_collect();
        let _ = SqliteDB::new().insert_item_distinct(item);

        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: std::io::Error) -> CallbackResult {
        let _ = self.app_handle.emit_all(
            "plugin:clipboard://clipboard-monitor/error",
            error.to_string(),
        );
        if !*self.running.lock().unwrap() {
            let _ = self
                .app_handle
                .emit_all("plugin:clipboard://clipboard-monitor/status", false);
            return CallbackResult::Stop;
        }
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}

pub struct ClipboardManager {
    pub running: Arc<Mutex<bool>>,
    pub clipboard: Arc<Mutex<ClipboardContext>>,
    pub store: Arc<Mutex<HistoryStore>>,
}

impl ClipboardManager {
    pub fn default() -> Self {
        ClipboardManager {
            running: Arc::default(),
            clipboard: Arc::new(Mutex::from(ClipboardContext::new().unwrap())),
            store: Arc::new(Mutex::from(HistoryStore::new())),
        }
    }

    pub fn get_history(&self) -> Result<String, String> {
        match SqliteDB::new().find_all() {
            Ok(arr) => match serde_json::to_string(&arr) {
                Ok(json_str) => Ok(json_str.clone()),
                Err(e) => Err(format!("Error serializing VecDeque to JSON: {:?}", e)),
            },
            Err(e) => Err(format!("Error get data from database: {:?}", e)),
        }
    }

    pub fn get_history_by_page(&self, page: usize, page_size: usize) -> Result<String, String> {
        match SqliteDB::new().find_history_by_page(page, page_size) {
            Ok(arr) => match serde_json::to_string(&arr) {
                Ok(json_str) => Ok(json_str.clone()),
                Err(e) => Err(format!("Error serializing VecDeque to JSON: {:?}", e)),
            },
            Err(e) => Err(format!("Error get data from database: {:?}", e)),
        }
    }

    pub fn find_histories(&self, req: FindHistoryReq) -> Result<String, String> {
        match SqliteDB::new().find_histories(req) {
            Ok(arr) => match serde_json::to_string(&arr) {
                Ok(json_str) => Ok(json_str.clone()),
                Err(e) => Err(format!("Error serializing VecDeque to JSON: {:?}", e)),
            },
            Err(e) => Err(format!("Error get data from database: {:?}", e)),
        }
    }

    pub fn set_history_str(&self, history_store_str: String) -> Result<String, String> {
        match serde_json::from_str::<VecDeque<HistoryItem>>(history_store_str.as_str()) {
            Ok(history_store) => {
                self.store
                    .try_lock()
                    .map_err(|err| err.to_string())
                    .unwrap()
                    .set_store(history_store);
                Ok(String::from("Set success"))
            }
            Err(e) => Err(format!("{}", e)),
        }
    }

    pub fn update_pasted_create_time(&self, id: String) -> Result<String, String> {
        match SqliteDB::new().update_pasted_create_time(id) {
            Ok(_) => Ok(format!("Update create time success")),
            Err(e) => Err(format!("Error update create time from database: {:?}", e)),
        }
    }

    pub fn update_pasted_active(&self, id: String, active: String) -> Result<String, String> {
        match SqliteDB::new().update_pasted_active(id, active) {
            Ok(_) => Ok(format!("Update active success")),
            Err(e) => Err(format!("Error update active from database: {:?}", e)),
        }
    }

    pub fn delete_items(&self, ids_str: String) -> Result<String, String> {
        match serde_json::from_str::<Vec<String>>(ids_str.as_str()) {
            Ok(ids) => match SqliteDB::new().delete_items(ids) {
                Ok(_) => Ok(String::from("Set success")),
                Err(e) => Err(format!("{}", e)),
            },
            Err(e) => Err(format!("{}", e)),
        }
    }

    pub fn get_tags_all(&self) -> Result<String, String> {
        match SqliteDB::new().get_tags_all() {
            Ok(arr) => match serde_json::to_string(&arr) {
                Ok(json_str) => Ok(json_str.clone()),
                Err(e) => Err(format!("Error serializing TagsStruct to JSON: {:?}", e)),
            },
            Err(e) => Err(format!("Error get tags from database: {:?}", e)),
        }
    }

    pub fn add_tag(&self, name: String) -> Result<String, String> {
        match SqliteDB::new().insert_tag(Uuid::new_v4().to_string(), name) {
            Ok(_) => Ok(format!("Insert tag succuss!")),
            Err(e) => Err(format!("Fail to insert tag: {}", e)),
        }
    }

    pub fn set_tag(&self, id: String, name: String) -> Result<String, String> {
        match SqliteDB::new().update_tag(id, name) {
            Ok(_) => Ok(format!("Update tag success")),
            Err(e) => Err(format!("Fail to update tag: {}", e)),
        }
    }

    pub fn delete_tag(&self, id: String) -> Result<String, String> {
        match SqliteDB::new().delete_tag(id) {
            Ok(_) => Ok(format!("Delete tag success")),
            Err(e) => Err(format!("Fail to delete tag: {}", e)),
        }
    }

    pub fn subscribe_history_to_tags(
        &self,
        history_id: String,
        tag_id: String,
    ) -> Result<String, String> {
        match SqliteDB::new().subscribe_history_to_tags(history_id, tag_id) {
            Ok(_) => Ok(format!("subscribe tag success")),
            Err(e) => Err(format!("Fail to subscribe tag: {}", e)),
        }
    }

    pub fn cancel_single_history_to_tags(
        &self,
        history_id: String,
        tag_id: String,
    ) -> Result<String, String> {
        match SqliteDB::new().cancel_single_history_to_tags(history_id, tag_id) {
            Ok(_) => Ok(format!("cancel tag success")),
            Err(e) => Err(format!("Fail to cancel tag: {}", e)),
        }
    }

    pub fn has(&self, format: ContentFormat) -> Result<bool, String> {
        Ok(self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .has(format))
    }

    #[cfg(target_os = "macos")]
    pub fn has_file_url(&self) -> Result<bool, String> {
        Ok(self
            .clipboard
            .try_lock()
            .map_err(|err| err.to_string())
            .unwrap()
            .has(ContentFormat::Other("public.file-url".to_string())))
    }

    #[cfg(target_os = "windows")]
    pub fn has_file_url(&self) -> Result<bool, String> {
        Ok(self
            .clipboard
            .try_lock()
            .map_err(|err| err.to_string())
            .unwrap()
            .has(ContentFormat::Other("FileContents".to_string())))
    }

    #[cfg(target_os = "linux")]
    pub fn has_file_url(&self) -> Result<bool, String> {
        println!(
            "available---> {:?}",
            self.clipboard.lock().unwrap().available_formats()
        );
        // TODO
        false
    }

    pub fn has_text(&self) -> Result<bool, String> {
        self.has(ContentFormat::Text)
    }

    pub fn has_rtf(&self) -> Result<bool, String> {
        self.has(ContentFormat::Rtf)
    }

    pub fn has_image(&self) -> Result<bool, String> {
        self.has(ContentFormat::Image)
    }

    pub fn has_html(&self) -> Result<bool, String> {
        self.has(ContentFormat::Html)
    }

    // Read from Clipboard APIs

    /// read text from clipboard
    pub fn read_text(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_text()
            .map_err(|err| err.to_string())
    }

    pub fn read_html(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_html()
            .map_err(|err| err.to_string())
    }

    pub fn read_rtf(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_rich_text()
            .map_err(|err| err.to_string())
    }

    /// read files from clipboard and return a `Vec<String>`
    pub fn read_files(&self) -> Result<Vec<String>, String> {
        let res = self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_files()
            .map_err(|err| err.to_string());
        println!("res--->{:?}", res);
        match res {
            Ok(files) => Ok(files),
            Err(err) => match err {
                _ => Err("Unknown error".to_string()),
            },
        }
    }

    /// read image from clipboard and return a base64 string
    pub fn read_image_base64(&self) -> Result<String, String> {
        let image_bytes = self.read_image_binary()?;
        let base64_str: String = general_purpose::STANDARD_NO_PAD.encode(&image_bytes);
        Ok(base64_str)
    }

    /// read image from clipboard and return a `Vec<u8>`
    pub fn read_image_binary(&self) -> Result<Vec<u8>, String> {
        let image = self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_image()
            .map_err(|err| err.to_string())?;
        let bytes = image
            .to_png()
            .map_err(|err| err.to_string())?
            .get_bytes()
            .to_vec();
        // let bytes = util::image_data_to_bytes(&image);
        Ok(bytes)
    }

    // Write to Clipboard APIs
    pub fn write_text(&self, text: String) -> Result<(), String> {
        let text = String::from(text.trim());
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_text(text)
            .map_err(|err| err.to_string())
    }

    pub fn write_html(&self, html: String) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_html(html)
            .map_err(|err| err.to_string())
    }

    pub fn write_rtf(&self, rtf: String) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_rich_text(rtf)
            .map_err(|err| err.to_string())
    }

    /// write base64 png image to clipboard
    pub fn write_image_base64(&self, base64_image: String) -> Result<(), String> {
        let decoded = general_purpose::STANDARD_NO_PAD
            .decode(base64_image)
            .map_err(|err| err.to_string())?;
        self.write_image_binary(decoded)
            .map_err(|err| err.to_string())?;
        Ok(())
    }

    pub fn write_image_binary(&self, bytes: Vec<u8>) -> Result<(), String> {
        let img = RustImageData::from_bytes(bytes.as_bytes()).map_err(|err| err.to_string())?;
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_image(img)
            .unwrap();
        Ok(())
    }

    pub fn write_files_path(&self, files: Vec<String>) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_files(files)
            .unwrap();
        Ok(())
    }

    #[cfg(target_os = "macos")]
    pub fn open_file(&self, file_path: String) -> Result<(), String> {
        Command::new("open")
            .arg(file_path)
            .spawn()
            .expect("Failed to open file on macOS.");
        Ok(())
    }

    #[cfg(target_os = "windows")]
    pub fn open_file(&self, file_path: String) -> Result<(), String> {
        // Command::new("cmd")
        //     .arg(&["/C", "start", "", file_path.as_str()])
        //     .spawn()
        //     .expect("Failed to open file on macOS.");
        Ok(())
    }

    #[cfg(target_os = "linux")]
    pub fn open_file(&self, file_path: String) -> Result<(), String> {
        Command::new("xdg-open")
            .arg(file_path)
            .spawn()
            .expect("Failed to open file on Linux.");
        Ok(())
    }

    pub fn clear(&self) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .clear()
            .map_err(|err| err.to_string())
    }
}
