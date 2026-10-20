# 世末歌者 · 接口契约（api-contract.md）

> 本文件登记世末歌者站点的后端接口契约。每实现一个接口，在其条目下标记「✅ 已实现」。
> 课程对应：28 天 Vibe Coding 打卡 Day 17（第一条读取接口：GET）。
> 后端选型：**Supabase（PostgreSQL）**，作为课程规定的 CloudBase 的**等价云数据库 / 等价平台**（课程验收表明确允许「PostgreSQL 或等效云数据库」「CloudBase 或等效平台」）。
> 读接口实现方式：**PostgREST RPC**（数据库函数经 Supabase 自动暴露为 HTTP 接口，即本课程「云函数」的等价物），统一返回 `{ok,data,error}`。
> 项目 ref：`wtqzywartwuyzeiiqlyb` ｜ 区域：`ap-south-1`（Mumbai）

---

## 0. 统一响应形状（所有接口强制遵守）

成功：
```json
{ "ok": true, "data": [ ... ] }
```
失败：
```json
{ "ok": false, "error": "人能看懂的中文说明" }
```
- 任何未捕获异常 / SQL 错误，一律转成 `{ ok: false, error: "..." }`，**禁止白屏或裸英文堆栈**。
- `data` 在 GET 列表接口里统一为数组；单条读取可为对象，但本契约的接口均为数组。

---

## 1. 数据表

### 1.1 `songs`（核心表）

歌曲目录，由现有 `js/data.js` 的 `SONGS` 全量迁入真实库。

| 列 | 类型 | 约束 | 来源字段 | 说明 |
|---|---|---|---|---|
| `id` | text | PRIMARY KEY | `id` | 歌曲唯一标识（如 `shimo-song`） |
| `title` | text | NOT NULL | `title` | 曲名 |
| `singer` | text | | `singer` | 演唱（洛天依 / 乐正绫 / 言和 …） |
| `author` | text | | `author` | 作曲 / 作者 |
| `date` | text | | `date` | 投稿日期 `YYYY-MM-DD`（原始为字符串，保留） |
| `bilibili` | text | | `bilibili` | B站链接（可空） |
| `no_bilibili` | text | | `noBilibili` | 无 B站页的说明（可空） |
| `badges` | jsonb | | `badges` | 标签数组，如 `["神话曲","最慢中V神话曲"]` |
| `intro` | text | | `intro` | 简介 |
| `series_id` | text | | `seriesId` | 所属系列（外键语义，对应 `SERIES[].id`） |
| `heat` | jsonb | | `heat` | `{ plays, asOf, note, milestone }`（可空） |
| `panels` | jsonb | | `panels` | `[{ image?, caption }]` 分镜 |
| `milestones` | jsonb | | `milestones` | `[{ label, date }]` 播放里程碑 |
| `my_story` | text | | `myStory` | 站长私人感想（占位，不入库 AI 内容亦可） |
| `updated_at` | timestamptz | DEFAULT now() | — | 用于「改库验证」时确认行已变 |

种子数据：从 `js/data.js` 的 37 首全量导入（导入脚本见 `scripts/seed-songs.sql`）。
唯一约束 / 索引：`id` 主键即可；可按 `series_id`、`date` 建索引（读接口按 date 排序）。

### 1.2 `favorites`（记录表）

用户收藏（按客户端 `uid` 区分，无需登录；`uid` 由前端 `localStorage` 生成）。写入留到 Day 18，Day 17 仅做**读取**接口。

| 列 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `uid` | text | NOT NULL | 用户标识（前端生成） |
| `song_id` | text | NOT NULL | 收藏的歌曲 `id`（FK → `songs.id`） |
| `note` | text | 可空（Day 22 新增） | 收藏备注，仅 PATCH 接口可写，上限 200 字 |
| `created_at` | timestamptz | DEFAULT now() | 收藏时间 |

