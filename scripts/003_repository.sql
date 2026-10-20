-- ============================================================
-- 003_repository.sql —— Day 19：数据访问层（Repository）
-- 只负责「怎么查 / 怎么写数据库」，不包装响应、不做参数校验、不返回 {ok,...}。
-- 接口层（004_rpc_entry.sql）只调这里的函数，自己不再出现 SQL。
-- 可重复执行（CREATE OR REPLACE）。
-- ============================================================

-- 全部歌曲（含 heat / panels / milestones 等 JSONB 字段）
CREATE OR REPLACE FUNCTION repo_songs_all()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id, 'title', s.title, 'singer', s.singer, 'author', s.author,
        'date', s.date, 'bilibili', s.bilibili, 'noBilibili', s.no_bilibili,
        'badges', s.badges, 'intro', s.intro, 'seriesId', s.series_id,
        'heat', s.heat, 'panels', s.panels, 'milestones', s.milestones,
        'myStory', s.my_story
      ) ORDER BY s.date
    ),
    '[]'::jsonb
  )
  FROM songs s;
$$;

-- 某个 uid 的收藏 song_id 列表（按收藏时间升序）
CREATE OR REPLACE FUNCTION repo_favorites_by_uid(p_uid text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(json_agg(f.song_id ORDER BY f.created_at), '[]'::json)
  FROM favorites f
  WHERE f.uid = p_uid;
$$;

-- 歌曲是否存在（写入前的存在性校验）
CREATE OR REPLACE FUNCTION repo_song_exists(p_song_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM songs s WHERE s.id = p_song_id);
$$;

-- 该收藏是否已存在（写入前的防重复校验）
CREATE OR REPLACE FUNCTION repo_favorite_exists(p_uid text, p_song_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM favorites f WHERE f.uid = p_uid AND f.song_id = p_song_id
  );
$$;

-- 插入一条收藏
CREATE OR REPLACE FUNCTION repo_favorite_insert(p_uid text, p_song_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO favorites (uid, song_id) VALUES (p_uid, p_song_id);
$$;
