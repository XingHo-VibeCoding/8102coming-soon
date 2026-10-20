# 第 3 周验收（Day 21）· 云端数据服务 v1

> 验收日期：2026-10-20
> 验收范围：Day 15–20（打通云端链路 → 数据模型 → 读接口 → 写接口 → 数据访问层 → 公网检查台）
> 状态只允许三种：**PASS / FAIL / 未执行**。不写「基本完成」这类模糊表述。

---

## 一、验收表（六项）

| # | 验收项 | 怎么验证 | 状态 | 证据 |
|---|---|---|---|---|
| 1 | 建表和种子脚本可重复执行 | 重跑 `scripts/sync-db.cjs`（建表用 `IF NOT EXISTS`，种子用 `INSERT … ON CONFLICT (id) DO NOTHING`），行数不翻倍；再 `select count(*) from songs` | **PASS** | `scripts/001_schema.sql`、`scripts/seed-songs.sql`、`scripts/sync-db.cjs`；`supabase-songs-query.txt`（`total_rows: 37`）；截图 `screenshots/supabase-songs-data.png`（Day 15/16 补救提交 `079aa9f`） |
| 2 | GET 接口公网可访问且返回真实数据库数据 | ① 浏览器地址栏直接打开 RPC；② 在库里改一条 `title` 再请求，数据跟着变（改完还原） | **PASS** | 契约 §2.1；`api-contract.md` §3-4 记录 `PUBLIC_PROOF_OK=true`（`xiafeng` 改成「夏风·改库验证」后接口立即返回新值，已还原）；Day 20 手机实测 20:55「`ok:true` · 取到 37 条」（`day20-phone-status-ok.jpg`）；20:47 从境外路径复核返回 37 条、首条 `xiafeng`「夏风」 |
| 3 | POST 接口完成真实写入并读回 | 写入一条收藏 → 立刻 `get_favorites` 读回，列表里必须有它；刷新页面再写一次，应被「重复」拦下 | **PASS** | Day 18：`scripts/test-write-api.cjs` 三条（正常 / 重复 / 缺字段）全过；`screenshots/day18-post-success.png`、`day18-db-row.png`（库中实存行）；Day 20 手机实测 20:59「✓ 写入成功：`xiafeng` 已落库；读回 1 条，其中包含这条」（`day20-phone-write-ok.jpg`），21:01 刷新后「上次已经写过了…数据一直留在库里」（`day20-phone-write-persist.jpg`） |
| 4 | 数据访问层重构完成且接口行为不变 | 重构后逐个接口重跑，比对响应形状与业务行为是否与重构前一致 | **PASS** | Day 19：`js/api.js`（前端 HTTP 收口）+ `scripts/003_repository.sql`（SQL 收口）+ `004_rpc_entry.sql`（接口只调 repo）；`LAYERING.md` 分层表与回归结果；`scripts/regress-api.cjs` 六条全过；截图 `screenshots/day19-api-ok.png`、`day19-file-structure.png`；commit `6d4dbf1` |
| 5 | 检查台公网可访问，他人从自己设备打开成功 | 把公网链接发给人，对方用自己的设备与网络打开 | **PASS**（见下方如实标注） | 电脑端：`screenshots/day20-status.png`（带地址栏，接口正常 37 条 + 抓取时间）；手机端：`day20-phone-status-ok.jpg`、`day20-phone-data-check.jpg` |
| 6 | 响应形状与 `api-contract.md` 一致 | 成功与失败两种情况都比对：`{ok,data,error}`；失败也走 HTTP 200 + `ok:false` + 中文 error | **PASS** | 契约 §0、§2.1–2.3；`regress-api.cjs` 实测：成功 `{ok:true,data,error:null}`，重复 `{ok:false,data:{duplicate:true},error:"这首歌已经在收藏里了…"}`，缺字段 `{ok:false,data:null,error:"缺少必填参数：uid、song_id"}` |

### 必须说清的三点（不让验收表看起来比实际更好）

1. **验收项 5 的「他人」是站长本人手机（4G/5G 流量），不是第三方。** 这是本次验收的既定做法，如实标注；严格意义上第三方交叉验证仍缺。
2. **Day 15 的公网健康、Day 17 的真库对比，只有文本记录，没有独立截图文件**（当时是终端输出）。表里引用的是记录与随后的 Day 20 截图，不是伪造的「当时截图」。
3. 数据库里现有 **2 条测试收藏**（本机测试 uid 一条、手机 uid 一条）。项目尚未实现 DELETE（第 4 周才做），故保留；这同时验证了「收藏按设备 uid 区分」的设计。

