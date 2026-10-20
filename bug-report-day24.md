# Day 24 Bug 报告：检查台「删掉这条收藏」快速连点会发出两次 DELETE

## 一、现象

在检查台（`#/status`）快速连点「删掉这条收藏」按钮时，本地假后端（mockserver）的访问日志显示：**每一轮删除流程 `delete_favorite` 都被真实请求了两次**。

表面上看页面行为是「正常」的：提示依然是绿色的「✓ 已删除：删除前列表 1 条，删除后读回 0 条」。因为第二次 DELETE 命中的是一条已经不存在的收藏，服务端返回 `{ok:false, data:{missing:true}}`，前端 `removeFavorite` 对 missing 做了幂等兜底，所以用户完全无感。

**这正是这个 Bug 危险的地方：它是静默的。** 在真实 Supabase 环境里，这意味着：

1. 每次手快连点都白打一次数据库请求（浪费配额、增加延迟）；
2. 如果第二次请求恰好命中网络抖动或服务端限流，可能弹出一条莫名其妙的「删除被拒」红字，让用户以为删除失败了；
3. 同类守卫失守模式如果出现在「写入收藏」「下单」这类非幂等操作上，就是重复提交的真事故——今天在 DELETE 上抓到它，算是撞大运撞在了无害的位置。

## 二、复现步骤

1. 启动本地假后端：`python scripts/mockserver.py 8974 .`（`/__full` 提供全套假 PostgREST RPC）。
2. 用 Edge 无头 + CDP 驱动（`day24-drive.mjs`）打开 `scripts/day24-local.html#/status`（真站点代码，只把 API_BASE 指到本地假后端）。
3. 点「写入一条测试收藏」，等「✓ 写入成功」出现。
4. 对「删掉这条收藏」按钮执行 `d.click(); d.click();`（两次点击之间 0 间隔，模拟手快连点）。
5. 观察 mockserver 访问日志：出现 **两条** `POST /__full/rest/v1/rpc/delete_favorite`。

复现轮次记录：修复前用同一驱动跑了 6 轮，**6 轮全部是每轮 2 次 delete_favorite**，100% 复现。

## 三、报错原文

页面 UI 没有任何报错（这就是问题），证据在服务端日志：

```text
127.0.0.1 - "POST /__full/rest/v1/rpc/add_favorite HTTP/1.1" 200 -
127.0.0.1 - "POST /__full/rest/v1/rpc/get_favorites HTTP/1.1" 200 -
127.0.0.1 - "POST /__full/rest/v1/rpc/get_favorites HTTP/1.1" 200 -
127.0.0.1 - "POST /__full/rest/v1/rpc/get_favorites HTTP/1.1" 200 -
127.0.0.1 - "POST /__full/rest/v1/rpc/delete_favorite HTTP/1.1" 200 -   ← 第 1 次
127.0.0.1 - "POST /__full/rest/v1/rpc/delete_favorite HTTP/1.1" 200 -   ← 第 2 次（不该有）
127.0.0.1 - "POST /__full/rest/v1/rpc/get_favorites HTTP/1.1" 200 -
```

## 四、已尝试 / 排查过程

- 先怀疑是事件绑定重复（比如同一个按钮绑了两次 listener）——检查 `render.js` 每次都整体重绘 `#app`，事件用的是 `#app` 上的**事件委托**，不存在重复绑定。
- 再怀疑是 `confirm()` 阻塞期间事件排队——把两次 click 改成包在同一个同步函数里连发，照样复现，且第二次点击确实走进了 `handleStatusDelete`。
- 最后对比两次点击的执行路径，发现分叉点在守卫判断上：两次点击都在 `btn.dataset.busy === "1"` 成立**之前**通过了守卫。

## 五、根因

`js/app.js` 的 `handleStatusDelete` 里，busy 标记设得太晚：

```js
// 修复前（错误时序）：
if (!out || btn.dataset.busy === "1") return;
// ...
const before = await Api.getFavorites(uid);   // ← await 1：交出控制权
// ...
const yes = window.confirm(...);              // ← confirm 也允许其他任务插进来
if (!yes) return;
btn.dataset.busy = "1";                       // ← 守卫到现在才上锁，太晚了
```

`await Api.getFavorites(uid)` 会把控制权交回事件循环。第二次点击的 handler 在第一个 `await` 挂起期间（或 confirm 弹窗期间）被调度执行，此时 `btn.dataset.busy` 还是 undefined，守卫形同虚设。于是两条执行路径都会走到各自的 `Api.deleteFavorite`，发出两次 DELETE。

**修复**：把 `btn.dataset.busy = "1"` 提前到守卫判断之后、任何 `await` 之前；同时给「列表里本来就没有」和「confirm 取消」两个提前退出的分支补上 `delete btn.dataset.busy`，避免按钮被永久锁死。`finally` 里的清理保持不变。

```js
// 修复后（正确时序）：
if (!out || btn.dataset.busy === "1") return;
btn.dataset.busy = "1";                       // ← 先上锁，再做任何异步的事
// ...await / confirm...
// 提前退出的分支：delete btn.dataset.busy; return;
```

## 六、修复后验证（回归清单）

- [x] 同一驱动、同一连点方式重跑：mockserver 日志该轮只有 **1 次** `delete_favorite`（修复前 6/6 轮都是 2 次）。
- [x] 删除结果不受影响：仍是绿色「✓ 已删除：删除前列表 1 条（含 xiafeng），删除后读回 0 条」，1→0 正确（截图 `screenshots/day24-after.png`）。
- [x] 修复前现场留证：`screenshots/day24-before.png`（页面看不出异常，但日志是 2 次）。
- [x] 「本来就不存在时点删除」路径：加了 `delete btn.dataset.busy`，按钮不会卡死。
- [x] 「confirm 弹窗点取消」路径：同上，busy 会清掉，可再次点击。
- [x] 正常单击删除（不连点）：行为与修复前一致，无回归。
- [x] 「改备注」按钮（`handleStatusNote`）的 busy 守卫本来就是第一时间设的，未改动，抽查确认无同类问题。

## 七、反思

这类「守卫标记设晚了」的 Bug 本质是：**在异步函数里，任何在第一个 `await` 之后才设置的互斥状态都不可信**。以后写防连点，第一行就要上锁，退出路径再解锁。另外，这次能抓到它靠的是服务端日志而不是看页面——页面太会「装没事」了，请求计数才是真相。