唯一约束：`UNIQUE (uid, song_id)`（重复收藏不产生重复行）。

---

## 2. 接口契约

### 2.1 `GET /api/songs` ✅ 已实现

- 公网地址（浏览器地址栏可直接打开，看到 JSON）：
  ```
  https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/rpc/get_songs?apikey=sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO
  ```
- 服务端实际实现：PostgreSQL 函数 `public.get_songs()`（契约里的 `/api/songs` 由该 RPC 承担）
- 方法：GET（亦支持 POST；GET 便于地址栏/验收直接查看）
- 作用：从 `songs` 表读取**全部歌曲真实数据**，按 `date` 升序返回。
- 成功响应：
  ```json
  {
    "ok": true,
    "data": [
      { "id":"shimo-song", "title":"世末歌者", "singer":"乐正绫", "series_id":"shimo", "date":"2016-08-25", "heat":{...}, "panels":[...], "milestones":[...], ... },
      ...
    ]
  }
  ```
- 失败响应：`{ "ok": false, "error": "读取歌曲失败：<中文原因>" }`
- SQL 必须参数化（本接口无外部参数，但仍走参数化查询以统一规范）。
- 真库验证：在数据库里把某首歌的 `title` 改一个字 → 再次请求 → `data` 中对应项跟着变 = 读的是真库。

### 2.2 `GET /api/favorites?uid=<uid>` ✅ 已实现

- 公网地址（地址栏可直接打开）：
  ```
  https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/rpc/get_favorites?uid=<你的uid>&apikey=sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO
  ```
- 服务端实际实现：PostgreSQL 函数 `public.get_favorites(uid text)`
- 方法：GET / POST（查询参数 / 请求体参数 `uid` 必填）
- 作用：从 `favorites` 表读取指定用户的收藏歌曲 `id` 列表。
- 成功响应：
  ```json
  { "ok": true, "data": ["shimo-song", "xiafeng", ...] }
  ```
- 缺 `uid`：`{ "ok": false, "error": "缺少必填参数 uid" }`
- 失败响应：`{ "ok": false, "error": "读取收藏失败：<中文原因>" }`
- 写入接口见 2.3（Day 18 已实现）；`DELETE` 取消收藏属**第 4 周**。

### 2.3 `POST /api/favorites` ✅ 已实现（Day 18）

- 公网地址（调试工具可直接 POST）：
  ```
  https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/rpc/add_favorite?apikey=sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO
  ```
- 服务端实际实现：PostgreSQL 函数 `public.add_favorite(uid text, song_id text)`（`SECURITY DEFINER`）
- 方法：POST；请求体 `{"uid":"...","song_id":"..."}`
- 作用：把一条收藏**真实写入** `favorites` 表。
- 成功（HTTP 200）：
  ```json
  { "ok": true, "data": { "uid": "u_xxx", "song_id": "shimo-song" }, "error": null }
  ```
- 校验与防重复（失败仍返回 HTTP 200，靠 `ok:false` 区分）：
  - 缺 `uid` / `song_id` → `{ "ok": false, "data": null, "error": "缺少必填参数：uid、song_id" }`（中文，缺哪个说哪个）
  - `song_id` 不存在 → `{ "ok": false, "data": null, "error": "歌曲不存在：<id>" }`
  - 重复提交 → `{ "ok": false, "data": { ..., "duplicate": true }, "error": "这首歌已经在收藏里了，不要重复添加" }`（**不重复写入**）
- 测试脚本：`scripts/test-write-api.cjs`（正常写入 / 重复提交 / 缺必填字段 三条）。

### 2.4 `PATCH /api/favorites/:song_id`（改备注）✅ 代码就绪 · SQL 待执行（Day 22）

- 服务端实现（SQL 已入库 `scripts/005_update_delete.sql`，需在 Supabase SQL Editor 执行一次后生效）：
  PostgreSQL 函数 `public.update_favorite_note(uid text, song_id text, note text)`（`SECURITY DEFINER`）
