# Shuang 爽

> **AI-Native Markdown Editor** — Write naturally, AI formats for you.
>
> **AI 原生 Markdown 编辑器** — 零语法纯文本写作，AI 自动加格式、建链接、归类。

---

## Screenshot / 截图

<!-- TODO: Add screenshot -->

---

## Features / 功能

- **Zero-syntax writing** — Just type, no markdown knowledge needed. AI adds formatting automatically.
- **AI Ghost Text** — Copilot-style gray suggestions appear as you type. Press Tab to accept formatting.
- **WYSIWYG** — TipTap-powered rich text editing, what you see is what you get.
- **Live Preview** — Markdown markers (`#`, `-`, `>`) shown in gray when focused (Typora-style).
- **Wiki Links** — Automatic `[[note]]` link detection on save. Clickable cross-note navigation.
- **Three Writing Modes** — Suggest (auto-format), Format All (full-doc cleanup), Off (plain manual).
- **Multi-level Folders** — Organize notes with nested folders.
- **Source Toggle** — Press `Ctrl+/` to switch between WYSIWYG and raw markdown editing.
- **Bilingual UI** — Switch between 中文 and English via Settings.
- **Dark Mode** — 🌙 Light/dark toggle.
- **Local-first** — All notes stored as plain `.md` files with YAML frontmatter in `~/Notebook/`.
- **Configurable Storage** — Choose any directory for your notes (native folder picker).
- **Full-text Search** — Real-time search with keyword highlighting.
- **Auto-save** — Content auto-saves 3 seconds after you stop typing.
- **Tauri Desktop** — Lightweight native macOS app (Tauri 2 + React 19).

**零语法写作** — 打开就写，不需要懂任何 markdown 语法，AI 自动格式化。
**AI 灰色建议** — Copilot 风格建议，Tab 接受格式，继续打字忽略。
**所见即所得** — TipTap WYSIWYG 编辑器，无需源码/预览切换。
**内联预览** — 光标放在标题上时显示灰色 `#` 标记（Typora 风格）。
**Wiki 链接** — 保存时自动识别 `[[笔记]]` 链接，点击可跳转。
**三种写作模式** — 续写（自动建议）、整理（全文格式化）、关闭（纯手动）。
**多级文件夹** — 侧边栏文件夹树，支持嵌套子文件夹。
**源码切换** — `Ctrl+/` 一键切换到 markdown 源码编辑。
**中英文双语** — 设置里一键切换界面语言。
**暗色模式** — 🌙 亮色/暗色切换。
**本地优先** — 所有笔记存为标准 `.md` 文件（YAML frontmatter），存在 `~/Notebook/`。
**可配置目录** — 原生目录选择器，笔记存在任何你想放的位置。
**全文搜索** — 实时搜索，关键词高亮显示。
**自动保存** — 打字停止 3 秒后自动保存。
**Tauri 桌面应用** — 轻量原生 macOS 应用（Tauri 2 + React 19）。

---

## Tech Stack / 技术栈

| Layer | Technology |
|-------|-----------|
| Desktop Framework | **Tauri 2** |
| Frontend | React 19 + TypeScript |
| Editor | TipTap 3 (ProseMirror) |
| Styling | Tailwind CSS 4 |
| Build | Vite 7 |
| Backend | Rust (Tauri commands) |
| Storage | Local `.md` files |
| AI | DeepSeek / OpenAI / Ollama (BYO key) |

---

## Quick Start / 快速开始

```bash
# Prerequisites / 前置条件
# Rust toolchain: https://rustup.rs
# Node.js 20+

cd app
npm install

# Development / 开发
npm run tauri dev     # Desktop app with HMR
npm run dev           # Browser only (no Tauri backend)

# Build / 构建
npm run tauri build   # Production build + DMG

# Type check / 类型检查
npm run build
```

---

## Configuration / 配置

1. Click ⚙️ in the title bar → **LLM Config** tab
2. Enter your API Key (DeepSeek / OpenAI / Ollama)
3. Switch writing mode in the status bar: `[Suggest] [Format] [Off]`

---

## Keyboard Shortcuts / 快捷键

| Shortcut | Action |
|----------|--------|
| `Tab` | Accept AI format suggestion |
| `Esc` | Dismiss AI suggestion |
| `Ctrl+/` | Toggle source / WYSIWYG mode |
| `Cmd+1` | Heading 1 |
| `Cmd+2` | Heading 2 |
| `Cmd+3` | Heading 3 |
| `Cmd+0` | Paragraph |
| `Shift+Tab` | Decrease heading level |
| `Tab` | Increase heading level |

---

## Keywords / 搜索关键词

> Shuang, 爽, AI markdown editor, AI Markdown 编辑器, AI-native writing, AI 原生写作, WYSIWYG markdown, 所见即所得, Typora alternative, Typora 替代, Copilot for writing, 写作助手, AI formatting, 智能格式化, markdown knowledge base, 知识库, local note-taking, 本地笔记, Tauri app, Tauri 桌面应用, open source markdown editor, 开源 Markdown 编辑器, DeepSeek writing, AI note-taking, 笔记软件, macOS markdown editor, 写作软件, auto-format markdown, 自动格式化, ghost text, 灰色建议, live preview markdown, 内联预览, bilingual editor, 双语编辑器

---

## Roadmap / 路线

- [x] MVP UI
- [x] AI ghost text formatting
- [x] Wiki-links and cross-note navigation
- [ ] Typora-style inline live preview (editable markers)
- [ ] Code blocks with syntax highlighting
- [ ] Export to PDF / HTML
- [ ] Backlinks panel
- [ ] Graph view

---

## License / 许可证

MIT

---

*Made with ❤️ and AI*
