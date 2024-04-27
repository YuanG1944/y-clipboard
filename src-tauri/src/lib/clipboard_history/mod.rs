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
    pub favorite: bool,
    pub tags: Vec<String>,
    pub create_time: u64,
    pub files: Vec<String>,
    pub formats: Vec<String>,
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
            tags: vec![],
            favorite: false,
            create_time,
            files: vec![],
            formats: vec![],
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

    pub fn get_favorite(&self) -> bool {
        self.favorite
    }

    pub fn set_favorite(&mut self, favorite: bool) {
        self.favorite = favorite;
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

    pub fn get_tags(&self) -> &Vec<String> {
        &self.tags
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
