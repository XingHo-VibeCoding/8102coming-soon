-- 006_fix_shuangxiang_bilibili.sql（幂等，可重复执行）
-- 修正：双向系列两首角色/正篇曲补 B站官方投稿链接（2026-10-22 三方核实：
--   百度百科 / 搜狗百科 / 萌娘百科 / B站 view API，UP主均为 JUSF周存）：
--   1) 《正向欺骗》av1031003 = BV1Bs411Z74r（2014-03-28 投稿，标题
--      【言和原创曲/双向系列角色歌】正向欺骗【PV付/周黑亚】）
--   2) 《双向监禁》av905385（2014-01-10 投稿，标题
--      【洛天依·言和原创曲】双向监禁【PV付/周黑亚】）
-- 此前 data.js 与库中标注「未核实到公开B站投稿页」为调查疏漏。
-- 执行位置：Supabase Dashboard → SQL Editor → 粘贴 → Run，出现 Success 即生效。

UPDATE songs
SET bilibili = 'https://www.bilibili.com/video/BV1Bs411Z74r',
    no_bilibili = NULL
WHERE id = 'zhengxiang-qipian';

UPDATE songs
SET bilibili = 'https://www.bilibili.com/video/av905385',
    no_bilibili = NULL
WHERE id = 'shuangxiang-jianjin';

-- 自验（应各返回 1 行：bilibili 已填、no_bilibili 为空）：
SELECT id, title, bilibili, no_bilibili FROM songs WHERE id IN ('zhengxiang-qipian', 'shuangxiang-jianjin');
