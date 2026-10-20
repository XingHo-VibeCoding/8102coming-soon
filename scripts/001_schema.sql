-- ============================================================
-- 世末歌者 · 数据库初始化（Day 17 后端）
-- 运行环境：Supabase PostgreSQL（课程 CloudBase 等价云数据库）
-- 设计原则（附录 E）：可重复执行；密钥/私人信息不入库；
--   任何覆盖/删除数据的命令先停下说明（此处仅建表+索引，安全）。
-- ============================================================

-- ---------- 核心表：songs（歌曲目录，由 js/data.js 的 SONGS 全量迁入） ----------
create table if not exists songs (
  id           text primary key,                         -- 歌曲唯一标识（如 shimo-song）
  title        text not null,                           -- 曲名
  singer       text,                                     -- 演唱
  author       text,                                     -- 作曲/作者
  date         text,                                     -- 投稿日期 YYYY-MM-DD（保留原始字符串）
  bilibili     text,                                     -- B站链接（可空）
  no_bilibili  text,                                     -- 无 B站页的说明（可空）
  badges       jsonb default '[]'::jsonb,                -- 标签数组
  intro        text,                                     -- 简介
  series_id    text,                                     -- 所属系列（对应 SERIES[].id）
  heat         jsonb,                                    -- {plays,asOf,note,milestone}（可空）
  panels       jsonb default '[]'::jsonb,                -- [{image?,caption}] 分镜
  milestones   jsonb default '[]'::jsonb,                -- [{label,date}] 播放里程碑
  my_story     text,                                     -- 站长私人感想（占位）
  updated_at   timestamptz default now()                 -- 用于「改库验证」确认行已变
);

create index if not exists idx_songs_series on songs(series_id);
create index if not exists idx_songs_date   on songs(date);

-- ---------- 记录表：favorites（用户收藏，按 uid 区分，无需登录） ----------
-- 写入留到 Day 18；Day 17 仅做读取接口。
create table if not exists favorites (
  uid         text not null,                             -- 用户标识（前端 localStorage 生成）
  song_id     text not null,                             -- 收藏的歌曲 id（FK → songs.id）
  created_at  timestamptz default now(),
  primary key (uid, song_id)                             -- 重复收藏不产生重复行
);

create index if not exists idx_favorites_uid on favorites(uid);
