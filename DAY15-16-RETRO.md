# Day 15 / Day 16 补救说明（Retro）

> 生成日期：2026-10-20
> 关联：飞书《28天VibeCoding学习打卡计划》Day 15 / Day 16
> 补录前 HEAD：`c49fae6`（Day 17｜第一条读取接口：GET）

## 为什么需要这份说明

按飞书文档，Day 15 是「后端 / CloudBase 部署日」，Day 16 是「数据模型日（建表 + 种子 + select 验证）」。
但本仓库对应的两个 commit 实际做的都是**前端工作**，与文档规定的后端/数据库任务不符：

| 日 | commit | 原标题 | 实际改动 |
|---|---|---|---|
| Day 15 | `2045faa` | 网站公网验收 | `SKILL.md`、`css/style.css`、`index.html`、`js/data.js`（favicon、触控 44px、配图） |
| Day 16 | `eb63f18` | 首页信息架构微调 | `README.md`、`assets/panels/*`、`css/style.css`、`js/data.js`、`js/render.js`（首页改版、站长推荐位、双向系列配图） |

文档要求的后端/数据库任务（`/api/health`、`api-contract.md`、建表、种子、select 验证），实际全部在 **Day 17 的 commit `c49fae6`** 一次性完成。

## 真实时间线

- **Day 15（实际做的是前端）**：站点公网验收（GitHub Pages 可访问、favicon、触控 44px、配图）。
- **Day 16（实际做的是前端）**：首页信息架构调整、站长推荐位、双向系列配图扩展。
- **Day 17（后端集中补齐）**：引入 `api-contract.md`、`scripts/001_schema.sql`、`seed-songs.sql`、`sync-db.cjs`、`gen-seed.mjs`；建 Supabase 真库 `songs`（37 首）+ `favorites`；实现 `get_songs()` / `get_favorites(uid)` RPC，并在前端 `js/store.js` 接入。

## 方案变更（Day 17 已确认）

课程默认 CloudBase，本项目改为 **Supabase（PostgreSQL）** 作为等价平台：无需腾讯云账号、免费层够用、PostgREST 自动把 SQL 函数暴露为公网 HTTP 接口。

因此对应关系为：

| 课程原方案 | 本项目等价实现 |
|---|---|
| `/api/health` 云函数 | Supabase 公网 RPC 端点（实际由 `get_songs` 承担健康检查/读能力） |
| CloudBase 控制台 | Supabase 控制台 / 真库 |
| 课程示例表（trends/plan_days 等） | `songs`（核心表，37 行）+ `favorites`（记录表，Day 18 写入） |

## 本次补救补充的交付物

1. **`screenshots/supabase-songs-data.png`**：Supabase `songs` 表数据页预览（表名、列头、12 行真实数据），满足 Day 16「每张核心表 ≥5 行」的交付要求。
2. **`supabase-songs-query.txt`**：直连真库 `SELECT` 的原始结果（总数 37 行 + 12 行样本），作为「真库确有数据」的铁证。
3. **本文件**：把 Day 15/16 实际内容与「后端归并到 Day 17」的事实写清楚，避免后续误读。

## 原文完成标准 · 逐项对照

### Day 15

| 完成标准 | 现状 | 说明 |
|---|---|---|
| `/api/health` 公网可访问返回 JSON | ✅ 等价满足 | Supabase RPC `get_songs` 公网可访问、返回 `{ok,data}` JSON（见 `api-contract.md`） |
| 前端公网页面同伴手机能打开 | ✅ | GitHub Pages 线上站 |
| `api-contract.md` 已入库 | ✅（Day 17 补） | `c49fae6` 新增 |

### Day 16

| 完成标准 | 现状 | 说明 |
|---|---|---|
| 每张核心表 select ≥5 行 | ✅ | `songs` 37 行；见截图与查询证据 |
| `seed.sql` 重复执行不报错 | ✅ | `seed-songs.sql` 使用 `ON CONFLICT (id) DO NOTHING`；`sync-db.cjs` 可重复执行 |
| `db/schema.sql`、`seed.sql` 已入库 | ✅（路径为 `scripts/`） | `scripts/001_schema.sql`、`scripts/seed-songs.sql` |

## 备注

- 本补救**不修改任何已推送的 commit 历史**（避免改写远程历史的风险），仅以新增文件方式补录事实。
- `favorites` 当前 0 行符合计划：Day 16/17 只做读，写接口留到 Day 18。
- 下一步（Day 18）：收藏从 `localStorage` 改为写 `favorites` 表（POST/INSERT），`get_favorites` 读接口已就绪。
