# OpenClaw 交警宣传文案生成系统

面向交警宣传部门的 AI 文案生成工具 Web 端。系统帮助宣传员快速生成适配微博、微信公众号、抖音/快手、头条号等多平台的交通安全宣传文案，并提供素材库管理、内容审核流程和系统管理功能。

**当前状态**：UI 原型已完成，所有页面可交互，数据为前端 mock，尚未接入后端 API。

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 构建工具 | Vite | 6.x |
| UI 框架 | React | 18.3 |
| 语言 | TypeScript | 5.6 |
| 路由 | React Router DOM | 7.x |
| 样式 | Tailwind CSS | 4.0 |
| 组件库 | shadcn/ui (Badge, Button, Card, Dialog, Tabs, Table, Progress) | — |
| UI 原语 | Radix UI (dialog, tabs, progress, slot) | — |
| 图标 | Lucide React | 0.468 |
| 样式工具 | clsx + tailwind-merge + class-variance-authority | — |

## 项目结构

```
frontend/
├── index.html                    # 入口 HTML
├── package.json                  # 依赖与脚本
├── vite.config.ts                # Vite + Tailwind + 路径别名配置
├── tsconfig.json                 # TypeScript 配置入口
├── tsconfig.app.json             # 应用 TS 配置 (strict, @/* 路径别名)
├── tsconfig.node.json            # Vite 配置 TS
├── public/vite.svg
└── src/
    ├── main.tsx                  # 应用入口
    ├── App.tsx                   # RouterProvider 根组件
    ├── routes.tsx                # 路由配置 (createBrowserRouter)
    ├── vite-env.d.ts
    ├── styles/
    │   └── globals.css           # Tailwind v4 + 政务蓝色主题变量
    ├── lib/
    │   └── utils.ts              # cn() 样式合并工具
    ├── components/
    │   ├── DashboardLayout.tsx   # 主布局 (Header + Sidebar + Outlet)
    │   └── ui/                   # shadcn/ui 组件 (7个)
    ├── pages/                    # 7 个页面组件
    │   ├── LoginPage.tsx         # 登录页
    │   ├── HomePage.tsx          # 工作台仪表盘
    │   ├── GeneratePage.tsx      # AI 文案生成 (核心页面)
    │   ├── MaterialsPage.tsx     # 素材库管理
    │   ├── ContentManagementPage.tsx  # 文案管理
    │   ├── SystemManagementPage.tsx   # 系统管理
    │   └── NotFoundPage.tsx      # 404 页面
    └── data/
        └── mock.ts               # 集中 mock 数据 + TypeScript 类型定义
```

## 路由结构

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | LoginPage | 登录页 (无需认证) |
| `/` | HomePage | 工作台仪表盘 (需登录) |
| `/generate` | GeneratePage | AI 文案生成 |
| `/materials` | MaterialsPage | 素材库管理 |
| `/content` | ContentManagementPage | 文案管理 |
| `/system` | SystemManagementPage | 系统管理 |
| `*` | NotFoundPage | 404 兜底 |

所有 `/` 下的子路由由 `DashboardLayout` 包裹，Layout 会检查 localStorage 中的用户信息，未登录自动跳转 `/login`。

## 各页面功能说明

| 页面 | 已实现功能 | Mock 数据 |
|------|-----------|-----------|
| **LoginPage** | 用户名/密码表单，mock 登录写入 localStorage | — |
| **HomePage** | 4 个统计卡片、最近文案列表、待办事项、本周平台数据 | 3 条最近文案, 2 条待办 |
| **GeneratePage** | 主题输入、风格选择 (4种)、平台多选 (4个)、mock 生成 (2秒延迟)、敏感词检测状态、字数统计、操作按钮 | 固定生成模板 |
| **MaterialsPage** | 案例库/话术库/法规库三 Tab 切换、搜索框、编辑/删除/引用操作 | 各 3 条 |
| **ContentManagementPage** | 6 状态筛选 Tab、搜索、内容列表含状态 Badge、分页、操作按钮 | 5 条内容 |
| **SystemManagementPage** | 用户管理表格、角色权限矩阵、敏感词库表格、配额管理 (进度条) | 4 用户, 3 敏感词, 4 配额 |
| **NotFoundPage** | 404 提示 + 返回首页链接 | — |

## 设计主题

- **主色**：政务蓝 `#1e40af`
- **辅色**：警示红 `#dc2626`
- **背景**：浅灰 `#f8fafc`
- **字体**：系统字体栈 + PingFang SC / Microsoft YaHei (中文优化)
- **渐变**：`.gov-gradient` (蓝色渐变用于登录背景和欢迎横幅)

