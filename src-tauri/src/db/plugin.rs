use super::database::SqliteDB;
use std::sync::Arc;

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use tokio::sync::{mpsc, Mutex};
use tokio::time::{self, Duration};
pub struct IntervalTask {
    interval: Duration,
    tx: mpsc::Sender<Duration>,
    rx: mpsc::Receiver<Duration>,
}

impl IntervalTask {
    pub fn new(interval: Duration) -> Self {
        let (tx, rx) = mpsc::channel(1);
        IntervalTask { interval, tx, rx }
    }

    pub async fn start(&mut self) {
        let mut interval = time::interval(self.interval);

        loop {
            tokio::select! {
                _ = interval.tick() => {
                    // Clear detection and clear history data once a day
                    let _ = SqliteDB::new().clear_overtime_history();
                    println!("Performing scheduled task...");
                },
                new_interval = self.rx.recv() => {
                    if let Some(new_interval) = new_interval {
                        // 当接收到新的间隔时，更新间隔并重启定时器
                        self.interval = new_interval;
                        interval = time::interval(self.interval);
                        println!("Interval updated and task restarted.");
                    } else {
                        // 如果通道关闭，结束循环，终止任务
                        println!("Task manager stopping...");
                        break;
                    }
                }
            }
        }
    }

    pub async fn update_interval(&self, new_interval: Duration) -> Result<(), &'static str> {
        self.tx
            .send(new_interval)
            .await
            .map_err(|_| "Failed to send new interval")
    }
}

pub struct DBManage {
    secs: u64,
    interval_task: Arc<Mutex<IntervalTask>>,
}

impl DBManage {
    pub fn new(secs: u64) -> Self {
        DBManage {
            secs,
            interval_task: Arc::new(Mutex::from(IntervalTask::new(
                tokio::time::Duration::from_secs(secs),
            ))),
        }
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

    pub async fn restart_clear_history_interval(&self) -> anyhow::Result<()> {
        let interval_task = Arc::clone(&self.interval_task);
        let _ = interval_task
            .try_lock()
            .map_err(|err| err.to_string())
            .unwrap()
            .update_interval(tokio::time::Duration::from_secs(self.secs))
            .await;
        Ok(())
    }
}

#[tauri::command]
pub fn clear_history(manager: State<'_, DBManage>) -> Result<(), String> {
    let _ = manager.clear_history();
    Ok(())
}

#[tauri::command]
pub fn get_config(manager: State<'_, DBManage>, key: String) -> Result<String, String> {
    match manager.get_config(key) {
        Ok(res) => Ok(res),
        Err(_) => Ok(String::from("")),
    }
}

#[tauri::command]
pub fn set_config(manager: State<'_, DBManage>, key: String, value: String) -> Result<(), String> {
    let _ = manager.set_config(key, value);
    Ok(())
}

#[tauri::command]
pub fn restart_clear_history_interval(manager: State<'_, DBManage>) -> Result<(), String> {
    let _ = manager.restart_clear_history_interval();
    Ok(())
}

pub fn init<R: Runtime>(secs: u64) -> TauriPlugin<R> {
    Builder::new("database")
        .setup(move |app, _api| {
            let state = DBManage::new(secs);

            let interval_task = Arc::clone(&state.interval_task);

            tokio::spawn(async move {
                interval_task
                    .try_lock()
                    .map_err(|err| err.to_string())
                    .unwrap()
                    .start()
                    .await;
            });

            app.manage(state);
            Ok(())
        })
        .build()
}
