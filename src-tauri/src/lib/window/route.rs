pub enum RoutesEnum {
    Config(String),
    Main(String),
}

pub fn extract_string(r: RoutesEnum) -> String {
    match r {
        RoutesEnum::Main(route) => route,
        RoutesEnum::Config(route) => route,
    }
}

pub struct WindowConfig {
    pub label: RoutesEnum,
    pub title: String,
    pub url: String,
    pub width: f64,
    pub height: f64,
    pub hidden_title: bool,
    pub resizable: bool,
    pub fullscreen: bool,
    pub always_on_top: bool,
    pub transparent: bool,
    pub decorations: bool,
    pub skip_taskbar: bool,
    pub closable: bool,
}

impl WindowConfig {
    pub fn main() -> Self {
        WindowConfig {
            label: RoutesEnum::Main(String::from("main")),
            title: "y-clipboard".into(),
            url: "/main".into(),
            width: 0.0,
            height: 0.0,
            decorations: false,
            fullscreen: false,
            resizable: false,
            hidden_title: true,
            always_on_top: true,
            transparent: true,
            skip_taskbar: true,
            closable: false,
        }
    }

    pub fn config() -> Self {
        WindowConfig {
            label: RoutesEnum::Config(String::from("config")),
            title: "Preferences".into(),
            url: "/config".into(),
            width: 648.0,
            height: 480.0,
            decorations: true,
            fullscreen: false,
            resizable: false,
            hidden_title: false,
            always_on_top: true,
            transparent: false,
            skip_taskbar: true,
            closable: true,
        }
    }
}
