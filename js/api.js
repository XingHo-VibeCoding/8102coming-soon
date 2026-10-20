// ============================================================
// api.js —— 数据访问层（Day 19）
// 所有对 Supabase 的 HTTP 调用集中在这里：拼 URL、带 apikey、解 JSON，
// 并把网络 / 格式异常统一转成中文 error。
// store.js（业务层）只调 Api.*，不再出现 fetch / 请求头 / 接口地址。
// 接口契约见仓库根目录 api-contract.md。
// ============================================================

const API_BASE = {
  url: "https://wtqzywartwuyzeiiqlyb.supabase.co",
  // publishable key 是公开安全的前端面密钥，本就该出现在客户端代码里
  anon: "sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO",
};

/**
 * 统一 RPC 调用：POST 到 Supabase PostgREST，返回 { ok, data, error }。
 * 契约规定所有接口都是这个形状；异常也在这里转成中文，让上层（store.js）永远只需要判断 ok。
 *
 * Day 23 —— 错误分三类，各给人能看懂的话（改前只有一个兜底「服务返回异常」，
 * 会把服务端 500 谎报成网络问题，排查时会被带偏）：
 *   ① 网络/接口错：请求根本没发出去（断网、DNS 失败、连接被重置）
 *   ② 服务端错：HTTP 4xx/5xx，按状态码说清是权限、不存在、太频繁还是宕机
 *   ③ 业务错：HTTP 200 但 ok:false（参数缺失、重复、记录不存在等），用后端的中文原因
 */
async function callRpc(name, body, fallbackError) {
  let res;
  try {
    res = await fetch(`${API_BASE.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: API_BASE.anon,
        Authorization: "Bearer " + API_BASE.anon,
      },
      body: JSON.stringify(body || {}),
    });
  } catch (e) {
    // ① 网络层失败：连接没建起来
    return { ok: false, data: null, error: "网络连不上服务，请检查网络后再试" };
  }

  let j = null;
  try {
    j = await res.json();
  } catch (e) {
    j = null;
  }

  // ② 服务端错误：按状态码区分，不把锅甩给网络
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return { ok: false, data: null, error: "没有访问权限（密钥无效或权限不足），请联系站长" };
    }
    if (res.status === 404) {
      return { ok: false, data: null, error: "接口不存在，可能是地址写错了" };
    }
    if (res.status === 429) {
      return { ok: false, data: null, error: "请求太频繁了，请等一会儿再试" };
    }
    if (res.status >= 500) {
      return { ok: false, data: null, error: "服务端出错了，请稍后再试（错误已记录，站长会处理）" };
    }
    return { ok: false, data: null, error: fallbackError || "请求没有成功，请稍后再试" };
  }

  // ③ 格式不合契约：当成服务端异常，不把半截数据交给页面
  if (!j || typeof j.ok !== "boolean") {
    return { ok: false, data: null, error: fallbackError || "服务返回的内容看不懂，请稍后再试" };
  }
  return j;
}

/** 用户输入错（第三类）：发请求之前先挡住，并告诉用户该改哪里 */
function hasText(v) {
  return typeof v === "string" && v.trim() !== "";
}

/** 统一的「参数不合格」响应，形状与契约一致 */
function badInput(message) {
  return Promise.resolve({ ok: false, data: null, error: message });
}

const Api = {
  /** GET /api/songs —— 全部歌曲 */
  getSongs() {
    return callRpc("get_songs", {}, "读取歌曲失败，请稍后再试");
  },

  /** GET /api/favorites?uid= —— 我的收藏 id 列表 */
  getFavorites(uid) {
    if (!hasText(uid)) return badInput("缺少用户标识（uid），无法读取收藏");
    return callRpc("get_favorites", { uid }, "读取收藏失败，请稍后再试");
  },

  /** POST /api/favorites —— 新增一条收藏 */
  addFavorite(uid, songId) {
    if (!hasText(uid)) return badInput("缺少用户标识（uid），无法收藏");
    if (!hasText(songId)) return badInput("缺少歌曲 id，无法收藏");
    if (songId.length > 64) return badInput("歌曲 id 太长（最多 64 个字符），请检查数据");
    return callRpc("add_favorite", { uid, song_id: songId }, "收藏失败，请稍后再试");
  },

  /** GET /api/favorites/detail?uid= —— 我的收藏明细（含备注），Day 22 */
  getFavoriteDetail(uid) {
    if (!hasText(uid)) return badInput("缺少用户标识（uid），无法读取收藏明细");
    return callRpc("get_favorites_detail", { uid }, "读取收藏明细失败，请稍后再试");
  },

  /** PATCH /api/favorites/:song_id —— 只改备注；note 为空 = 清空，Day 22 */
  updateFavoriteNote(uid, songId, note) {
    if (!hasText(uid)) return badInput("缺少用户标识（uid），无法修改备注");
    if (!hasText(songId)) return badInput("缺少歌曲 id，无法修改备注");
    if (typeof note === "string" && note.trim().length > 200) {
      return badInput("备注太长（最多 200 字），请删减后再保存");
    }
    return callRpc("update_favorite_note", { uid, song_id: songId, note: note || "" }, "修改备注失败，请稍后再试");
  },

  /** DELETE /api/favorites/:song_id —— 取消收藏，Day 22 */
  deleteFavorite(uid, songId) {
    if (!hasText(uid)) return badInput("缺少用户标识（uid），无法取消收藏");
    if (!hasText(songId)) return badInput("缺少歌曲 id，无法取消收藏");
    return callRpc("delete_favorite", { uid, song_id: songId }, "取消收藏失败，请稍后再试");
  },
};
