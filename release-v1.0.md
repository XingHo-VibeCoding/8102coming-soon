# 发布清单 · v1.0

> 适用于「世末歌者 / 中V歌曲故事」静态站（GitHub Pages + Supabase PostgREST）。
> 本清单与 `rollback-manual.md` 配套使用：发布前看这份，出事后看那份。

## 一、版本信息

| 项 | 值 |
|---|---|
| 版本号 | **v1.0** |
| 版本标记 | Git 标签 `v1.0`（annotated tag），指向提交 `3778cc1` |
| 公网地址 | https://xingho-vibecoding.github.io/8102coming-soon/ |
| 数据服务 | Supabase PostgREST（项目 `wtqzywartwuyzeiiqlyb`），RPC 契约见 `api-contract.md` |
| 数据库表 | `songs`（37 行真实数据）、`favorites`（uid + song_id 复合主键，含 `note` 备注列） |
| 发布方式 | GitHub Pages，`main` 分支推送后自动部署（无构建步骤，纯静态） |

## 二、v1.0 包含什么

1. **37 首歌的真实数据**：首页列表、系列筛选、歌曲详情、播放里程碑与分镜。
2. **收藏完整闭环**（Day 18 + Day 22）：新增（POST）、读取（GET）、改备注（PATCH）、取消收藏（DELETE），全部经真库验证。
3. **三类错误的中文提示**（Day 23）：用户输入错 / 网络与接口错 / 服务端错，各自给出可执行的下一步；失败不裸奔。
4. **检查台 `#/status`**（Day 20）：链路状态、数据核对、写入测试、改备注 / 删收藏、自验步骤五区。
5. **Day 24 的 Bug 修复**：快速连点「删掉收藏」不再重复发请求（busy 守卫时序修正）。
6. **发布前检查 Skill**（Day 25）：`verify-project`，一条命令 10 项检查。

## 三、发布前必须通过的验证项

执行：

```
python scripts/verify_project.py
```

判定标准：**10 项全 PASS、退出码 0、结论「可以发布」**。任何一项 FAIL 一律不得发布。
v1.0 的实跑报告存档：`scripts/verify-report-day25-PASS.txt`（提交 `3778cc1` 上执行）。

检查覆盖：公网首页可达 / 线上代码与仓库同步 / `get_songs` 37 条 / `get_favorites` 可用 /
`update_favorite_note` 与 `delete_favorite` 存在性（25006 只读探测）/ `get_favorites_detail` 可用 /
密钥 0 命中 / `.gitignore` 完整 / Git 历史无真密钥形状。

## 四、发布步骤

1. 在 `main` 上确认 `git status` 干净、`python scripts/verify_project.py` 全 PASS；
2. 更新版本号相关文档（本文件 + `rollback-manual.md` 的版本指针）；
3. 打标签：`git tag -a v1.0 -m "v1.0 正式发布：…"`；
4. 推送：`git push origin main && git push origin v1.0`；
5. 等待 Pages 部署（通常 30–120 秒），用带时间戳参数的 URL 探测，避免 CDN 缓存误判；
6. 按第五节逐项验证。

## 五、发布后逐项验证

| # | 验证项 | 通过标准 | 本次结果 |
|---|---|---|---|
| 1 | 公网首页 | 200 且标题为「中V歌曲故事」，列表渲染出 37 首 | ✅ 2026-10-21 17:30 截图 `screenshots/day26-v10-live.png` |
| 2 | 线上代码与仓库同步 | 线上 `js/app.js` 含当前版本标记 | ✅ verify-project 第 2 项 PASS |
| 3 | 读接口 | `get_songs` ok:true，37 条 | ✅ verify-project 第 3 项 PASS |
| 4 | 写接口存在 | 改备注 / 删收藏 RPC 可执行 | ✅ verify-project 第 5 项 PASS（25006 探测） |
| 5 | 版本标记 | `git ls-remote --tags origin` 能看到 `v1.0` | ✅ 远端 `refs/tags/v1.0 → ad6dc56`（指向 `3778cc1`） |
| 6 | 密钥边界 | 工作区与历史均无真密钥 | ✅ verify-project 第 7、9 项 PASS |

## 六、备份方式

| 类型 | 方式 | 位置 / 取回方法 |
|---|---|---|
| 代码 | Git 标签 `v1.0` + 完整提交历史 | `git checkout v1.0` 或 `git show v1.0`；远端标签已推送 |
| 数据 | Supabase 控制台导出（Day 27 执行） | 见 `rollback-manual.md` 第三节「数据恢复」；导出文件不入 Git |
| 配置 | `.env.example` 只登记字段名，真实值在控制台 / 本地 `.env` | 仓库内不含真实密钥 |

## 七、本次发布的已知限制（如实记录）

- **公网可达性受境内到 supabase.co 的间歇性 SNI 阻断影响**：页面本身（GitHub Pages）稳定，接口偶发 `ERR_CONNECTION_RESET`，检查台会显示「接口异常 / 网络连不上服务」并给重试按钮，属已知环境问题而非代码故障（Day 20 已定案）。
- **回滚只解决代码问题，救不回数据**：误删数据只能靠导出备份重新导入，见回滚手册第三节。
- 无用户系统、无付费能力：收藏按浏览器生成的 uid 区分，换设备/清缓存 = 换身份，这是刻意的最小化设计。