- 公网地址（执行 SQL 后可用）：
  ```
  https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/rpc/update_favorite_note?apikey=sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO
  ```
- 方法：POST；请求体 `{"uid":"...","song_id":"...","note":"..."}`
- 作用：只修改该条收藏的 `note`（备注）字段；`note` 传空 = 清空备注。**除备注外的任何字段都不可通过本接口修改。**
- 成功（HTTP 200）：
  ```json
  { "ok": true, "data": { "uid": "u_xxx", "song_id": "shimo-song", "note": "测试-改" }, "error": null }
  ```
- 防呆（失败仍 HTTP 200，靠 `ok:false` 区分）：
  - 缺 `uid` / `song_id` → `{ "ok": false, "error": "缺少必填参数：uid、song_id" }`
  - 备注超过 200 字 → `{ "ok": false, "error": "备注太长（最多 200 字），请删减后再保存" }`
  - 收藏不存在 → `{ "ok": false, "error": "收藏不存在：<id>（要先收藏这首歌才能改备注）" }`（**绝不静默成功**）

### 2.5 `DELETE /api/favorites/:song_id`（取消收藏）✅ 代码就绪 · SQL 待执行（Day 22）

- 服务端实现：PostgreSQL 函数 `public.delete_favorite(uid text, song_id text)`（`SECURITY DEFINER`，物理删除）
- 公网地址（执行 SQL 后可用）：
  ```
  https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/rpc/delete_favorite?apikey=sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO
  ```
- 方法：POST；请求体 `{"uid":"...","song_id":"..."}`
- 作用：删除该用户的一条收藏；删除后 `GET /api/favorites` 不再返回该 id。
- 成功（HTTP 200）：
  ```json
  { "ok": true, "data": { "uid": "u_xxx", "song_id": "shimo-song", "deleted": true }, "error": null }
  ```
- 防呆：
  - 缺 `uid` / `song_id` → `{ "ok": false, "error": "缺少必填参数：uid、song_id" }`
  - 收藏不存在 → `{ "ok": false, "data": { ..., "missing": true }, "error": "这条收藏不存在或已被删除：<id>" }`（删不存在的不算成功，也不崩）
- 二次确认：由**前端**负责（歌曲页收藏按钮与检查台删除按钮都会先弹 `confirm`，用户确认后才发 DELETE）。

### 2.6 `GET /api/favorites/detail?uid=<uid>`（收藏明细，Day 22 新增）✅ 代码就绪 · SQL 待执行

- 服务端实现：PostgreSQL 函数 `public.get_favorites_detail(uid text)`
- 方法：GET / POST（参数 `uid` 必填）
- 作用：读取该用户的收藏明细（含 `note` 备注与 `created_at`），用于检查台展示与「改之前/改之后」对比。原 `get_favorites`（2.2）保持不变，避免破坏已有调用。
- 成功响应：
  ```json
  { "ok": true, "data": [ { "song_id": "xiafeng", "note": "测试-改", "created_at": "2026-10-20T..." } ] }
  ```

---

## 3. 部署与验证（Supabase · 实际落地记录 2026-10-20）

