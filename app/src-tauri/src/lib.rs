use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use chrono::Local;

// ── 配置管理 ──

#[derive(Serialize, Deserialize)]
struct AppConfig {
    notes_dir: Option<String>,
}

fn config_path() -> PathBuf {
    let home = dirs::home_dir().expect("无法获取home目录");
    home.join(".notebook").join("config.json")
}

fn read_config() -> AppConfig {
    let path = config_path();
    if path.exists() {
        fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or(AppConfig { notes_dir: None })
    } else {
        AppConfig { notes_dir: None }
    }
}

fn save_config(config: &AppConfig) -> Result<(), String> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}

/// 获取笔记存储目录
fn notes_dir() -> PathBuf {
    let config = read_config();
    if let Some(dir) = config.notes_dir.as_deref().filter(|d| !d.is_empty()) {
        let path = PathBuf::from(dir);
        if !path.exists() {
            fs::create_dir_all(&path).expect("无法创建笔记目录");
        }
        path
    } else {
        let home = dirs::home_dir().expect("无法获取home目录");
        let dir = home.join("Notebook");
        if !dir.exists() {
            fs::create_dir_all(&dir).expect("无法创建Notebook目录");
        }
        dir
    }
}

#[tauri::command]
fn get_notes_dir() -> Result<String, String> {
    let path = notes_dir();
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn set_notes_dir(path: String) -> Result<(), String> {
    if path.trim().is_empty() {
        return Err("路径不能为空".to_string());
    }
    let config = AppConfig {
        notes_dir: Some(path.trim().to_string()),
    };
    save_config(&config)?;
    // 确保目录存在
    let dir = notes_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NoteSummary {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
    pub preview: String,
}

/// 从内容中提取标题（优先找 h1 或 # ，否则取第一段前30个字符）
fn extract_title(content: &str) -> String {
    // 先找 HTML 的 h1 标签
    for line in content.lines() {
        let trimmed = line.trim();
        if let Some(h1_start) = trimmed.find("<h1>") {
            if let Some(h1_end) = trimmed.find("</h1>") {
                let title = &trimmed[h1_start + 4..h1_end];
                let title = title.trim();
                if !title.is_empty() {
                    return title.to_string();
                }
            }
        }
    }
    // 再找 markdown 的 #
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("# ") {
            return trimmed[2..].to_string();
        }
    }
    // 取第一行非空内容的前30个字符
    for line in content.lines() {
        let trimmed = line.trim();
        if !trimmed.is_empty() {
            let chars: Vec<char> = trimmed.chars().collect();
            if chars.len() > 30 {
                let partial: String = chars[..30].iter().collect();
                return format!("{}...", partial);
            } else {
                return trimmed.to_string();
            }
        }
    }
    "无标题".to_string()
}

/// 生成笔记预览（前100个字，去掉 HTML 标签和 markdown 符号）
fn make_preview(content: &str) -> String {
    // 先去掉 HTML 标签
    let no_html = content.replace("<p>", " ").replace("</p>", " ")
        .replace("<h1>", " ").replace("</h1>", " ")
        .replace("<h2>", " ").replace("</h2>", " ")
        .replace("<h3>", " ").replace("</h3>", " ")
        .replace("<strong>", "").replace("</strong>", "")
        .replace("<em>", "").replace("</em>", "")
        .replace("<a>", "").replace("</a>", "")
        .replace("<ol>", "").replace("</ol>", "")
        .replace("<ul>", "").replace("</ul>", "")
        .replace("<li>", "").replace("</li>", "")
        .replace("<br>", " ").replace("<br/>", " ");
    let plain: String = no_html
        .chars()
        .filter(|c| !matches!(c, '#' | '*' | '[' | ']' | '(' | ')' | '>' | '-'))
        .collect();
    let plain = plain.trim();
    let chars: Vec<char> = plain.chars().collect();
    if chars.len() > 100 {
        let partial: String = chars[..100].iter().collect();
        format!("{}...", partial)
    } else {
        plain.to_string()
    }
}

/// 创建新笔记
#[tauri::command]
fn create_note(title: Option<String>) -> Result<Note, String> {
    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let id = Local::now().format("%Y%m%d%H%M%S").to_string();
    
    let note_title = title.unwrap_or_else(|| "新笔记".to_string());
    let content = format!("# {}\n\n", note_title);
    
    let note = Note {
        id: id.clone(),
        title: note_title,
        content,
        created_at: now.clone(),
        updated_at: now,
    };
    
    save_note_internal(&note)?;
    Ok(note)
}

/// 保存笔记到文件
fn save_note_internal(note: &Note) -> Result<(), String> {
    let dir = notes_dir();
    let safe_title: String = note.title.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect();
    let filename = format!("{}.md", safe_title);
    let path = dir.join(&filename);
    
    // 在内容前面加frontmatter
    let file_content = format!(
        "---\nid: {}\ncreated: {}\nupdated: {}\n---\n\n{}",
        note.id, note.created_at, note.updated_at, note.content
    );
    
    fs::write(&path, file_content).map_err(|e| e.to_string())?;
    Ok(())
}

/// 保存笔记
#[tauri::command]
fn save_note(id: String, title: String, content: String, created_at: String) -> Result<Note, String> {
    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    let note = Note {
        id,
        title,
        content,
        created_at,
        updated_at: now,
    };
    
    save_note_internal(&note)?;
    Ok(note)
}

/// 列出所有笔记
#[tauri::command]
fn list_notes() -> Result<Vec<NoteSummary>, String> {
    list_notes_internal()
}

fn list_notes_internal() -> Result<Vec<NoteSummary>, String> {
    let dir = notes_dir();
    let mut notes: Vec<NoteSummary> = Vec::new();
    
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        
        // 跳过index.md和log.md
        let filename = path.file_stem().and_then(|s| s.to_str()).unwrap_or("");
        if filename == "index" || filename == "log" {
            continue;
        }
        
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let (id, created, updated) = parse_frontmatter(&content);
        let body = strip_frontmatter(&content);
        let title = extract_title(&body);
        let preview = make_preview(&body);
        
        notes.push(NoteSummary {
            id: id.unwrap_or_else(|| filename.to_string()),
            title,
            created_at: created.unwrap_or_default(),
            updated_at: updated.unwrap_or_default(),
            preview,
        });
    }
    
    // 按更新时间倒序
    notes.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(notes)
}

