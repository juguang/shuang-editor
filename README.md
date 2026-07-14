<p align="center">
  <img src="app/public/icon-square.svg" width="80" alt="Shuang logo" style="border-radius:16px">
</p>
<h1 align="center">Shuang 爽</h1>
<p align="center">
  <b>AI-Native Markdown Editor</b>
  <br>
  <sub>Write naturally, AI formats for you · 零语法写作，AI 自动加格式</sub>
</p>
<p align="center">
  <a href="#-english">🇬🇧 English</a> ·
  <a href="#-中文">🇨🇳 中文</a>
</p>

---

## 🇬🇧 English

Write naturally, AI formats for you. No markdown knowledge needed.

### Features

- **AI Ghost Text** — Copilot-style gray suggestions appear as you type. Press `Tab` to accept formatting.
- **WYSIWYG** — TipTap-powered rich text editing. What you see is what you get.
- **Live Preview** — Markdown markers (`#`, `-`, `>`) shown in gray when focused (Typora-style).
- **Wiki Links** — Automatic `[[note]]` detection on save. Clickable cross-note navigation.
- **Three Modes** — Suggest (auto-format), Format All (full-doc cleanup), Off (manual).
- **Multi-level Folders** — Nestable folder tree in sidebar.
- **Source Toggle** — `Ctrl+/` to switch between WYSIWYG and raw markdown.
- **Bilingual UI** — Switch between English and 中文 in Settings.
- **Dark Mode** — Light/dark toggle.
- **Local-first** — Notes stored as plain `.md` files with YAML frontmatter in `~/Notebook/`.
- **Configurable Storage** — Choose any directory (native folder picker).
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
npm run tauri dev   # Desktop app with HMR
npm run dev         # Browser only (no Tauri backend)
npm run tauri build # Production DMG
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Accept AI format suggestion |
| `Esc` | Dismiss suggestion |
| `Ctrl+/` | Toggle source view |
| `Cmd+1/2/3` | Heading 1/2/3 |
| `Cmd+0` | Paragraph |
| `Shift+Tab` | Decrease heading level |
| `Tab` (on heading) | Increase heading level |

---

## 🇨🇳 中文

零语法纯文本写作，AI 自动加格式、建链接、归类。你只管写，剩下的 AI 来。

### 功能

- **AI 灰色建议** — 打字时像 Copilot 一样显示灰色格式化建议，`Tab` 接受，继续打字忽略
- **所见即所得** — 基于 TipTap 的 WYSIWYG 编辑器，无需在源码和预览间切换
- **内联预览** — 光标放在标题/列表上时，灰色显示 `#` / `-` 标记（Typora 风格）
- **Wiki 链接** — 保存时自动识别 `[[笔记]]` 并生成可点击的链接，点击跳转
- **三种写作模式** — 续写（自动建议）、整理（全文格式化）、关闭（纯手动）
- **多级文件夹** — 侧边栏文件夹树，支持嵌套子文件夹
- **源码切换** — `Ctrl+/` 一键切换到 markdown 源码编辑，直接修改格式标记
- **中英文双语** — 设置里一键切换界面语言
- **暗色模式** — 亮色/暗色自由切换
- **本地优先** — 笔记存为标准 `.md` 文件（YAML frontmatter），存在 `~/Notebook/`
- **可配置目录** — 原生目录选择器，笔记可以放在任何位置
- **全文搜索** — 实时搜索，关键词高亮显示
- **自动保存** — 停止打字 3 秒后自动保存，不丢内容

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
npm run tauri dev   # 桌面应用（热更新）
npm run dev         # 仅浏览器（无后端）
npm run tauri build # 构建 DMG 安装包
```

### 快捷键

| 按键 | 功能 |
|------|------|
| `Tab` | 接受 AI 格式建议 |
| `Esc` | 取消建议 |
| `Ctrl+/` | 切换源码/预览模式 |
| `Cmd+1/2/3` | 设为标题 1/2/3 |
| `Cmd+0` | 转回段落 |
| `Shift+Tab` | 降低标题级别 |

---

### Configuration / 配置

1. Click ⚙️ in the title bar → **LLM Config** tab
2. Enter your API Key (DeepSeek / OpenAI / Ollama)
3. Switch writing mode in the status bar: `[Suggest] [Format] [Off]`
4. Toggle language in ⚙️ → Editor → **Language**

### Download / 下载

[Download latest DMG](https://github.com/juguang/shuang-editor/releases/latest) (macOS, Apple Silicon)

---

### License / 许可证

MIT

<p align="center">
  <sub>Made with ❤️ and AI</sub>
</p>
