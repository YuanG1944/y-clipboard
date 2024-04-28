use anyhow::Result;
use std::{
    fs::{self, File},
    time::{SystemTime, UNIX_EPOCH},
};

use crate::{
    clipboard_history::HistoryItem,
    utils::path::{self, create_dir},
};
use rusqlite::{Connection, OpenFlags, ToSql};

const SQLITE_FILE_NAME: &str = "y-clipboard.db";

#[derive(serde::Serialize, serde::Deserialize, Debug, Default, PartialEq)]
pub struct Config {
    pub key: String,
    pub value: String,
}

pub struct SqliteDB {
    pub conn: Connection,
}

#[allow(unused)]
impl SqliteDB {
    pub fn new() -> Self {
        let data_dir = path::app_data_dir().unwrap().join(SQLITE_FILE_NAME);
        let conn =
            Connection::open_with_flags(data_dir, OpenFlags::SQLITE_OPEN_READ_WRITE).unwrap();
        SqliteDB { conn }
    }

    pub fn init() {
        let data_dir = path::app_data_dir().unwrap().join(SQLITE_FILE_NAME);

        let _ = create_dir(&data_dir);

        let conn =
            Connection::open_with_flags(data_dir, OpenFlags::SQLITE_OPEN_READ_WRITE).unwrap();
        let init_history_info_table = r#"
            CREATE TABLE IF NOT EXISTS history_info
            (
                id          VARCHAR(255) NOT NULL PRIMARY KEY,
                text        TEXT,
                html        TEXT,
                rtf         TEXT,
            --     image_id    INTEGER,
            --     file_id     INTEGER,
                image       TEXT,
                files       TEXT,
                favorite    BOOLEAN DEFAULT FALSE,
                tags         TEXT,
                create_time INTEGER,
                formats     TEXT
            --     foreign key (image_id) REFERENCES image_info (id)
            --         foreign key (file_id) REFERENCES file_info (id)
            );
        "#;

        // create table if not exists image_info
        // (
        //     id  integer not null primary key,
        //     ctx text
        // )
        // create table if not exists file_info
        // (
        //     id  integer not null primary key,
        //     paths VARCHAR(255)[]
        // )

        let init_config_table = r#"
            CREATE TABLE IF NOT EXISTS config_table(
                key       VARCHAR(25) NOT NULL PRIMARY KEY,
                value     VARCHAR(128)
            );
        "#;

        let init_expire = r#"
            INSERT INTO config_table (
                key, 
                value
            )
            VALUES ('expire', '-7 day');
        "#;

        let _ = conn.execute(init_history_info_table, ());
        let _ = conn.execute(init_config_table, ());
        let _ = conn.execute(init_expire, ());
    }

