use serde::Serialize;
use std::collections::VecDeque;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct HistoryItem {
    id: String,
    text: String,
    html: String,
    formats: Vec<String>,
}

impl HistoryItem {
    pub fn new() -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            text: String::from(""),
            html: String::from(""),
            formats: vec![],
        }
    }

    pub fn set_text(&mut self, text: String) {
        self.text = text;
    }
    pub fn set_html(&mut self, html: String) {
        self.html = html;
    }
    pub fn set_formats(&mut self, formats: Vec<String>) {
        self.formats = Vec::from(formats);
    }
}

#[derive(Debug, Serialize)]
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
