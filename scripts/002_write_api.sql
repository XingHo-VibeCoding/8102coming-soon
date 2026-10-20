-- ============================================================
-- 002_write_api.sql —— Day 18：第一条业务写入接口（POST）
-- 契约对应：POST /api/favorites（服务端实现为 add_favorite RPC）
-- 可重复执行（CREATE OR REPLACE）。
--
-- 写入比读取多三件事，本函数一次做齐：
--   1) 校验：必填字段缺失 → 拒绝，并返回中文说明（缺哪个说哪个）
--   2) 防重复：同一 (uid, song_id) 已存在 → 拒绝，不重复写入
--   3) 错误处理：任何失败都转成 { ok:false, error:"中文说明" }，不抛裸英文堆栈
-- 统一响应形状：{ ok, data, error }
-- ============================================================

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
  -- 1) 校验必填字段：缺哪个说哪个
  IF v_uid IS NULL OR v_song IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'data', null,
      'error', '缺少必填参数：' || concat_ws(
        '、',
        CASE WHEN v_uid IS NULL THEN 'uid' END,
        CASE WHEN v_song IS NULL THEN 'song_id' END
      )
    );
  END IF;

  -- 2) 校验歌曲存在：避免把不存在的歌曲 id 写进收藏（防脏数据）
  IF NOT EXISTS (SELECT 1 FROM songs s WHERE s.id = v_song) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'data', null,
      'error', '歌曲不存在：' || v_song
    );
  END IF;

  -- 3) 防重复：已经在收藏里 → 明确拒绝，不重复写入
  IF EXISTS (SELECT 1 FROM favorites f WHERE f.uid = v_uid AND f.song_id = v_song) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'data', jsonb_build_object('uid', v_uid, 'song_id', v_song, 'duplicate', true),
      'error', '这首歌已经在收藏里了，不要重复添加'
    );
  END IF;

  -- 4) 正常写入
  INSERT INTO favorites (uid, song_id) VALUES (v_uid, v_song);

  RETURN jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object('uid', v_uid, 'song_id', v_song),
    'error', null
  );
END;
$$;