/// 读取笔记内容
#[tauri::command]
fn read_note(id: String) -> Result<Note, String> {
    let dir = notes_dir();
    
    // 遍历找到匹配id的文件
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let (file_id, created, updated) = parse_frontmatter(&content);
        
        if file_id.as_deref() == Some(&id) {
            let body = strip_frontmatter(&content);
            let title = extract_title(&body);
            return Ok(Note {
                id,
                title,
                content: body,
                created_at: created.unwrap_or_default(),
                updated_at: updated.unwrap_or_default(),
            });
        }
    }
    
    Err(format!("找不到笔记: {}", id))
}

/// 删除笔记
#[tauri::command]
fn delete_note(id: String) -> Result<(), String> {
    let dir = notes_dir();
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let (file_id, _, _) = parse_frontmatter(&content);
        
        if file_id.as_deref() == Some(&id) {
            fs::remove_file(&path).map_err(|e| e.to_string())?;
            return Ok(());
        }
    }
    
    Err(format!("找不到笔记: {}", id))
}

/// 搜索笔记
#[tauri::command]
fn search_notes(query: String) -> Result<Vec<NoteSummary>, String> {
    if query.trim().is_empty() {
        return list_notes_internal();
    }
    
    let dir = notes_dir();
    let mut results: Vec<NoteSummary> = Vec::new();
    let query_lower = query.to_lowercase();
    
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        
        let filename = path.file_stem().and_then(|s| s.to_str()).unwrap_or("");
        if filename == "index" || filename == "log" {
            continue;
        }
        
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let content_lower = content.to_lowercase();
        
        if content_lower.contains(&query_lower) {
            let (id, created, updated) = parse_frontmatter(&content);
            let body = strip_frontmatter(&content);
            let title = extract_title(&body);
            let preview = make_preview(&body);
            
            results.push(NoteSummary {
                id: id.unwrap_or_else(|| filename.to_string()),
                title,
                created_at: created.unwrap_or_default(),
                updated_at: updated.unwrap_or_default(),
                preview,
            });
        }
    }
    
    results.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(results)
}

/// 获取所有笔记标题列表（用于自动链接）
#[tauri::command]
fn get_all_titles() -> Result<Vec<(String, String)>, String> {
    let dir = notes_dir();
    let mut titles: Vec<(String, String)> = Vec::new(); // (title, id)
    
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        
        let filename = path.file_stem().and_then(|s| s.to_str()).unwrap_or("");
        if filename == "index" || filename == "log" {
            continue;
        }
        
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let (id, _, _) = parse_frontmatter(&content);
        let body = strip_frontmatter(&content);
        let title = extract_title(&body);
        
        titles.push((title, id.unwrap_or_else(|| filename.to_string())));
    }
    
    Ok(titles)
}

// ── 辅助函数 ──

fn parse_frontmatter(content: &str) -> (Option<String>, Option<String>, Option<String>) {
    if !content.starts_with("---") {
        return (None, None, None);
    }
    
    let end = content[3..].find("---");
    if end.is_none() {
        return (None, None, None);
    }
    
    let fm = &content[3..end.unwrap() + 3];
    let id = extract_fm_field(fm, "id:");
    let created = extract_fm_field(fm, "created:");
    let updated = extract_fm_field(fm, "updated:");
    
    (id, created, updated)
}

fn extract_fm_field(fm: &str, field: &str) -> Option<String> {
    for line in fm.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with(field) {
            let value = trimmed[field.len()..].trim();
            return Some(value.to_string());
        }
    }
    None
}

fn strip_frontmatter(content: &str) -> String {
    if !content.starts_with("---") {
        return content.to_string();
    }
    
    if let Some(end) = content[3..].find("---") {
        let after = &content[end + 6..];
        after.trim_start_matches('\n').to_string()
    } else {
        content.to_string()
    }
}

// ── Tauri入口 ──

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_note,
            save_note,
            list_notes,
            read_note,
            delete_note,
            search_notes,
            get_all_titles,
            get_notes_dir,
            set_notes_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
