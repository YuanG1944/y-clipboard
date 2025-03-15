#[derive(Debug, PartialEq)]
pub enum ActiveEnum {
    Text,
    Html,
    RTF,
    Image,
    Files,
}

impl ActiveEnum {
    pub fn from_str(s: &str) -> ActiveEnum {
        match s {
            "text" => ActiveEnum::Text,
            "html" => ActiveEnum::Html,
            "rtf" => ActiveEnum::RTF,
            "image" => ActiveEnum::Image,
            "files" => ActiveEnum::Files,
            _ => ActiveEnum::Text,
        }
    }

    pub fn to_str(active_code: ActiveEnum) -> String {
        match active_code {
            ActiveEnum::Files => "files",
            ActiveEnum::Image => "image",
            ActiveEnum::Text => "text",
            ActiveEnum::RTF => "rtf",
            ActiveEnum::Html => "html",
        }
        .to_string()
    }

    pub fn active_map(active_code: ActiveEnum) -> i32 {
        match active_code {
            ActiveEnum::Files => 0b10000,
            ActiveEnum::Image => 0b01000,
            ActiveEnum::Text => 0b00100,
            ActiveEnum::RTF => 0b00010,
            ActiveEnum::Html => 0b00001,
        }
    }

    pub fn default_format(format: &Vec<String>) -> ActiveEnum {
        let num: i32 = format
            .iter()
            .map(|item| ActiveEnum::active_map(ActiveEnum::from_str(item.as_str())))
            .sum();

        if num >> 4 > 0 {
            return ActiveEnum::Files;
        }
        if num >> 3 > 0 {
            return ActiveEnum::Image;
        }
        if num >> 2 > 0 {
            return ActiveEnum::Text;
        }
        if num >> 1 > 0 {
            return ActiveEnum::RTF;
        }
        if num > 0 {
            return ActiveEnum::Html;
        }

        ActiveEnum::Text
    }
}

#[test]
fn test_sqlite_insert() {
    let res = ActiveEnum::default_format(&vec!["text".to_string(), "html".to_string()]);
    assert_eq!(res, ActiveEnum::Text)
}
