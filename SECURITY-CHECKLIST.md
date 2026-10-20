# 安全自查清单（Day 23）

> 每一项都写明「怎么算通过」和验证命令，任何人不看代码、只照命令跑，都应得出同样结论。
> 最后核验时间：2026-10-20 晚（Day 23 当天，commit 见 git log）。

## 1. 真机密特征词 —— 工作区 0 命中

- **怎么算通过**：对已跟踪文件搜「数据库连接串（带口令）/ service_role 密钥赋值 / sb_secret_ / sk- / JWT / 密码赋值」，真机密全部 0 命中。
- **验证命令**：
  ```bash
  git grep -n -I -E -e "postgres(ql)?://[^\"' ]*:[^\"' @]+@"                      # 期望：无输出
  git grep -n -I -E -e "SUPABASE_SERVICE_ROLE_KEY|service_role[_-]key"           # 期望：仅 .env.example 的字段名说明
  git grep -n -I -E -e "sb_secret_[A-Za-z0-9_-]{8,}|sk-[A-Za-z0-9]{16,}"         # 期望：无输出
  git grep -n -I -E -e "eyJ[A-Za-z0-9_-]{20,}"                                   # 期望：无输出
  git grep -n -I -E -e "(password|passwd|pwd)\s*[:=]\s*[\"'][^\"']{3,}"          # 期望：无输出
  ```
- **当日实测**：除 `.env.example:23`（变量名 `SUPABASE_SERVICE_ROLE_KEY` 的字段说明，无任何值）外全部 0 命中（截图 `screenshots/day23-secretscan.png` 第一节）。
- **口径说明**：`service_role` 作为普通词会命中安全文档正文（本文档自己），所以扫描分两档——「密钥赋值/引用」算泄露候选，「字样提及」只统计不报警；后者当日 12 处，全在文档里。

## 2. 真机密特征词 —— 全部 Git 历史 0 命中

- **怎么算通过**：同样的特征词遍历全部 45 个提交，真机密 0 命中。历史里曾经提交过的内容也不允许有密钥。
- **验证命令**：
  ```bash
  git grep -n -I -E -e "postgres(ql)?://[^\"' ]*:[^\"' @]+@" $(git rev-list --all)
  git grep -n -I -E -e "SUPABASE_SERVICE_ROLE_KEY|sb_secret_|sk-[A-Za-z0-9]{16,}|eyJ[A-Za-z0-9_-]{20,}" $(git rev-list --all)
  ```
- **当日实测**：全部 0 命中（截图第二节；`service_role` 字样在历史中也是 0 处——安全文档都是当天新增、尚未进历史）。

## 3. 前端 publishable key 定性 —— 允许公开，且有实测依据

- **怎么算通过**：仓库中唯一大量出现的密钥是前端 publishable key（`js/api.js`、`api-contract.md`、两个测试脚本共 6 处，历史 41 处）。它设计上就是发给浏览器的公开密钥；但「可以公开」必须靠权限层证明，不靠命名：
  - 用它**直读数据表**必须拿不到数据（RLS 拦截），数据只能走 RPC 白名单函数。
- **验证方法**（浏览器或任意 HTTP 客户端）：
  ```
  GET https://wtqzywartwuyzeiiqlyb.supabase.co/rest/v1/songs?select=id,title&limit=3&apikey=<前端publishable key>
  期望：HTTP 200 + 空数组 []（RLS 拦截直读，不是 500 也不是泄数据）
  GET .../rest/v1/rpc/get_songs?apikey=<同一个 key>
  期望：HTTP 200 + { ok:true, data:[37 条歌曲] }（只有白名单 RPC 能读）
  ```
- **当日实测**：直读返回 `[]`（2026-10-20 22:0x，服务器端发起）；RPC 返回 37 条。
- **持有边界**：publishable key 固定写在 `js/api.js` 顶部的 `API_BASE`（一处维护）；`DB_URI`（真机密）只存在于本机 `.env`，永不入库。

## 4. `.env` 不在仓库且被忽略

