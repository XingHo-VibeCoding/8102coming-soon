# 最终验收表 · 世末歌者 v1.0（附录 J · 100 分）

> 验收对象：https://xingho-vibecoding.github.io/8102coming-soon/ （tag `v1.0` → 提交 `3778cc1`）
> 评分规则：逐项 PASS / FAIL / 未执行 + 证据；**未验证的内容不得标 PASS**。
> 独立核验：本表由「验收官」（与本项目无对话历史的 AI，只拿公网地址与仓库文档）复核，见文末第七节。

## 一、100 分验收表

### 1. 提示词理解与改写（20 分）— PASS

- 证据：28 天每日任务均按「五件套（背景/目标/具体内容/约束/验证方式）」改写提示词；
- 项目根目录 `AGENTS.md` 固化了七类项目约定与操作边界（改写产物之一）；
- 最有效的改写提示词见第六节。

### 2. 前端页面与交互（15 分）— PASS

- 页面/视图 ≥3：首页（列表+搜索+系列筛选）、歌曲详情（分镜/里程碑/收藏）、关于页、检查台 `#/status`（5 区块）、404 页；
- 反馈状态：收藏按钮「♡ 收藏/♥ 已收藏」切换 + toast、检查台写入/改/删的即时结果、加载中/空/错误三态（首页与检查台）；
- 移动端：`screenshots/day14-*-mobile.png` 系列 + 375px 断点验证（Day 20 记录）。

### 3. 云函数与 API（15 分）— PASS

- 本项目用 Supabase PostgREST RPC 等价实现云函数：契约见 `api-contract.md`（7 个 RPC，全部登记 ✅）；
- 健康/读取：`get_songs` ok:true 37 条（verify-report 第 3 项）；写入：`add_favorite`；错误响应：三类错误统一中文提示（Day 23，`scripts/error-states.html` 实测台 + `screenshots/day23-error-*.png`）。

### 4. 云数据库（15 分）— PASS

- 初始化：`scripts/001_schema.sql`（幂等）；真实读写：Day 18/19/20 截图与手机验证；
- 修改/删除：**2026-10-21 真库验证通过**（`screenshots/day22-real-patch.png` 改备注前后对比、`day22-real-delete.png` GET 1→0）；
- 持久化：Day 20 手机实测「刷新后收藏仍在」（`screenshots/day20-phone-write-persist.jpg`）+ 本次验收两遍核心流程（`docs/core-flow-twice.txt`）。

### 5. 第三周周成果（10 分）— PASS

- 云端数据服务 v1：Day 19 拆分 api/store 数据访问层（`LAYERING.md`）；检查台：`#/status` 五区块；演示证据：`WEEK3-REVIEW.md` + 手机截图 4 张。

### 6. Skill 与测试（10 分）— PASS

- Skill 调用：Day 12 `frontend-guidelines`（`SKILL-CALLS.md`）+ Day 25 `verify-project`（`scripts/verify-report-day25-PASS.txt`）；
- 故意失败不虚报：`scripts/verify-report-day25-FAIL-drill.txt`（注入假密钥被第 7 项抓出）；
- Bug 修复和回归：`bug-report-day24.md`（连点重复请求，修复前后服务端日志对比 6/6 轮 2 次 → 1 次）。

### 7. 线上发布（10 分）— PASS

- 公网地址可访问且展示真数据；线上读写真实执行（`docs/core-flow-twice.txt` 两遍闭环）；
- 版本标记：远端 tag `v1.0`；回滚演练真实执行（`rollback-manual.md` 第五节，含耗时硬数据）；
- 部署方式：GitHub Pages，推送自动部署。

### 8. 额度、到期和备份（5 分）— PASS（1 项待用户补截图）

- 备份：`backups/songs-backup-2026-10-21.json`（37 条全量，密钥自查 0 命中）+ `backups/README.md` 恢复说明；
- 额度/到期：`day27-resource-check.md`（免费档 7 天暂停风险与对策已写明）；
- **待办**：Supabase 控制台用量/到期截图 + favorites CSV 导出为用户手工项（文档已给步骤）。

**得分预估：95–100 分区间**（扣分点仅第 8 项的 2 个用户侧截图未归档；其余 7 项证据齐全）。

## 二、我的项目与能力底线对应表

