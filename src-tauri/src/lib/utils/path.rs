use anyhow::Result;
use std::fs::{self, File};
use std::path::PathBuf;
use tauri::api::path::home_dir;

static APP_DIR: &str = "y-clip";
static CONFIG_FILE: &str = "config.json";

pub fn app_home_dir() -> Result<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        use tauri::utils::platform::current_exe;

        let app_exe = current_exe()?;
        let app_exe = dunce::canonicalize(app_exe)?;
        let app_dir = app_exe
            .parent()
            .ok_or(anyhow::anyhow!("failed to get the portable app dir"))?;
        Ok(PathBuf::from(app_dir).join(".config").join(APP_DIR))
    }

    #[cfg(not(target_os = "windows"))]
    Ok(home_dir()
        .ok_or(anyhow::anyhow!("failed to get the app home dir"))?
        .join(".config")
        .join(APP_DIR))
}

#[allow(unused)]
pub fn app_logs_dir() -> Result<PathBuf> {
    Ok(app_home_dir()?.join("logs"))
}

pub fn config_path() -> Result<PathBuf> {
    Ok(app_home_dir()?.join(CONFIG_FILE))
}

#[allow(unused)]
pub fn app_data_dir() -> Result<PathBuf> {
    Ok(app_home_dir()?.join("data"))
}

pub fn app_data_img_dir() -> Result<PathBuf> {
    Ok(app_data_dir()?.join("img"))
}

#[allow(unused)]
pub fn create_dir(path: &PathBuf) -> Result<(), String> {
    Ok(if !std::path::Path::new(&path).exists() {
        if let Some(parent) = std::path::Path::new(path).parent() {
            if fs::create_dir_all(parent).is_ok() {
                match File::create(path) {
                    Ok(_) => {
                        match File::create(&path) {
                            Ok(_) => println!("File:{} created successfully! ", path.display()),
                            Err(err) => {
                                println!("Failed to create directories: {}", err);
                            }
                        };
                    }
                    Err(e) => println!("Failed to create file: {:?}", e),
                }
            } else {
                println!("Failed to create directories");
            }
        } else {
            println!("Invalid path");
        }
    })
}
