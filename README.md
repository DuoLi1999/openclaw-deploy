# OpenClaw — 交警宣传文案生成系统

基于 Dify 平台 + DeepSeek 大模型的交通安全宣传内容智能生产系统。输入主题关键词，自动生成多平台适配的宣传文案，内置敏感词审核与格式校验。

## 项目结构

```
├── frontend/              # React 前端（Vite + TypeScript + Tailwind CSS v4）
│   └── src/
│       ├── pages/         # 页面：登录、首页、AI生成、素材库、内容管理、系统管理
│       └── services/      # API 层：Dify workflow SSE 流式调用
├── dify-workflows/        # Dify DSL 工作流定义（4 个 YAML）
├── dify/                  # Dify 平台源码（用于自部署）
├── style_reference/       # UI 风格参考
└── *.md                   # PRD 与方案文档
```

## 核心功能

- **AI 文案生成** — 输入主题 + 风格 + 目标平台，一键生成宣传文案
- **多平台适配** — 微博（140 字）、微信公众号、抖音、头条，各有字数和格式约束
- **13 节点 Workflow** — 选题分析 → 初稿生成 → 反 AI 优化 → 格式校验 → 敏感词审核 → 条件修订 → 输出
- **SSE 流式进度** — 实时展示 workflow 各节点执行状态，无需等待全部完成
- **敏感词审核** — 自动检测政治敏感、不当表述，审核不通过自动触发修订

## Dify Workflows

| 文件 | 用途 |
|------|------|
| `traffic-safety-copywriter.yml` | 主管线：端到端文案生成（13 节点） |
| `sensitive-word-checker.yml` | 独立敏感词检测工具 |
| `regulation-lookup.yml` | 法规条文检索（需配置知识库） |
| `content-strategy-planner.yml` | 内容策略与排期规划 |

## 快速开始

### 前置条件

- Node.js >= 18
- 已部署的 Dify 实例（v1.12+），并导入 `dify-workflows/` 中的 YAML
- Dify 中创建应用并获取 API Key

### 启动前端

```bash
cd frontend
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入：
#   DIFY_BASE_URL=http://your-dify-host
#   DIFY_API_KEY=app-xxxxx

npm run dev
```

浏览器打开 `http://localhost:5173`，进入「AI 文案生成」页面即可使用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| UI 组件 | Radix UI + Lucide Icons |
| AI 编排 | Dify Workflow（DSL v0.3.1） |
| 大模型 | DeepSeek Chat |
| 前后端通信 | Vite dev proxy → Dify REST API（SSE streaming） |

## License

MIT