| 能力底线 | 我的项目对应功能 | 证据 |
|---|---|---|
| 至少 3 个页面/视图 | 首页 / 歌曲详情 / 关于 / 检查台 / 404 | 截图系列 |
| 至少 1 个有反馈的交互 | 收藏切换 + 检查台写入/改/删即时结果 + 系列筛选 | `screenshots/day11-*.png`、`day22-real-*.png` |
| 至少 1 类数据真实写入并读取 | favorites（增删改查全闭环） | `day22-real-patch/delete.png` |
| 前端、云函数和数据库完整链路 | 纯静态前端 → PostgREST RPC → PostgreSQL | `api-contract.md`、`LAYERING.md` |
| 一次公网发布 | GitHub Pages，tag v1.0 | `git ls-remote --tags`、`day26-v10-live.png` |
| 刷新后数据仍存在 | Day 20 手机实测 + 本次两遍核心流程 | `day20-phone-write-persist.jpg`、`docs/core-flow-twice.txt` |
| 额度、到期和备份已记录 | `day27-resource-check.md` + `backups/` | 见上 |
| 能解释提示词和验证方式 | 本表 + 各日交付文档 | — |

## 三、结营交付清单（8 项）

| # | 交付项 | 状态 | 位置 |
|---|---|---|---|
| 1 | 公网地址 | ✅ | https://xingho-vibecoding.github.io/8102coming-soon/ |
| 2 | 代码仓库链接 | ✅ | https://github.com/XingHo-VibeCoding/8102coming-soon |
| 3 | 3–5 分钟演示录屏 | ⏳ 待用户录制（提纲已备好，见 `FINAL-ACCEPTANCE.md` 第六节） | — |
| 4 | 最终验收表和项目映射表 | ✅ | 本文件 |
| 5 | 一条最有效的改写提示词 | ✅ | 本文件第六节 |
| 6 | 运行和技术路线说明 | ✅ | 本文件第五节 |
| 7 | 数据库、部署、额度、到期和备份说明（不含密钥） | ✅ | `backups/README.md` + `day27-resource-check.md` + `rollback-manual.md` |
| 8 | 200 字以内结营总结 | ✅ 草稿（用户可按自己口吻修改） | 本文件第七节 |

## 四、验收官独立核验结果

**核验方式**：与本项目无对话历史的独立 AI 验收官，只拿到公网地址、仓库文档路径与 publishable key（公开前端凭据），两轮核验（第一轮有限证据包 → 发现缺口 → 第二轮补交完整证据包复核）。

### 第一轮（有限证据包）结论：有条件通过

- 亲测对上：站点在线、`get_songs` 37 条、`get_favorites_detail` ok:true、备份 37 条且密钥 0 命中、远端 tag `v1.0 → ad6dc56/3778cc1` 与文档逐字一致；
- 三项随机抽检（API / 备份 / 线上发布）**全部实测通过**；
- "无数字夸大、无虚报为已完成"；
- 保留点：第 2/4/5/6 项引用的截图与文档未在第一轮材料包内，无法"当场打开"。

### 第二轮（补交证据包复核）结论：**通过**

| # | 验收项 | 第一轮 | 第二轮 | 复核要点 |
|---|---|---|---|---|
| 1 | 提示词理解与改写 | 对上 | **对上** | AGENTS.md 在库 |
| 2 | 前端页面与交互 | 无法核验 | **对上** | 5 张截图全在且内容与描述一致（day13-states 四态、day11 收藏反馈、day14 双端） |
| 3 | 云函数与 API | 对上 | **对上** | 7 个 RPC 契约 + 实测互证 |
| 4 | 云数据库 | 无法核验 | **对上** | SQL 幂等脚本 + 真库改/删截图 + 持久化实测全部在库 |
| 5 | 第三周周成果 | 无法核验 | **对上** | LAYERING.md / WEEK3-REVIEW.md / 4 张手机截图全在且跨文件互证 |
| 6 | Skill 与测试 | 无法核验 | **对上** | PASS 10/10 与故障注入被抓出两份报告真实存在 |
| 7 | 线上发布 | 对上 | **对上** | 回滚演练硬数据在库 |
| 8 | 额度、到期和备份 | 对上（带说明） | **基本对上** | 控制台截图与 favorites CSV 仍待用户补（约 -3 分） |

