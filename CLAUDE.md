# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

AI-Native Markdown Editor — 零语法纯文本写作，AI 自动加格式、建链接、归类。让不懂 markdown 的普通人也能拥有知识库。

- **桌面框架**: Tauri 2 + React 19 + TypeScript
- **编辑器内核**: TipTap (ProseMirror WYSIWYG)
- **样式**: Tailwind CSS 4
- **构建工具**: Vite 7
- **后端**: Rust (Tauri commands)
- **存储**: 本地 `.md` 文件 + YAML frontmatter，存储于 `~/Notebook/`

## 常用命令

```bash
# 进入应用目录
cd app

# 启动开发环境（Tauri 桌面窗口 + Vite HMR）
npm run tauri dev

# 纯前端开发（浏览器中预览，无需 Tauri）
npm run dev

# 构建生产版本
npm run tauri build

# 类型检查
npm run build    # 运行 tsc 类型检查

# 安装依赖
npm install
```

## 项目结构

```
ai-md-editor/
├── app/                          # 主应用目录
│   ├── src/                      # React 前端源码
│   │   ├── main.tsx              # 入口文件
│   │   ├── App.tsx               # 主应用组件（状态管理+页面布局）
│   │   ├── App.css               # 全局样式 + Tailwind + TipTap 样式
│   │   ├── Editor.tsx            # TipTap 编辑器组件
│   │   ├── Settings.tsx          # 设置弹窗（LLM 配置）
│   │   ├── ai.ts                 # AI 调用层（DeepSeek/OpenAI/Ollama）
│   │   └── api.ts                # Tauri 命令封装
│   ├── src-tauri/                # Rust 后端
│   │   ├── src/lib.rs            # 所有 Tauri 命令实现（笔记 CRUD + 搜索）
│   │   ├── src/main.rs           # Tauri 入口
│   │   ├── Cargo.toml            # Rust 依赖
│   │   └── tauri.conf.json       # Tauri 配置
│   ├── package.json
│   └── vite.config.ts
└── docs/                         # 产品文档
    ├── full-product-plan.md      # 完整产品蓝图
    ├── mvp-plan.md               # MVP 方案
    └── FINAL-PLAN.md             # 最终计划
```

## 架构要点

### 前端状态流
- **App.tsx** 是单一状态中心，管理：笔记列表、当前笔记、搜索、AI 状态
- 所有状态通过 `useState` + `useCallback` 管理，无外部状态库
- AI 配置存储于 `localStorage`（`llm_config` key）

### Rust 后端 Commands（在 `lib.rs` 中）
| Command | 功能 | 备注 |
|---------|------|------|
| `create_note` | 创建笔记 | 自动生成 ID（时间戳） |
| `save_note` | 保存为 `.md` 文件 | 添加 YAML frontmatter |
| `list_notes` | 列出所有笔记 | 按更新时间倒序 |
| `read_note` | 读取笔记内容 | 按 ID 匹配 |
| `delete_note` | 删除笔记 | |
| `search_notes` | 全文搜索 | 大小写不敏感，非 FTS |
| `get_all_titles` | 获取所有笔记标题 | 用于前端自动链接 |

### 笔记文件格式
```
---
id: 20260712063000
created: 2026-07-12 06:30:00
updated: 2026-07-12 06:35:00
---

# 笔记标题

正文内容...
```

### AI 三层结构化流水线
1. **实时**（打字时）：句号后分段、列表编号、关键词加粗（当前通过 `Editor.tsx` 的 `debounce 2秒` + 回车触发触发 `formatTextStream` API 流式调用）
2. **段落级**（保存时）：实体识别自动加 `[[]]` 链接（`autoLink`）
3. **文档级**（保存时）：自动生成标题（`generateTitle`）

### AI 配置（`ai.ts`）
- 支持 provider: `deepseek` | `openai` | `ollama`
- 默认: DeepSeek (`deepseek-chat`)
- API 兼容 OpenAI 的 `/v1/chat/completions` 接口
- 流式输出通过 `fetch` + `ReadableStream` 解析 SSE

## 开发注意事项

- `npm run tauri dev` 启动后，Vite 运行在端口 1420，WebSocket HMR 在 1421
- `src-tauri/` 目录被 Vite 的 `watch.ignored` 排除，修改 Rust 代码需要重建
- 搜索目前是 Rust 端的简单字符串匹配（`content_lower.contains(&query_lower)`），不是 FTS
- 笔记通过文件名（标题）保存，自动过滤特殊字符，标题相同会覆盖
