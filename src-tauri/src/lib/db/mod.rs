use anyhow::Result;
use std::fs::File;

use crate::{clipboard_history::HistoryItem, utils::path};
use rusqlite::{Connection, OpenFlags};

const SQLITE_FILE_NAME: &str = "data_v1_1_8.sqlite";

#[derive(serde::Serialize, serde::Deserialize, Debug, Default)]
pub struct QueryReq {
    pub key: Option<String>,
    pub limit: Option<usize>,
    pub is_favorite: Option<bool>,
    pub tags: Option<Vec<String>>,
}

pub struct SqliteDB {
    pub conn: Connection,
}

impl SqliteDB {
    pub fn new() -> Self {
        let data_dir = path::app_data_dir().unwrap().join(SQLITE_FILE_NAME);
        let conn =
            Connection::open_with_flags(data_dir, OpenFlags::SQLITE_OPEN_READ_WRITE).unwrap();
        SqliteDB { conn }
    }

    pub fn init() {
        let data_dir = path::app_data_dir().unwrap().join(SQLITE_FILE_NAME);
        if !std::path::Path::new(&data_dir).exists() {
            File::create(&data_dir).unwrap();
        }
        let conn =
            Connection::open_with_flags(data_dir, OpenFlags::SQLITE_OPEN_READ_WRITE).unwrap();
        let init_sql = r#"
        create table if not exists history_info
        (
            id          VARCHAR(255) NOT NULL PRIMARY KEY,
            text        TEXT,
            html        TEXT,
            rtf         TEXT,
            image       TEXT,
            favorite    BOOLEAN DEFAULT FALSE,
            tag         VARCHAR(256) DEFAULT ''
            create_time BIGINT,
            is_favorite INTEGER DEFAULT 0,
            files       VARCHAR(255)[], 
            formats     VARCHAR(255)[]
        );
        "#;
        conn.execute(init_sql, ()).unwrap();
    }

    pub fn insert_item(&self, item: HistoryItem) -> Result<i64> {
        // let sql = "insert into record (content,md5,create_time,is_favorite,data_type,content_preview) values (?1,?2,?3,?4,?5,?6)";
        Ok(self.conn.last_insert_rowid())
    }
}
