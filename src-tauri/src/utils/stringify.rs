use crypto::{digest::Digest, md5::Md5};

pub fn md5(s: &str) -> String {
    let mut hash = Md5::new();
    hash.input_str(s);
    hash.result_str()
}
