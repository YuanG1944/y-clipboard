fn keycode_map(key_code: u32) -> String {
    match key_code {
        8 => "backspace",
        9 => "tab",
        12 => "clear",
        13 => "enter",
        27 => "esc",
        32 => "space",
        37 => "left",
        38 => "up",
        39 => "right",
        40 => "down",
        46 => "delete",
        45 => "insert",
        36 => "home",
        35 => "end",
        33 => "pageup",
        34 => "pagedown",
        20 => "capslock",
        96 => "num_0",
        97 => "num_1",
        98 => "num_2",
        99 => "num_3",
        100 => "num_4",
        101 => "num_5",
        102 => "num_6",
        103 => "num_7",
        104 => "num_8",
        105 => "num_9",
        106 => "num_multiply",
        107 => "num_add",
        108 => "num_enter",
        109 => "num_subtract",
        110 => "num_decimal",
        111 => "num_divide",
        188 => ",",
        190 => ".",
        191 => "/",
        192 => "`",
        189 => "-",
        187 => "=",
        186 => ";",
        222 => "'",
        219 => "[",
        221 => "]",
        220 => "\\",
        _ => "",
    }
    .to_string()
}

fn function_keycode_map(modifier_code: u32) -> String {
    match modifier_code {
        16 => "shift",
        18 => "alt",
        17 => "ctrl",
        91 => "command",
        _ => "",
    }
    .to_string()
}

fn capitalized(name: &str, is_first_word_upper_case: bool) -> String {
    if name.is_empty() {
        return "".to_string();
    }
    let name = name.to_lowercase();
    if !is_first_word_upper_case {
        return name;
    }
    let capitalized_first = name.chars().next().unwrap().to_uppercase().to_string();
    if name.len() == 1 {
        return capitalized_first;
    }
    let rest = &name[1..];
    capitalized_first + rest
}

pub fn get_short_cut_name(key_code_arr: Vec<u32>, is_first_word_upper_case: bool) -> String {
    let mut key_str = String::new();
    let mut function_key = String::new();
    let mut normal_key = String::new();
    for key_code in key_code_arr {
        if !function_keycode_map(key_code).is_empty() {
            function_key += &capitalized(&function_keycode_map(key_code), is_first_word_upper_case);
            function_key += "+";
        } else if !keycode_map(key_code).is_empty() {
            key_str = capitalized(&keycode_map(key_code), is_first_word_upper_case);
        } else {
            let name = match String::from_utf8(vec![key_code as u8]) {
                Ok(str) => str,
                Err(_) => "".to_string(),
            };
            normal_key = capitalized(&name, is_first_word_upper_case);
        }
    }
    if function_key.is_empty() && key_str.is_empty() {
        return "".to_string();
    }
    // 若只有function_key，不显示
    if !function_key.is_empty() && key_str.is_empty() && normal_key.is_empty() {
        return "".to_string();
    }
    // 若只有keyStr，不显示
    if function_key.is_empty() && !key_str.is_empty() && !normal_key.is_empty() {
        return "".to_string();
    }
    format!("{}{}{}", function_key, key_str, normal_key)
}

#[test]
fn test() {
    let hot_key_str = "global-shortcut:16+67+91";
    let hot_key_arr: Vec<&str> = hot_key_str.split(":").collect();
    let hot_key_arr: Vec<&str> = hot_key_arr[1].split("+").collect();
    let hot_key_arr: Vec<u32> = hot_key_arr
        .iter()
        .map(|x| x.parse::<u32>().unwrap())
        .collect();
    let short_cut_name = get_short_cut_name(hot_key_arr, true);
    println!("{}", short_cut_name);
}