- **怎么算通过**：仓库里不存在 `.env`；`git check-ignore -v .env` 有输出（= 提交不出去）；`git ls-files .env` 为空。
- **验证命令**：
  ```bash
  git check-ignore -v .env     # 期望：.gitignore:4:*.env	.env
  git ls-files .env            # 期望：空
  git ls-files .env.example    # 期望：.env.example（本清单所属提交起）
  ```
- **当日实测**：check-ignore 命中 `*.env`；`.env` 未跟踪；`.env.example` 已入库（截图第三节）。
- **踩过的坑（记下来防复发）**：`.gitignore` 里宽泛的 `*.env` / `.env.*` / `*secret*` 曾把 `.env.example` 和密钥扫描截图一起误伤（`git add` 后 status 里根本看不到它们）。已加 `!.env.example` 和 `!**/*secretscan*` 放行，并用 `git check-ignore -v <文件>` 逐个验证过。

## 5. `.env.example` 只有字段名，没有真实值

- **怎么算通过**：文件里允许出现变量名和占位符（如 `<DB_PASSWORD>`），不允许出现任何能用的真实值。
- **验证方法**：人工过一遍 `.env.example`，逐行确认没有真实口令；用第 1 项的特征词命令再扫一遍该文件，0 命中。

## 6. 三类错误都返回中文人话（改前 vs 改后）

- **怎么算通过**：三类各触发一次，页面出现的是中文提示；没有英文堆栈、没有白屏、没有把服务端错误谎报成网络错误。
- **当日实测**（截图三张，页面 `scripts/error-states.html`，走 `api.js` 真实 `callRpc()`，只改「请求打到哪」）：

| 类 | 触发方式 | 改前 | 改后 |
|---|---|---|---|
| 用户输入错 | `Api.addFavorite("", "xiafeng")` | 同样是中文，但只此一处、与网络错混用 | 「缺少用户标识（uid），无法收藏」（请求都不发出） |
| 网络/接口错 | 接口地址指向 `127.0.0.1:9`，真实连接失败 | 「网络或服务不可用，请稍后再试」 | 「网络连不上服务，请检查网络后再试」 |
| 服务端错 | 本地假服务端真实返回 HTTP 500 | **谎报**为「网络或服务不可用」 | 「服务端出错了，请稍后再试（错误已记录，站长会处理）」 |

- **说明**：本机到 supabase.co 的公网链路当日不通，404/5xx 无法对真服务触发，故服务端错用本地假 PostgREST（真 500 + JSON）验证；api.js 代码路径零改动。假服务端仅用于验证，源码 `scripts/mockserver.py` 一并入库、可复查。

## 7. 非法输入边界（服务端兜底）

- **怎么算通过**：空 uid / 空 song_id / 不存在的歌曲 / 重复收藏，四类请求在服务端都返回 `{ok:false, error:"中文原因"}`，HTTP 状态恒为 200（契约规定）。
- **验证方法**：见 `api-contract.md` 的失败响应示例；也可在 `scripts/error-states.html` 或检查台复现。前端在发请求前还有一层预检（`hasText` / 长度上限），双层拦截。

## 8. 密钥出现位置收敛到一处

- **怎么算通过**：`grep -rn "apikey\|anon:" js/` 只命中 `js/api.js` 的 `API_BASE`；其余文件不出现密钥字面量（文档示例除外）。
- **当日实测**：命中 6 处 = `js/api.js` ×1 + `api-contract.md`（文档示例 URL）×3 + 两个测试脚本 ×2（脚本需直连接口做回归，属明知且接受的范围；如后续要收紧，可让脚本改为读 `.env`）。

---

## 一句话结论

**可上线**：真机密（`DB_URI`）从未进过代码和历史；前端唯一持有的 publishable key 被数据库行级安全拦死、只能走白名单接口；三类错误用户看到的都是中文人话。遗留：`scripts/regress-api.cjs`、`scripts/test-write-api.cjs` 里的 publishable key 字面量可改读 `.env`（非必须，它本就是公开密钥）。