**验收官最终判定：通过，95–97 / 100。** 无虚报、无夸大；证据跨文件相互印证（SKILL-CALLS ↔ day12/13 截图、契约 §2.4/2.5 ↔ day22-real-*.png、verify-report ↔ day25-verify.html）。

**验收官建议整改项（不阻塞结营）**：
1. 第 8 项 2 个用户侧凭证待归档（Supabase 控制台用量/到期截图、favorites CSV 导出）；
2. `scripts/secretscan-report.html` 是密钥更换前的旧版本（行号错位、key 标注不符），建议重跑更新扫描报告；
3. 演示录屏待录制。

## 五、运行和技术路线说明

- **技术路线**：纯 HTML/CSS/JS 静态站（无构建步骤）+ GitHub Pages 托管 + Supabase（PostgREST RPC ≈ 云函数，PostgreSQL ≈ 云数据库）。选型理由见 `TECH_DESIGN.md`：数据规模小、内容型站点，静态托管最稳且免费额度充裕。
- **本地运行**：无需安装任何依赖，`index.html` 直接打开或任意静态服务器（如 `python -m http.server`）即可；数据接口在 `js/api.js` 的 `API_BASE` 配置。
- **发布**：`git push origin main` 即部署；发布前跑 `python scripts/verify_project.py`（10 项，全 PASS 才放行）。
- **回滚**：见 `rollback-manual.md`（已演练，回滚命令秒级、部署分钟级）。

## 六、一条最有效的改写提示词

> 原始提示词只说「给歌曲页加收藏功能」。改写后：
>
> 「为歌曲详情页实现收藏：点击 ♡ 切换收藏状态，已收藏显示 ♥ 并有 toast 反馈；状态存云端 favorites 表（uid+song_id 唯一），刷新后不丢；重复收藏走取消流程且需二次确认；操作不存在的 id 返回明确中文错误；API 契约同步更新 api-contract.md。验证方式：浏览器操作 + 刷新持久化 + 数据库读回对比。」
>
> 有效原因：把「反馈形式、持久化位置、幂等语义、防呆边界、验证方式」五件事一次说死，AI 没有自由发挥的空间，返工为零。

## 七、结营总结（200 字草稿）

> 28 天做完「世末歌者」，最大的收获不是网站本身，而是学会了把"我想要"翻译成"AI 可执行、可验证"的任务：约束说清楚、验证方式先想好、每一步留证据。第 24 天修的连点 Bug 让我第一次体会到"页面装没事，日志才是真相"；第 26 天回滚演练把 1 分钟的事拖成 20 分钟，让我明白未演练的回滚等于没有回滚。作品是纯静态站加真数据库，增删改查闭环、有发布清单和回滚手册、有可复跑的发布前检查——它不大，但它是我能解释、能验证、能继续改的东西。接下来：补齐数据备份截图，然后按 `release-v1.0.md` 的优化方向继续迭代。

## 八、能继续改检测（验收官问答）

**问题**：只看仓库和文档，回答"给核心记录加一个统计功能（每首歌被收藏的次数统计），从哪张表、哪个接口、哪个文件开始改？"

**验收官回答（原样）**：
- **表**：`favorites` 表已存 `(uid, song_id, note, created_at)`，带 `UNIQUE(uid, song_id)`。统计每首歌被收藏次数 = 按 `song_id` 分组 `COUNT(*)`，**无需新表**，唯一约束天然去重，统计零额外写入成本。
- **接口**：仿现有 7 个 RPC 模式，新增如 `get_song_fav_counts()` 返回 `[{song_id, cnt}]`；按 `scripts/00X_*.sql` 的幂等 `CREATE OR REPLACE FUNCTION` + `SECURITY DEFINER` 规范新增脚本，PostgREST 自动暴露为 `/rest/v1/rpc/<函数名>`。
- **前端**：`js/api.js` 仿现有 rpc 封装加一次调用 → `js/store.js`/`js/render.js` 消费 → 歌曲详情页或首页展示计数。
- **合理性评估**：低风险、低改动量；聚合是只读查询、不引入新写入路径；注意新只读暴露不泄露 uid 维度即可。

**判定：能继续改 = 成立**（路径具体、与现有架构一致、未编造仓库中不存在的机制）。