1. **建表 + 种子**：`scripts/sync-db.cjs` 用数据库连接串直连 Supabase，执行建表（`songs` / `favorites`），并按 `INSERT ... ON CONFLICT (id) DO NOTHING` **幂等**导入 `js/data.js` 的 37 首。
2. **读接口**：同一脚本创建两个 PostgreSQL 函数 `get_songs()` / `get_favorites(uid text)`，`SECURITY DEFINER` + `GRANT EXECUTE TO anon`，由 Supabase PostgREST 自动暴露为 HTTP RPC（等价「云函数」）。
3. **安全**：两张表开启 RLS 且不开放 anon 直读；公开读只能走上述 RPC（已验证 anon 直读 `/rest/v1/songs` 返回空数组）。
4. **真库验证**：把 `songs` 中 `xiafeng` 的 `title` 改成「夏风·改库验证」→ 公开 RPC 立即返回新值 → 已还原为「夏风」。结果：`PUBLIC_PROOF_OK=true`。
5. **跨域**：Supabase REST 的跨域响应头由平台统一给出 `Access-Control-Allow-Origin: *`，**免费项目不提供按域名白名单收紧的配置**。GitHub Pages 静态站可直接 `fetch`。
   - **Day 20 公网复核（2026-10-20，headless Edge 真机宽度 390）**：从 `https://xingho-vibecoding.github.io` 页面内 `fetch` 本接口 —— `get_songs` 返回 HTTP 200 / `ok:true` / **37 条** / 757ms；`get_favorites` 返回 HTTP 200 / `ok:true` / 0 条 / 912ms。跨域请求能读到响应体 = CORS 通过。
   - **读数提醒**：在 JS 里 `headers.get("access-control-allow-origin")` 返回 `null` 属正常现象——该头不在浏览器允许脚本读取的列表里，读不到不代表没配置。判断跨域只能看「请求是否成功拿到数据」。
   - **与课程的差异（如实记录，不假装已按课程做）**：课程要求「跨域只允许自己的静态托管域名，禁止使用 `*`」。Supabase 的做法是把 ACAO 固定为 `*`，无法按域名收紧。因此本项目安全边界不靠 CORS，而靠三层：`anon` 只暴露 publishable key（可公开）；`songs` / `favorites` 两张表开启 RLS 且不开放 anon 直读；公开读只能调用 `SECURITY DEFINER` 的 RPC（函数白名单）。
   - **网络实况**：同日复核中，页面首屏自身的请求出现过 1 次 `net::ERR_CONNECTION_RESET`，同一请求随后重试成功。属网络层偶发重置，与 CORS 无关。正因如此，Day 20 的检查台必须显示「数据来源：云端 / 本地兜底」，不能让接口抖动被静默掩盖成「看起来正常」。
7. **境内访问间歇性干扰（Day 20 当晚发现，如实记录）**：2026-10-20 20:20 起，境内多个独立网络（站长宽带 + 手机 5G 流量）同时无法访问 `*.supabase.co`——TCP 443 能通（Cloudflare IP `104.18.38.10`），TLS 握手后立刻被 `ECONNRESET` 掐断；**同一时刻从境外路径访问同一接口完全正常**（`get_songs` 返回 `ok:true` / 37 条），且 Supabase 官方状态页无任何故障公告。判断：不是项目或代码问题，是境内到 Cloudflare 的 SNI 间歇性阻断，时好时坏（当天 19:50 / 20:15 / 20:18 三次全通，20:20 起持续约 20 分钟以上）。
   - 页面按 Day 20 设计正确降级，这次是真实场景检验：检查台显示「● 接口异常 + 失败原因：网络或服务不可用」，首页亮出「云端接口暂时不可用」警告条并回落本地数据——两条提示都肉眼可见，没有静默装好。
   - 应对：等链路恢复后复验「公网写入持久化」；若日后频繁发生，可考虑自定义域名绑定或反代（超出本周清单，第 4 周后再议）。
6. **备选（未部署）**：`supabase/functions/get-songs|get-favorites/index.ts` 为 Deno Edge Function 版本，供将来需要自定义鉴权/聚合时启用；当前读接口无需它，故未部署。

---

## 4. 验收对照（Day 17 完成标准）

- [x] 接口公网可访问，返回形状与契约一致（`{ok,data,error}`）
- [x] 数据来自真实数据库（改库后接口数据跟着变）
- [x] 错误时返回 `{ok:false,error}` 中文说明
- [x] 本契约中接口标记为「已实现」
- [x] 提交并推送（commit 标题 `Day 17｜一句话`；说明两行：改了什么 / 加了什么），随后停下等确认
