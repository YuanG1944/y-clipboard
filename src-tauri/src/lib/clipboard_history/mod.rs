use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryItem {
    id: String,
    text: String,
    html: String,
    rtf: String,
    image: String,
    timestamp: u128,
    files: Vec<String>,
    formats: Vec<String>,
}

impl HistoryItem {
    pub fn new() -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis();

        Self {
            id: Uuid::new_v4().to_string(),
            text: String::from(""),
            html: String::from(""),
            rtf: String::from(""),
            image: String::from(""),
            timestamp,
            files: vec![],
            formats: vec![],
        }
    }

    pub fn get_text(&self) -> &str {
        &self.text.as_str()
    }

    pub fn set_text(&mut self, text: String) {
        self.text = text;
    }

    pub fn get_html(&self) -> &str {
        &self.html.as_str()
    }

    pub fn set_html(&mut self, html: String) {
        self.html = html;
    }

    pub fn get_rtf(&self) -> &str {
        &self.rtf.as_str()
    }

    pub fn set_rtf(&mut self, rtf: String) {
        self.rtf = rtf;
    }

    pub fn get_image(&self) -> &str {
        &self.image.as_str()
    }

    pub fn set_image(&mut self, image: String) {
        self.image = image;
    }

    pub fn get_files(&self) -> &Vec<String> {
        &self.files
    }

    pub fn set_files(&mut self, files: Vec<String>) {
        self.files = Vec::from(files);
    }

    pub fn set_formats(&mut self, formats: Vec<String>) {
        self.formats = Vec::from(formats);
    }

    pub fn push_formats(&mut self, format: String) {
        self.formats.push(format);
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryStore {
    history: VecDeque<HistoryItem>,
}

impl HistoryStore {
    pub fn new() -> Self {
        Self {
            history: VecDeque::new(),
        }
    }

    pub fn push(&mut self, val: HistoryItem) {
        println!("HistoryItem--> {:?}", val);
        self.history.push_front(val);
    }

    pub fn set_store(&mut self, val: VecDeque<HistoryItem>) {
        self.history = val;
    }

    pub fn get_store(&self) -> &VecDeque<HistoryItem> {
        &self.history
    }
}
