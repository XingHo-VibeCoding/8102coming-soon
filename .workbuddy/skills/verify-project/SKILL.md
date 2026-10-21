---
name: verify-project
description: 世末歌者项目发布前自动检查：公网可达、线上资源与仓库同步、核心读写接口、密钥泄漏、.gitignore 完整性。每次发布前或改完代码后说"跑一遍发布前检查"即可触发，输出逐项 PASS/FAIL/未执行 + 证据。
---

# 发布前检查（verify-project）

## 什么时候用

- 每次正式发布 / 打版本标记之前（必须全 PASS 才允许发布）；
- 每次改完代码推送之后（确认线上 Pages 与仓库同步、接口没被改坏）；
- 怀疑"线上是不是又抽风了"的时候（区分是代码问题还是境内到 supabase.co 的链路阻断）。

## 怎么跑

一条命令（在项目根目录执行）：

```
python scripts/verify_project.py
```

脚本只依赖 Python 3 标准库，不需要联网装包。全部检查约 20 秒。
退出码：全 PASS = 0，任何 FAIL = 1（可接 CI / 脚本判断）。

## 检查项（全部来自本项目真实踩过的坑）

| # | 检查项 | 通过标准（怎么算通过） | 对应的坑 |
|---|--------|------------------------|----------|
| 1 | 公网首页可访问 | `GET https://xingho-vibecoding.github.io/8102coming-soon/` 返回 200，且正文含「中V歌曲故事」 | Day 20 部署后以为上线了，实际 Pages 还没同步 |
| 2 | 线上代码与仓库同步 | 线上 `js/app.js` 包含当前 HEAD 里才有的版本标记字符串 | 改了代码没生效，排查半小时发现是 Pages 缓存 |
| 3 | 核心读接口 | `POST rpc/get_songs` 返回 `ok:true` 且恰好 37 条 | 建库种子漏了几首，首页看着正常其实少数据 |
| 4 | 收藏读接口 | `POST rpc/get_favorites` 返回 `ok:true` | Day 19 拆分数据访问层后曾漏掉这条链路 |
| 5 | Day 22 改/删接口存在 | `GET rpc/update_favorite_note` / `rpc/delete_favorite`（带探测参数）返回 25006 read-only（= 函数存在且可执行）；返回 PGRST202 即 FAIL | Day 22 SQL 没执行时线上静默 404，靠这次踩坑才建立存在性探测法 |
| 6 | 收藏明细接口 | `GET rpc/get_favorites_detail?uid=verify-probe` 返回 `ok:true` 且 `data` 为数组 | 同上，Day 22 新增接口 |
| 7 | 密钥不泄漏 | 工作区已跟踪文件中「密钥赋值/引用」特征（带口令连接串、service_role 赋值、sb_secret_、sk-、JWT）命中 0 处；`sb_publishable_` 属公开前端 key，白名单 | Day 23 红线排查；注意区分「字样提及」（文档正文）与「赋值/引用」 |
| 8 | .gitignore 完整 | `git check-ignore .env` 有命中，且 `.env.example` 在仓库跟踪列表里 | Day 23 曾被宽泛规则误伤：该忽略的没忽略、该提交的被忽略 |

## 输出格式

- 逐项输出 `PASS / FAIL / 未执行`，每项附一行证据（HTTP 状态码、条数、命中文件:行号等）；
- 汇总行：`共 8 项：PASS x / FAIL y / 未执行 z`；
- **禁止**输出「看起来正常」「基本没问题」这类模糊表述。

## 失败规则

- 命令不存在、请求失败、超时或证据缺失 → 该项必须报 FAIL，不允许跳过或降级为 PASS；
- 任何一项 FAIL → 本次不得发布，先修复再重跑；
- 网络类 FAIL（首页/接口超时）先重跑一次：境内到 supabase.co 有间歇性 SNI 阻断（Day 20 实测），重跑仍失败才算 FAIL，并在输出里注明「疑似链路阻断而非代码问题」。

## 验证 Skill 本身不虚报的方法

故意制造一个可恢复的失败（例如临时放一个含假密钥赋值的文件），重跑应看到对应项 FAIL；删除后重跑应恢复 PASS。Day 25 已做过一次并留档（`screenshots/day25-verify.png`）。

## 不要写进本 Skill 的东西

- 真实密钥、.env 内容（.publishable key 除外，它本就是公开前端凭据）；
- 自动化流水线（今日不做，保持"一条命令 + 人看报告"的最小形态）。
