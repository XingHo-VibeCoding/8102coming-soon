-- ============================================================
-- 005_update_delete.sql —— Day 22：PATCH（改备注）/ DELETE（取消收藏）
-- 契约对应：
--   PATCH  /api/favorites/:song_id        → update_favorite_note RPC
--   DELETE /api/favorites/:song_id        → delete_favorite RPC
--   GET    /api/favorites/detail?uid=     → get_favorites_detail RPC（读回备注用）
-- 可重复执行（CREATE OR REPLACE / ADD COLUMN IF NOT EXISTS）。
--
-- 删除比新增更容易出事，本文件把防呆做在服务端：
--   1) 必填字段缺失 → 拒绝，缺哪个说哪个
--   2) 操作不存在的收藏 → 返回明确中文错误，绝不静默「成功」
--   3) 任何失败都转成 { ok:false, error:"中文说明" }，不抛 500 裸报错
--   4) 删除是物理删除（软删除 is_deleted 是余力加练，暂不做）
-- 统一响应形状：{ ok, data, error }
-- ============================================================

-- ---------- 0) 表结构变更：收藏加「备注」列（可空，幂等） ----------
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS note text;

-- ============================================================
-- 1) Repository 层：只管「怎么查/怎么写」，不包装响应
-- ============================================================

-- 改某条收藏的备注；返回是否真的改到了一行（防「不存在还报成功」）
-- 注意必须用 plpgsql：sql 函数里拿不到 FOUND
CREATE OR REPLACE FUNCTION repo_favorite_update_note(p_uid text, p_song_id text, p_note text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE favorites f
     SET note = p_note
   WHERE f.uid = p_uid AND f.song_id = p_song_id;
  RETURN FOUND;
END;
$$;

-- 删某条收藏；返回是否真的删到了一行
CREATE OR REPLACE FUNCTION repo_favorite_delete(p_uid text, p_song_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH gone AS (
    DELETE FROM favorites f
     WHERE f.uid = p_uid AND f.song_id = p_song_id
     RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM gone);
$$;

-- 某个 uid 的收藏明细（含备注、收藏时间），检查台展示/验证用
CREATE OR REPLACE FUNCTION repo_favorites_detail_by_uid(p_uid text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    json_agg(
      jsonb_build_object('song_id', f.song_id, 'note', f.note, 'created_at', f.created_at)
      ORDER BY f.created_at
    ),
    '[]'::json
  )
  FROM favorites f
  WHERE f.uid = p_uid;
$$;

-- ============================================================
-- 2) 接口层：接参数 → 校验 → 调 repository → 包装 {ok,data,error}
--    本文件不出现裸 SQL 之外的逻辑；SQL 全部在上面 repository 层。
-- ============================================================

-- PATCH /api/favorites/:song_id —— 只允许改备注
-- 约定：note 传空 = 清空备注（存 NULL），不算错误
CREATE OR REPLACE FUNCTION update_favorite_note(uid text, song_id text, note text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid  text := nullif(btrim(coalesce(uid, '')), '');
  v_song text := nullif(btrim(coalesce(song_id, '')), '');
  v_note text := nullif(btrim(coalesce(note, '')), '');  -- 空串 → NULL（清空备注）
BEGIN
  -- 1) 必填校验：缺哪个说哪个
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

  -- 2) 备注太长就拒（text 无限长，先给个合理上限 200 字）
  IF v_note IS NOT NULL AND length(v_note) > 200 THEN
    RETURN jsonb_build_object(
      'ok', false, 'data', null,
      'error', '备注太长（最多 200 字），请删减后再保存'
    );
  END IF;

  -- 3) 必须先有这条收藏：不存在的 id 明确报错，不静默成功
  IF NOT EXISTS (SELECT 1 FROM favorites f WHERE f.uid = v_uid AND f.song_id = v_song) THEN
    RETURN jsonb_build_object(
      'ok', false, 'data', null,
      'error', '收藏不存在：' || v_song || '（要先收藏这首歌才能改备注）'
    );
  END IF;

  -- 4) 真改（repository 返回「改没改到」，双保险）
  IF NOT repo_favorite_update_note(v_uid, v_song, v_note) THEN
    RETURN jsonb_build_object(
      'ok', false, 'data', null,
      'error', '收藏不存在：' || v_song || '（要先收藏这首歌才能改备注）'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object('uid', v_uid, 'song_id', v_song, 'note', v_note),
    'error', null
  );
END;
$$;

-- DELETE /api/favorites/:song_id —— 取消收藏（物理删除）
CREATE OR REPLACE FUNCTION delete_favorite(uid text, song_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid  text := nullif(btrim(coalesce(uid, '')), '');
  v_song text := nullif(btrim(coalesce(song_id, '')), '');
BEGIN
  -- 1) 必填校验
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

  -- 2) 删除；没删到 = 本来就不存在，明确报错而不是假装成功
  IF NOT repo_favorite_delete(v_uid, v_song) THEN
    RETURN jsonb_build_object(
      'ok', false, 'data', jsonb_build_object('uid', v_uid, 'song_id', v_song, 'missing', true),
      'error', '这条收藏不存在或已被删除：' || v_song
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object('uid', v_uid, 'song_id', v_song, 'deleted', true),
    'error', null
  );
END;
$$;

-- GET /api/favorites/detail?uid= —— 我的收藏明细（含备注），验证改/删结果用
CREATE OR REPLACE FUNCTION get_favorites_detail(uid text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'data', repo_favorites_detail_by_uid(nullif(btrim(coalesce(uid, '')), '')),
    'error', null
  );
$$;
