-- ============================================================
-- 004_rpc_entry.sql —— Day 19：接口层（Entry）
-- 只做三件事：接请求参数 → 调 repository → 包装 {ok,data,error}。
-- 本文件里不出现任何 SQL 查询 / 写入语句（全部在 003_repository.sql）。
-- 契约路径、参数名、响应形状与重构前完全一致（Day 19 禁止改动契约）。
-- 可重复执行（CREATE OR REPLACE）。
-- ============================================================

-- GET /api/songs
CREATE OR REPLACE FUNCTION get_songs()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'data', repo_songs_all(),
    'error', null
  );
$$;

-- GET /api/favorites?uid=
DROP FUNCTION IF EXISTS get_favorites(text);
CREATE OR REPLACE FUNCTION get_favorites(uid text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'data', repo_favorites_by_uid(uid),
    'error', null
  );
$$;

-- POST /api/favorites
CREATE OR REPLACE FUNCTION add_favorite(uid text, song_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid  text := nullif(btrim(coalesce(uid, '')), '');
  v_song text := nullif(btrim(coalesce(song_id, '')), '');
BEGIN
  -- 1) 校验必填字段（缺哪个说哪个）
  IF v_uid IS NULL OR v_song IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false, 'data', null,
      'error', '缺少必填参数：' || concat_ws(
        '、',
        CASE WHEN v_uid IS NULL THEN 'uid' END,
        CASE WHEN v_song IS NULL THEN 'song_id' END
      )
    );
  END IF;

  -- 2) 歌曲必须存在（调 repository）
  IF NOT repo_song_exists(v_song) THEN
    RETURN jsonb_build_object('ok', false, 'data', null, 'error', '歌曲不存在：' || v_song);
  END IF;

  -- 3) 防重复（调 repository）
  IF repo_favorite_exists(v_uid, v_song) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'data', jsonb_build_object('uid', v_uid, 'song_id', v_song, 'duplicate', true),
      'error', '这首歌已经在收藏里了，不要重复添加'
    );
  END IF;

  -- 4) 写入（调 repository）
  PERFORM repo_favorite_insert(v_uid, v_song);

  RETURN jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object('uid', v_uid, 'song_id', v_song),
    'error', null
  );
END;
$$;
