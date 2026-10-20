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
 * 契约规定所有接口都是这个形状；HTTP / 网络 / 格式异常也在这里转成中文，
 * 让上层（store.js）永远只需要判断 ok。
 */
async function callRpc(name, body, fallbackError) {
  let j = null;
  try {
    const r = await fetch(`${API_BASE.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: API_BASE.anon,
        Authorization: "Bearer " + API_BASE.anon,
      },
      body: JSON.stringify(body || {}),
    });
    j = await r.json();
  } catch (e) {
    return { ok: false, data: null, error: "网络或服务不可用，请稍后再试" };
  }
  if (!j || typeof j.ok !== "boolean") {
    return { ok: false, data: null, error: fallbackError || "服务返回异常，请稍后再试" };
  }
  return j;
}

const Api = {
  /** GET /api/songs —— 全部歌曲 */
  getSongs() {
    return callRpc("get_songs", {}, "读取歌曲失败，请稍后再试");
  },

  /** GET /api/favorites?uid= —— 我的收藏 id 列表 */
  getFavorites(uid) {
    return callRpc("get_favorites", { uid }, "读取收藏失败，请稍后再试");
  },

  /** POST /api/favorites —— 新增一条收藏 */
  addFavorite(uid, songId) {
    return callRpc("add_favorite", { uid, song_id: songId }, "收藏失败，请稍后再试");
  },
};
