# OpenClaw 交警宣传文案生成系统 — 项目记忆

## 项目概览
交警宣传文案生成系统，使用 Dify 平台 + DeepSeek API 构建端到端内容生产管线。前端 React 18 + TypeScript + Tailwind CSS，目前 UI 原型已完成，数据为前端 mock。

## Dify Workflow 架构（已实现）

### 主管线: `traffic-safety-copywriter.yml`（13 节点）
```
Start → LLM-1(选题分析) → LLM-2(初稿生成) → LLM-3(反AI优化)
→ Code(格式校验) → LLM-4(敏感词审核) → Code(审核判定)
→ IF/ELSE → Pass: Template(格式化) / Fail: LLM-5(修订) → Template(修订后格式化)
→ Variable Aggregator → End
```

输入变量: topic, description, style(formal/friendly/humorous/warning), platform(weibo/wechat_mp/douyin/kuaishou/toutiao), reference
输出变量: result, audit_status(passed/needs_revision), audit_report

### 独立工具 Workflow（3 个）
1. `sensitive-word-checker.yml` (4节点) — Start→LLM(temp 0.05)→Code(JSON解析,is_passed)→End
2. `regulation-lookup.yml` (5节点) — Start→KR(空dataset_ids待配置)→LLM(context引用KR)→Code(citation_texts提取)→End
3. `content-strategy-planner.yml` (5节点) — Start→LLM-1(策略规划)→Code(JSON提取)→LLM-2(发布排期)→End

### 知识库（需手动创建）
- `traffic-regulations` — 法规条文
- `traffic-cases` — 交通事故案例
- `traffic-phrases` — 常用话术模板

## 已完成的迭代修复

### 第一轮修复（5项）
1. **code_audit 合并格式+内容审核** — is_format_ok AND 敏感词审核都通过才算 passed
2. **LLM-5 修订加平台字数约束** — 包含各平台字数限制，字数合规为最高优先级
3. **LLM-3 反AI优化加字数纪律** — 不能显著增加字数，保留时间轴格式
4. **LLM-4 敏感词审核划清边界** — 不报格式问题，从 user prompt 移除格式校验结果
5. **template_revised 补 char_count** — 修订后模板也显示字数

### 第二轮修复（2项）
6. **code_format 短视频口播计数** — douyin/kuaishou 剥离分镜描述(画面/镜头)后再计字数，只统计口播文字
7. **LLM-5 修订更强硬** — 微博超标时完全重写(目标100-130字)，字数合规高于最小改动

## 测试结果（第二轮修复后待验证）

| 案例 | 平台 | 风格 | 主题 | 第一轮状态 | 已知问题 |
|------|------|------|------|-----------|---------|
| 1 | weibo | warning | 酒驾处罚新规 | needs_revision, 修订后213字超标 | LLM-5 已加强重写指令 |
| 2 | douyin | friendly | 开学季校园交通安全 | needs_revision, 584字含分镜 | 已修复口播计数，实际口播170字应pass |
| 3 | wechat_mp | formal | 高速疲劳驾驶 | passed, 1047字合规 | ✅ 无问题 |

## 技术细节
- Dify DSL version: 0.3.1
- 模型: deepseek-chat (provider: deepseek)
- Temperature 分级: 选题0.7, 初稿0.8, 反AI 0.5, 敏感词0.05, 修订0.5
- IF/ELSE: cases[case_id='true'], sourceHandle 'true'/'false'
- Variable Aggregator: 合并两个分支的 template output
- 多平台并行: 前端发 N 次 API 调用，每次传不同 platform 参数
