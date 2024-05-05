use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(serde::Serialize, serde::Deserialize, Debug, Default, PartialEq)]
pub struct HistoryItem {
    pub id: String,
    pub text: String,
    pub html: String,
    pub rtf: String,
    pub image: String,
    pub create_time: u64,
    pub files: Vec<String>,
    pub md5_text: String,
    pub md5_html: String,
    pub md5_rtf: String,
    pub md5_image: String,
    pub formats: Vec<String>,
    pub tags: Vec<TagsStruct>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Default, PartialEq)]
pub struct TagsStruct {
    pub id: String,
    pub name: String,
    pub color: String,
    pub create_time: u64,
}

impl HistoryItem {
    pub fn new() -> Self {
        let create_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            id: Uuid::new_v4().to_string(),
            text: String::from(""),
            html: String::from(""),
            rtf: String::from(""),
            image: String::from(""),
            create_time,
            files: vec![],
            md5_text: String::from(""),
            md5_html: String::from(""),
            md5_image: String::from(""),
            md5_rtf: String::from(""),
            formats: vec![],
            tags: vec![],
        }
    }

    pub fn get_id(&self) -> &str {
        &self.id.as_str()
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

    pub fn get_create_time(&self) -> u64 {
        self.create_time
    }

    pub fn get_formats(&self) -> &Vec<String> {
        &self.formats
    }

    pub fn set_formats(&mut self, formats: Vec<String>) {
        self.formats = Vec::from(formats);
    }

    pub fn push_formats(&mut self, format: String) {
        self.formats.push(format);
    }

    pub fn get_md5_text(&self) -> &str {
        &self.md5_text
    }

    pub fn get_md5_html(&self) -> &str {
        &self.md5_html
    }

    pub fn get_md5_rtf(&self) -> &str {
        &self.md5_rtf
    }

    pub fn get_md5_image(&self) -> &str {
        &self.md5_image
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
        self.history.push_front(val);
    }

    pub fn set_store(&mut self, val: VecDeque<HistoryItem>) {
        self.history = val;
    }

    pub fn get_store(&self) -> &VecDeque<HistoryItem> {
        &self.history
    }
}
