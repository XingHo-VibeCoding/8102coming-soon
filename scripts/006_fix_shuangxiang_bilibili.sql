-- 006_fix_shuangxiang_bilibili.sql（幂等，可重复执行）
-- 修正：双向系列三首曲补 B站官方投稿链接（2026-10-22 核实：
--   百度百科 / 搜狗百科 / 萌娘百科 / B站 view API，UP主均为 JUSF周存）：
--   1) 《正向欺骗》av1031003 = BV1Bs411Z74r（2014-03-28 投稿）
--   2) 《双向监禁》av905385  = BV1Ds411o7Yd（2014-01-10 投稿）
--   3) 《双向倾诉》aid=26586543 = BV1Fs411H7Cr（2018-07-11 投稿，标题
--      【洛天依·言和原创曲/双向系列】双向倾诉【JSA】）
-- 此前 data.js 与库中标注「未核实到公开B站投稿页」为调查疏漏，站长提供了准确番号。
-- 执行位置：Supabase Dashboard → SQL Editor → 粘贴 → Run，出现 Success 即生效。

UPDATE songs
SET bilibili = 'https://www.bilibili.com/video/BV1Bs411Z74r',
    no_bilibili = NULL
WHERE id = 'zhengxiang-qipian';

UPDATE songs
SET bilibili = 'https://www.bilibili.com/video/BV1Ds411o7Yd',
    no_bilibili = NULL
WHERE id = 'shuangxiang-jianjin';

UPDATE songs
SET bilibili = 'https://www.bilibili.com/video/BV1Fs411H7Cr',
    no_bilibili = NULL
WHERE id = 'shuangxiang-qingsu';

-- 自验（应返回 3 行：bilibili 已填、no_bilibili 为空）：
SELECT id, title, bilibili, no_bilibili FROM songs WHERE id IN ('zhengxiang-qipian', 'shuangxiang-jianjin', 'shuangxiang-qingsu');
