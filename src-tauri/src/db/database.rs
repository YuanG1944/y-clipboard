use anyhow::Result;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::{
    clipboard_history::{FindHistoryReq, HistoryItem, TagsStruct},
    utils::path::{self, create_dir},
};
use rusqlite::{Connection, OpenFlags, ToSql};

const SQLITE_FILE_NAME: &str = "y-clipboard.db";

pub struct QueryValue {
    pub key: String,
    pub tags: Vec<String>,
    pub page: usize,
    pub page_size: usize,
}

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
                image       TEXT,
                files       TEXT,
                create_time INTEGER,
                formats     TEXT,
                active      VARCHAR(24),
                md5_text    VARCHAR(200) DEFAULT '',
                md5_html    VARCHAR(200) DEFAULT '',
                md5_rtf     VARCHAR(200) DEFAULT '',
                md5_image   VARCHAR(200) DEFAULT ''
            );
        "#;

        let init_favorite_table = r#"
            CREATE TABLE IF NOT EXISTS tags_table
            (
                id          VARCHAR(255) NOT NULL PRIMARY KEY,
                name        VARCHAR(24)  UNIQUE,
                create_time INTEGER

            );
        "#;

        let init_favorite_connect_history_table = r#"
            CREATE TABLE IF NOT EXISTS favorite_connect_history_table
            (
                tag_id              VARCHAR(255) NOT NULL,
                history_id          VARCHAR(255) NOT NULL
            )
        "#;

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
        let _ = conn.execute(init_favorite_table, ());
        let _ = conn.execute(init_favorite_connect_history_table, ());
        let _ = conn.execute(init_config_table, ());
        let _ = conn.execute(init_expire, ());
        let _ = Self::new().insert_tag(Uuid::new_v4().to_string(), "Favorite".to_string());
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
                create_time,
                formats,
                md5_text,
                md5_html,
                md5_rtf,
                md5_image,
                active
            ) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
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
                insert_item.get_create_time(),
                insert_item.get_formats().join(","),
                insert_item.get_md5_text(),
                insert_item.get_md5_html(),
                insert_item.get_md5_rtf(),
                insert_item.get_md5_image(),
                insert_item.get_active(),
            ),
        ) {
            Ok(res) => println!("Insert item successfully!"),
            Err(err) => println!("Failed to insert directories: {}", err),
        };
        Ok(self.conn.last_insert_rowid())
    }

    pub fn insert_item_distinct(&self, mut insert_item: HistoryItem) -> Result<()> {
        if (insert_item.get_text().trim().is_empty()
            && insert_item.get_image().trim().is_empty()
            && insert_item.get_rtf().trim().is_empty())
        {
            return Ok(());
        }

        let mut md5_key: String = "".to_string();
        let mut md5_value: String = "".to_string();

        if insert_item.get_formats().contains(&"html".to_string()) {
            md5_key = "md5_html".to_string();
            md5_value = insert_item.md5_html.clone();
        }

        if insert_item.get_formats().contains(&"text".to_string()) {
            md5_key = "md5_text".to_string();
            md5_value = insert_item.md5_text.clone();
        }

        if insert_item.get_formats().contains(&"image".to_string()) {
            md5_key = "md5_image".to_string();
            md5_value = insert_item.md5_image.clone();
        }

        match self.find_record_by_md5(md5_key, md5_value) {
            Ok(id) => {
                self.update_pasted_create_time(id)?;
            }
            Err(_e) => {
                println!("{}", _e);
                self.insert_item(insert_item)?;
            }
        }
        Ok(())
    }

    fn find_record_by_md5(&self, md5_key: String, md5_value: String) -> Result<String> {
        let sql = format!(
            "SELECT id FROM history_info WHERE {} = '{}'",
            &md5_key, &md5_value
        );
        let res: String = self.conn.query_row(&sql, [], |row| row.get(0))?;
        Ok(res)
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

    pub fn update_pasted_active(&self, id: String, active: String) -> Result<()> {
        let sql = "UPDATE history_info SET active = ?2 WHERE id = ?1";
        self.conn.execute(sql, (id.as_str(), active.as_str()))?;
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

        let res: String = self.conn.query_row(sql, [&key], |row| row.get(1))?;
        Ok(res)
    }

    pub fn set_config(&self, key: String, value: String) -> Result<i64> {
        println!("key = {}, value = {}", key, value);

        let sql = r#"
            INSERT INTO config_table (key, value)
            VALUES (?1, ?2)
            ON CONFLICT(key) DO UPDATE SET
            value = ?2;
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
                create_time, 
                formats,
                md5_text,
                md5_html,
                md5_rtf,
                md5_image,
                active
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
            let create_time: u64 = row.get(6)?;
            let formats: String = row.get(7)?;
            let md5_text: String = row.get(8)?;
            let md5_html: String = row.get(9)?;
            let md5_rtf: String = row.get(10)?;
            let md5_image: String = row.get(11)?;
            let active: String = row.get(12)?;
            let tags = self.get_history_tags(id.clone())?;
            let item = HistoryItem {
                id,
                text,
                html,
                rtf,
                image,
                files: files.split(',').map(|item| item.to_string()).collect(),
                active,
                create_time,
                md5_text,
                md5_html,
                md5_image,
                md5_rtf,
                tags,
                formats: formats.split(',').map(|item| item.to_string()).collect(),
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn get_tags_all(&self) -> Result<Vec<TagsStruct>> {
        let sql = r#"
            SELECT
                id, 
                name,
                create_time
            FROM 
                tags_table 
            ORDER BY 
                create_time 
            ASC
         "#;

        let mut stmt = self.conn.prepare(sql)?;
        let mut rows = stmt.query([])?;
        let mut res = vec![];

        while let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let create_time: u64 = row.get(2)?;

            let item = TagsStruct {
                id,
                name,
                create_time,
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn get_tags_by_id(&self, id: String) -> Result<TagsStruct> {
        let sql = r#"
            SELECT
                id, 
                name,
                create_time
            FROM 
                tags_table 
            WHERE
                id = ?1;
        "#;
        let mut stmt = self.conn.prepare(sql)?;
        let res = self.conn.query_row(sql, [&id], |row| {
            Ok(TagsStruct {
                id: row.get(0)?,
                name: row.get(1)?,
                create_time: row.get(2)?,
            })
        })?;
        Ok(res)
    }

    pub fn get_history_tags(&self, history_id: String) -> Result<Vec<TagsStruct>> {
        let sql = r#"
            SELECT DISTINCT
                tag_id
            FROM 
                favorite_connect_history_table 
            WHERE
                history_id = ?1;
         "#;

        let mut stmt = self.conn.prepare(sql)?;
        let mut rows = stmt.query([history_id])?;
        let mut res = Vec::new();

        while let Some(row) = rows.next()? {
            let tag_id: String = row.get(0)?;
            let item = self.get_tags_by_id(tag_id)?;
            res.push(item);
        }

        Ok(res)
    }

    pub fn insert_tag(&self, id: String, name: String) -> Result<()> {
        let sql: &str = r#"
            INSERT OR IGNORE INTO tags_table (
                id, 
                name,
                create_time
            )
            VALUES (?1, ?2, ?3);
        "#;
        match self.conn.execute(
            sql,
            (
                id,
                name,
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            ),
        ) {
            Ok(res) => println!("Insert tags successfully!"),
            Err(err) => println!("Failed to tags directories: {}", err),
        };
        Ok(())
    }

    pub fn delete_tag(&self, id: String) -> Result<()> {
        let sql = "DELETE FROM tags_table WHERE id = ?1";
        self.conn.execute(sql, [id.as_str()])?;
        Ok(())
    }

    pub fn update_tag(&self, id: String, name: String) -> Result<()> {
        let sql = "UPDATE tags_table SET name = ?2 WHERE id = ?1";
        self.conn.execute(sql, (id.as_str(), name.as_str()))?;
        Ok(())
    }

    pub fn subscribe_history_to_tags(&self, history_id: String, tag_id: String) -> Result<()> {
        let sql: &str = r#"
            INSERT INTO favorite_connect_history_table (
                history_id,
                tag_id 
            )
            VALUES (?1, ?2);
        "#;
        match self.conn.execute(sql, (history_id, tag_id)) {
            Ok(res) => println!("Insert tags successfully!"),
            Err(err) => println!("Failed to tags directories: {}", err),
        };
        Ok(())
    }

    pub fn cancel_single_history_to_tags(&self, history_id: String, tag_id: String) -> Result<()> {
        let sql: &str =
            r#"DELETE FROM favorite_connect_history_table WHERE history_id = ?1 and tag_id = ?2"#;
        match self.conn.execute(sql, (history_id, tag_id)) {
            Ok(res) => println!("Delete tags successfully!"),
            Err(err) => println!("Failed to tags directories: {}", err),
        };
        Ok(())
    }

    pub fn find_history_by_page(&self, page: usize, page_size: usize) -> Result<Vec<HistoryItem>> {
        let offset: usize = page.saturating_sub(1) * page_size;

        let sql = format!(
            r#"
                SELECT
                    id, 
                    text, 
                    html, 
                    rtf, 
                    image, 
                    files, 
                    create_time, 
                    formats,
                    md5_text,
                    md5_html,
                    md5_rtf,
                    md5_image,
                    active
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
            let create_time: u64 = row.get(6)?;
            let formats: String = row.get(7)?;
            let md5_text: String = row.get(8)?;
            let md5_html: String = row.get(9)?;
            let md5_rtf: String = row.get(10)?;
            let md5_image: String = row.get(11)?;
            let active: String = row.get(12)?;

            let tags = self.get_history_tags(id.clone())?;
            let item = HistoryItem {
                id,
                text,
                html,
                rtf,
                image,
                files: files.split(',').map(|s| s.to_string()).collect(),
                active,
                create_time,
                md5_image,
                md5_html,
                md5_rtf,
                md5_text,
                tags,
                formats: formats.split(',').map(|s| s.to_string()).collect(),
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn find_histories(&self, req: FindHistoryReq) -> Result<Vec<HistoryItem>> {
        let mut sql: String = String::new();
        let mut params: Vec<String> = vec![];

        sql.push_str(
            "
            SELECT 
                id, 
                text, 
                html, 
                rtf, 
                image, 
                files, 
                create_time, 
                formats,
                md5_text,
                md5_html,
                md5_rtf,
                md5_image,
                active
            FROM 
                history_info h
            LEFT JOIN 
                favorite_connect_history_table f 
            ON 
                h.id = f.history_id
            WHERE 
                1=1
            ",
        );

        if let Some(tag) = req.tag {
            if !tag.is_empty() {
                params.push(tag.to_string());
                sql.push_str(format!("AND tag_id = ?{}", params.len()).as_str());
            }
        }

        if let Some(k) = &req.key {
            if !k.is_empty() {
                params.push(format!("%{}%", k));
                sql.push_str(format!("AND text LIKE ?{}", params.len()).as_str());
            }
        }

        if let (Some(page), Some(page_size)) = (&req.page, &req.page_size) {
            let offset = page.saturating_sub(1) * page_size;
            params.push(page_size.to_string());
            params.push(offset.to_string());

            sql.push_str(
                format!(
                    "
                    ORDER BY
                       create_time DESC
                    LIMIT ?{} OFFSET ?{}
                    ",
                    params.len() - 1,
                    params.len()
                )
                .as_str(),
            );
        }

        let mut stmt = self.conn.prepare(&sql)?;
        let mut rows = stmt.query(rusqlite::params_from_iter(params))?;
        let mut res = Vec::new();

        while let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let text: String = row.get(1)?;
            let html: String = row.get(2)?;
            let rtf: String = row.get(3)?;
            let image: String = row.get(4)?;
            let files: String = row.get(5)?;
            let create_time: u64 = row.get(6)?;
            let formats: String = row.get(7)?;
            let md5_text: String = row.get(8)?;
            let md5_html: String = row.get(9)?;
            let md5_rtf: String = row.get(10)?;
            let md5_image: String = row.get(11)?;
            let active: String = row.get(12)?;
            let tags = self.get_history_tags(id.clone())?;
            let item = HistoryItem {
                id,
                text,
                html,
                rtf,
                image,
                files: files.split(',').map(|s| s.to_string()).collect(),
                active,
                create_time,
                md5_image,
                md5_html,
                md5_rtf,
                md5_text,
                tags,
                formats: formats.split(',').map(|s| s.to_string()).collect(),
            };
            res.push(item);
        }
        Ok(res)
    }

    pub fn clear_history(&self) -> Result<String> {
        let sql_history_info = "DELETE FROM history_info";
        self.conn.execute(sql_history_info, []);

        let sql_favorite_connect_history_table = "DELETE FROM favorite_connect_history_table";
        self.conn.execute(sql_favorite_connect_history_table, []);

        Ok(format!("All data has been deleted!"))
    }

    pub fn clear_overtime_history(&self) -> Result<()> {
        let expire_time_res: std::prelude::v1::Result<String, anyhow::Error> =
            self.get_config("expire".to_string());

        match expire_time_res {
            Ok(expire_time) => {
                let sql = format!(
                    "DELETE FROM 
                        history_info
                     WHERE 
                        create_time < strftime('%s', 'now', '{}') 
                     AND
                        id 
                     NOT IN (
                        SELECT 
                            history_id 
                        FROM 
                            favorite_connect_history_table
                        )",
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

#[test]
fn test_sqlite_query() {
    SqliteDB::init();
    let r = FindHistoryReq {
        key: Some("".to_string()),
        tag: Some("fcc45fe6-fbe0-455d-bd79-7ff39ebae2be".to_string()),
        page: Some(1),
        page_size: Some(1),
    };

    let res = SqliteDB::new().find_histories(r);
    println!("info-------> {:?}", res);
    assert_eq!(true, true)
}

#[test]
fn test_path() {
    let data_dir = path::app_data_dir().unwrap().join(SQLITE_FILE_NAME);

    let _ = create_dir(&data_dir);

    println!("info-------> {:?}", data_dir.to_str());
    assert_eq!(true, true)
}