    pub fn insert_item(&self, insert_item: HistoryItem) -> Result<i64> {
        let sql = r#"
            INSERT INTO 
            history_info (
                id,
                text,
                html,
                rtf,
                image,
                files,
                favorite,
                tags,
                create_time,
                formats) 
            VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)
        "#;
        match self.conn.execute(
            sql,
            (
                insert_item.get_id(),
                insert_item.get_text(),
                insert_item.get_html(),
                insert_item.get_rtf(),
                insert_item.get_image(),
                insert_item.get_files().join(","),
                insert_item.get_favorite(),
                insert_item.get_tags().join(","),
                insert_item.get_create_time(),
                insert_item.get_formats().join(","),
            ),
        ) {
            Ok(res) => println!("Insert item successfully!"),
            Err(err) => println!("Failed to insert directories: {}", err),
        };
        Ok(self.conn.last_insert_rowid())
    }

    pub fn update_pasted_create_time(&self, id: String) -> Result<()> {
        let sql = "UPDATE history_info SET create_time = ?2 WHERE id = ?1";
        let curr_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        self.conn.execute(sql, (id.as_str(), curr_time))?;
        Ok(())
    }

    pub fn get_config(&self, key: String) -> Result<String> {
        let sql = r#"
            SELECT 
                key,
                value
            FROM 
                config_table
            WHERE
                key = ?1; 
        "#;

        let res: String = self.conn.query_row(sql, [&key], |row| {
            let a = Config {
                key: row.get(0)?,
                value: row.get(1)?,
            };
            row.get(1)
        })?;
        Ok(res)
    }

    pub fn set_config(&self, key: String, value: String) -> Result<i64> {
        println!("key = {}, value = {}", key, value);
        let sql = r#"
            UPDATE config_table SET 
                value = ?2 
            WHERE 
                key = ?1;
        "#;

        self.conn.execute(sql, (&key, &value))?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn delete_item(&self, id: String) -> Result<()> {
        let sql = "DELETE FROM history_info WHERE id = ?1";
        self.conn.execute(sql, [id.as_str()])?;
        Ok(())
    }

    pub fn delete_items(&mut self, ids: Vec<String>) -> Result<()> {
        let placeholders: Vec<String> = ids.iter().map(|_| "?".to_string()).collect();

        let sql = format!(
            "DELETE FROM history_info WHERE id IN ({})",
            placeholders.join(",")
        );

        let tx = self.conn.transaction()?;

        let params: Vec<&dyn ToSql> = ids.iter().map(|id| id as &dyn ToSql).collect();
        // Execute the SQL with dynamic parameters
        tx.execute(&sql, &params[..])?;
        tx.commit()?;

        Ok(())
    }

    pub fn find_all(&self) -> Result<Vec<HistoryItem>> {
        let sql = r#"
            SELECT
                id, 
                text, 
                html, 
                rtf, 
                image, 
                files, 
                favorite,
                tags,
                create_time, 
                formats 
            FROM 
                history_info 
            ORDER BY 
                create_time 
            DESC
         "#;

        let mut stmt = self.conn.prepare(sql)?;
        let mut rows = stmt.query([])?;
        let mut res = vec![];

        while let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let text: String = row.get(1)?;
            let html: String = row.get(2)?;
            let rtf: String = row.get(3)?;
            let image: String = row.get(4)?;
            let files: String = row.get(5)?;
            let favorite: bool = row.get(6)?;
            let tags: String = row.get(7)?;
            let create_time: u64 = row.get(8)?;
            let formats: String = row.get(9)?;
            let item = HistoryItem {
                id,
                text,
                html,
                rtf,
                image,
                files: files.split(',').map(|item| item.to_string()).collect(),
                favorite,
                tags: tags.split(',').map(|item| item.to_string()).collect(),
                create_time,
                formats: formats.split(',').map(|item| item.to_string()).collect(),
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn find_history_by_page(&self, page: usize, page_size: usize) -> Result<Vec<HistoryItem>> {
        let offset = page.saturating_sub(1) * page_size;

        let sql = format!(
            r#"
            SELECT
                id, 
                text, 
                html, 
                rtf, 
                image, 
                files, 
                favorite,
                tags,
                create_time, 
                formats 
            FROM 
                history_info 
            ORDER BY 
                create_time DESC
            LIMIT ?1 OFFSET ?2
            "#
        );

        let mut stmt = self.conn.prepare(&sql)?;
        let mut rows = stmt.query([page_size as u32, offset as u32])?;
        let mut res = Vec::new();

        while let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let text: String = row.get(1)?;
            let html: String = row.get(2)?;
            let rtf: String = row.get(3)?;
            let image: String = row.get(4)?;
            let files: String = row.get(5)?;
            let favorite: bool = row.get(6)?;
            let tags: String = row.get(7)?;
            let create_time: u64 = row.get(8)?;
            let formats: String = row.get(9)?;
            let item = HistoryItem {
                id,
                text,
                html,
                rtf,
                image,
                files: files.split(',').map(|s| s.to_string()).collect(),
                favorite,
                tags: tags.split(',').map(|s| s.to_string()).collect(),
                create_time,
                formats: formats.split(',').map(|s| s.to_string()).collect(),
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn pick_latest_one(&self) -> Result<Vec<HistoryItem>> {
        let sql = r#"
            SELECT
                id, 
                text, 
                html, 
                rtf, 
                image, 
                files, 
                favorite,
                tags,
                create_time, 
                formats 
            FROM 
                history_info 
            ORDER BY 
                create_time 
            DESC LIMIT 1
         "#;

        let mut stmt = self.conn.prepare(sql)?;
        let mut rows = stmt.query([])?;
        let mut res = vec![];

        while let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let text: String = row.get(1)?;
            let html: String = row.get(2)?;
            let rtf: String = row.get(3)?;
            let image: String = row.get(4)?;
            let files: String = row.get(5)?;
            let favorite: bool = row.get(6)?;
            let tags: String = row.get(7)?;
            let create_time: u64 = row.get(8)?;
            let formats: String = row.get(9)?;
            let item = HistoryItem {
                id,
                text,
                html,
                rtf,
                image,
                files: files.split(',').map(|item| item.to_string()).collect(),
                favorite,
                tags: tags.split(',').map(|item| item.to_string()).collect(),
                create_time,
                formats: formats.split(',').map(|item| item.to_string()).collect(),
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn clear_history(&self) -> Result<String> {
        let sql = "DELETE FROM history_info";
        self.conn.execute(sql, []);
        Ok(format!("All data has been deleted!"))
    }

    pub fn clear_overtime_history(&self) -> Result<()> {
        let expire_time_res: std::prelude::v1::Result<String, anyhow::Error> =
            self.get_config("expire".to_string());

        match expire_time_res {
            Ok(expire_time) => {
                let sql = format!(
                    "DELETE FROM history_info WHERE create_time < strftime('%s', 'now', '{}')",
                    expire_time
                );

                self.conn.execute(sql.as_str(), [])?;
                Ok(())
            }
            Err(_) => {
                println!("Fatal: get expire err");
                Ok(())
            }
        }
    }
}
