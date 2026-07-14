# Shuang 爽

**AI-Native Markdown Editor**

---

## 🇬🇧 English

Write naturally, AI formats for you. No markdown knowledge needed.

### Features

- **AI Ghost Text** — Copilot-style gray suggestions appear as you type. Press `Tab` to accept formatting.
- **WYSIWYG** — TipTap-powered rich text editing. What you see is what you get.
- **Live Preview** — Markdown markers (`#`, `-`, `>`) shown in gray when focused.
- **Wiki Links** — Automatic `[[note]]` detection on save. Click to navigate.
- **Three Modes** — Suggest (auto-format), Format All (full-doc), Off (manual).
- **Multi-level Folders** — Nestable folder tree in sidebar.
- **Source Toggle** — `Ctrl+/` to switch between WYSIWYG and raw markdown.
- **Bilingual UI** — Switch between English and 中文 in Settings.
- **Dark Mode** — Light/dark toggle.
- **Local-first** — Notes stored as plain `.md` files in `~/Notebook/`.
- **Full-text Search** — Real-time with keyword highlighting.
- **Auto-save** — Content saves 3 seconds after you stop typing.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Tauri 2 |
| Frontend | React 19 + TypeScript |
| Editor | TipTap 3 (ProseMirror) |
| Build | Vite 7 |
| Backend | Rust |
| Storage | Plain `.md` files |
| AI | DeepSeek / OpenAI / Ollama (BYO key) |

### Quick Start

```bash
cd app
npm install
npm run tauri dev   # Desktop app
npm run dev         # Browser only
npm run tauri build # Production DMG
```

### Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Accept AI suggestion |
| `Esc` | Dismiss suggestion |
| `Ctrl+/` | Toggle source view |
| `Cmd+1/2/3` | Heading 1/2/3 |
| `Cmd+0` | Paragraph |

---

## 🇨🇳 中文

零语法纯文本写作，AI 自动加格式、建链接、归类。

### 功能

- **AI 灰色建议** — 打字时显示 Copilot 风格建议，`Tab` 接受格式
- **所见即所得** — TipTap WYSIWYG 编辑器，无需切换源码/预览
- **内联预览** — 光标放在标题/列表上时，灰色显示 `#` `-` 标记
- **Wiki 链接** — 保存时自动识别 `[[笔记]]`，点击跳转
- **三种模式** — 续写（自动建议）、整理（全文格式化）、关闭（纯手动）
- **多级文件夹** — 侧边栏文件夹树，支持嵌套
- **源码切换** — `Ctrl+/` 一键切换到 markdown 源码编辑
- **中英文双语** — 设置里一键切换界面语言
- **暗色模式** — 亮色/暗色自由切换
- **本地优先** — 笔记存为标准 `.md` 文件，放在 `~/Notebook/`
- **全文搜索** — 实时搜索，关键词高亮
- **自动保存** — 停止打字 3 秒后自动保存

### 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Tauri 2 |
| 前端 | React 19 + TypeScript |
| 编辑器 | TipTap 3 (ProseMirror) |
| 构建 | Vite 7 |
| 后端 | Rust |
| 存储 | 标准 `.md` 文件 |
| AI | DeepSeek / OpenAI / Ollama（自带 Key） |

### 快速开始

```bash
cd app
npm install
npm run tauri dev   # 桌面应用
npm run dev         # 仅浏览器
npm run tauri build # 构建 DMG
```

### 快捷键

| 按键 | 功能 |
|------|------|
| `Tab` | 接受 AI 格式建议 |
| `Esc` | 取消建议 |
| `Ctrl+/` | 切换源码/预览 |
| `Cmd+1/2/3` | 标题 1/2/3 |
| `Cmd+0` | 段落 |

---

### Configuration / 配置

1. Click ⚙️ → **LLM Config** → enter API Key
2. Switch mode in the status bar: `[Suggest] [Format] [Off]`
3. Toggle language in ⚙️ → Editor → Language

---

### License / 许可证

MIT
