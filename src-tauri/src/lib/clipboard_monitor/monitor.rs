use base64::{engine::general_purpose, Engine as _};
use clipboard_files;
use clipboard_master::{CallbackResult, ClipboardHandler};
use clipboard_rs::{common::RustImage, Clipboard, ClipboardContext, ContentFormat, RustImageData};
use image::EncodableLayout;
use serde_json;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::{Manager, Runtime};

use crate::clipboard_history::HistoryItem;
use crate::clipboard_history::HistoryStore;

pub struct ClipboardMonitor<R>
where
    R: Runtime,
{
    app_handle: tauri::AppHandle<R>,
    running: Arc<Mutex<bool>>,
    store: Arc<Mutex<HistoryStore>>,
    manager: ClipboardManager,
}

impl<R> ClipboardMonitor<R>
where
    R: Runtime,
{
    pub fn new(
        app_handle: tauri::AppHandle<R>,
        running: Arc<Mutex<bool>>,
        store: Arc<Mutex<HistoryStore>>,
    ) -> Self {
        let manager: ClipboardManager = ClipboardManager::default();
        Self {
            app_handle,
            running,
            store,
            manager,
        }
    }

    pub fn item_collect(&self) -> HistoryItem {
        let mut item = HistoryItem::new();
        let formats = self
            .manager
            .clipboard
            .lock()
            .unwrap()
            .available_formats()
            .unwrap();

        item.set_formats(formats);

        if self.manager.has_text().unwrap() {
            item.set_text(self.manager.read_text().unwrap());
        }
        if self.manager.has_html().unwrap() {
            item.set_html(self.manager.read_html().unwrap());
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

        println!("-----clipboard change-----");
        // push item to history store
        let item: HistoryItem = self.item_collect();
        self.store.try_lock().map_err(|err| err.to_string()).unwrap().push(item);

        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: std::io::Error) -> CallbackResult {
        println!("clipboard err--->");
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
        let arr = self.store.lock().map_err(|err| err.to_string()).unwrap();
        println!("currStore--> {:?}", arr.get_store());
        match serde_json::to_string(arr.get_store()) {
            Ok(json_str) => Ok(json_str.clone()),
            Err(e) => Err(format!("Error serializing VecDeque to JSON: {:?}", e)),
        }
    }

    pub fn has(&self, format: ContentFormat) -> Result<bool, String> {
        Ok(self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .has(format))
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
        let res = clipboard_files::read();
        match res {
            Ok(files) => {
                let files_str = files
                    .iter()
                    .map(|file| file.to_str().unwrap().to_string())
                    .collect::<Vec<_>>();
                Ok(files_str)
            }
            Err(err) => match err {
                clipboard_files::Error::NoFiles => Err("No files in clipboard".to_string()),
                _ => Err("Unknown error".to_string()),
            },
        }
    }

    /// read image from clipboard and return a base64 string
    pub fn read_image_base64(&self) -> Result<String, String> {
        let image_bytes = self.read_image_binary()?;
        let base64_str = general_purpose::STANDARD_NO_PAD.encode(&image_bytes);
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
        println!("writing bin image to clipboard");
        let img = RustImageData::from_bytes(bytes.as_bytes()).map_err(|err| err.to_string())?;
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_image(img)
            .unwrap();
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