---

## 使用指南

### 环境要求

- Node.js >= 18 (推荐 20+)
- npm >= 8

### 快速开始

```bash
# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:5173

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 使用流程

1. 打开 `http://localhost:5173`，进入登录页
2. 输入任意用户名和密码，点击"登录系统"
3. 进入工作台仪表盘，可通过左侧导航切换页面
4. **文案生成**：输入主题关键词 → 选择风格和平台 → 点击"生成文案" → 查看结果
5. **素材库**：浏览案例库、话术库、法规库
6. **文案管理**：按状态筛选历史文案
7. **系统管理**：查看用户、权限、敏感词和配额信息
8. 点击右上角"退出"注销

### 开发说明

- **路径别名**：`@/` 映射到 `src/`，所有导入使用 `@/components/...` 形式
- **样式**：使用 Tailwind CSS v4 内联类名，主题变量定义在 `globals.css` 的 `@theme` 块中
- **组件**：shadcn/ui 组件位于 `src/components/ui/`，支持 `className` 覆盖和 CVA 变体
- **Mock 数据**：集中在 `src/data/mock.ts`，所有类型定义也在此文件

---

## 下一步建议

### 优先级 P0 — 核心功能闭环

#### API 服务层搭建

**文件**：新建 `src/services/api.ts`, `src/services/auth.ts`, `src/services/generate.ts` 等

- 封装 HTTP 客户端 (axios 或 fetch wrapper)，统一 baseURL、请求拦截 (JWT token 注入)、响应拦截 (错误处理、401 跳转)
- 替换 `mock.ts` 中的静态数据为 API 调用
- 定义与后端对齐的 Request/Response TypeScript 类型

#### 真实认证系统

**文件**：`src/pages/LoginPage.tsx`, `src/components/DashboardLayout.tsx`, 新建 `src/contexts/AuthContext.tsx`

- 当前登录仅将 `{ username, role: "editor" }` 存入 localStorage
- 需要：JWT token 认证 → token 存储 → 请求自动附带 → 过期刷新/跳转
- 使用 React Context 管理全局认证状态，替换当前零散的 localStorage 读写
- 根据用户角色 (admin/reviewer/editor) 动态控制侧边栏菜单和页面权限

#### 文案生成页接入 AI 后端

**文件**：`src/pages/GeneratePage.tsx`

- 当前 `handleGenerate` 使用 `setTimeout` + 固定文本模拟
- 接入真实 API 后需要：streaming 响应支持 (SSE/WebSocket)、生成过程实时展示、错误重试、超时处理
- "复制文案"、"保存草稿"、"提交审核" 按钮接入对应 API

### 优先级 P1 — 基础工程化

#### 状态管理

- 当前各页面状态完全本地 (useState)，无跨页面共享
- 推荐引入轻量方案：Zustand 或 React Context + useReducer
- 关键全局状态：用户信息、通知、API 配额

#### 表单交互完善

- 搜索框接入过滤逻辑 (MaterialsPage, ContentManagementPage)
- "新建素材"、"添加用户"、"添加敏感词" 等按钮接入 Dialog 表单
- 表单校验 (推荐 react-hook-form + zod)
- 删除操作增加确认 Dialog

#### 错误处理与加载状态

- 添加 React Error Boundary 组件
- API 请求的 loading / error / empty 三态 UI
- 网络错误 toast 提示 (推荐添加 sonner 或 shadcn/ui toast)

#### 测试框架

- 配置 Vitest + React Testing Library
- 优先为核心流程编写测试：登录流程、文案生成流程、路由守卫

### 优先级 P2 — 体验优化

#### 响应式适配

- 当前布局桌面端优先，移动端侧边栏需要折叠/抽屉化
- DashboardLayout 添加移动端菜单 toggle

#### PRD 中 Phase 2 功能

根据 PRD 规划：

- **多级审批流程**：ContentManagementPage 增加审批操作 (通过/退回/转审)
- **数据统计面板**：HomePage 增加图表 (推荐 recharts)
- **配额管理增强**：SystemManagementPage 配额 tab 增加调整 Dialog

#### 工程规范

- 添加 ESLint + Prettier 配置 (当前 lint 脚本存在但无配置文件)
- 添加 `.env` / `.env.example` 管理环境变量 (API 地址等)
- 添加 husky + lint-staged 保证提交质量