---

## 二、六天证据清单（周盘点）

| Day | 产出 | 证据是否找得到 |
|---|---|---|
| 15 | 站点公网可访问 | 站点 https://xingho-vibecoding.github.io/8102coming-soon/ 可访问；无独立健康截图（如实标注） |
| 16 | 建表 + 37 首种子数据 | ✅ `supabase-songs-query.txt`、`screenshots/supabase-songs-data.png` |
| 17 | GET 读接口 + 改库验证 | ✅ 契约 §3-4 `PUBLIC_PROOF_OK`；无独立截图（如实标注） |
| 18 | POST 写接口 + 防重复 | ✅ `day18-post-success.png`、`day18-db-row.png`、`test-write-api.cjs` |
| 19 | 数据访问层拆分 + 回归 | ✅ `day19-api-ok.png`、`day19-file-structure.png`、`LAYERING.md`、`regress-api.cjs` |
| 20 | 检查台 + 公网真机验证 | ✅ `day20-home.png`、`day20-status.png`、手机四张 `day20-phone-*.jpg` |

---

## 三、同伴交叉验证（三行结论）

| 项 | 结论 | 说明 |
|---|---|---|
| 能否打开 | 能 | 手机 4G/5G 打开 `https://xingho-vibecoding.github.io/8102coming-soon/#/status`，页面正常渲染 |
| 能否真实读写 | 能 | 点「写入一条测试收藏」→ `xiafeng` 落库、读回含该条；刷新后再点 → 提示「上次已经写过了」，数据仍在 |
| 有无报错 | 实际使用无报错 | 页面控制台 0 报错；20:41 曾出现「接口异常」，原因是境内到 `supabase.co` 的链路干扰（见契约 §3-7），换个网络即恢复，非站点缺陷 |

> 执行人：站长本人（手机）。**非第三方**。

---

## 四、3–5 分钟演示提纲

**① 用户问题（40 秒）**
中V歌曲的故事散落在 B 站简介、萌娘百科、各类考据帖里，想按一个系列读完完整脉络，得来回跳十几个页面、反复对照时间线。「中V歌曲故事」把每首歌背后的事改编成一页漫画分镜，逐格读完一个故事；系列之间还能顺着时间线往回走。

**② 核心流程（90 秒，含一次真实写入）**
首页 → 「📚 系列曲」按系列分组（默认折叠，避免首屏过长）→ 点进系列看收录曲目 → 点进单曲读漫画分镜 → 点 ♥ 收藏。
**现场写入**：打开 `#/status` 检查台 → 点「写入一条测试收藏」→ 显示「已落库、读回含这条」→ **刷新页面再点一次** → 显示「上次已经写过了」→ 证明数据真在云库里，不是前端装的。

**③ 提示词改写（60 秒）**
不是「帮我做个网站」，而是：先定 `AGENTS.md`（任务边界 / 单步推进 / 人机分工 / 事实优先），每天只做清单内一步；改数据库时明确「契约不许变」，要求 AI 给出「改完后怎么验」而不是「已经好了」。
本周关键一条：从 mock 切真库时，要求「接口地址定义在哪、F12 里请求是不是公网地址、数据条数是否等于渲染条数」三项一起验——否则静默回落会把「没接通」伪装成「一切正常」。

**④ 验证方式（50 秒）**
① 检查台 `#/status`：接口状态、耗时、真实抓取时间、条数核对（返回 / 校验通过 / 静默剔除）；② F12 → Network 看请求地址是否 `https://…supabase.co`；③ 换一台设备（手机流量）独立打开，排除「只有自己电脑能开」。

**⑤ 本周未完成项（20 秒，如实说）**
- 第三方同行复核仍缺（本次由本人手机代验）
- 数据库里留着 2 条测试收藏，等第 4 周 DELETE 接口上线后清理
- 境内访问 `supabase.co` 存在间歇性链路干扰，站点已做降级提示（检查台标记异常 + 首页警告条 + 回落本地数据）

---

## 五、本周结论

第 3 周目标「云端数据服务 v1」达成：**数据在云库里、接口公网可读写、前端读的是真库、坏了会自己喊**。
六项验收 6 PASS / 0 FAIL / 0 未执行；三项如实标注项已在第一节写明。
