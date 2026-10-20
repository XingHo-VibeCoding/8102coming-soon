// regress-api.cjs —— Day 19 全接口回归：重构后逐个接口重新调用，确认响应形状与行为不变。
// 运行：node scripts/regress-api.cjs
const URL = 'https://wtqzywartwuyzeiiqlyb.supabase.co';
const KEY = 'sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO';
const UID = 'regress-day19';

async function rpc(name, body) {
  const r = await fetch(`${URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: KEY,
      Authorization: 'Bearer ' + KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: r.status, json };
}

async function main() {
  const songs = await rpc('get_songs', {});
  const favs = await rpc('get_favorites', { uid: UID });
  // 全新 uid：验证「正常写入仍返回 ok:true」（重构后行为不变）
  const FRESH = 'regress-day19-' + Date.now().toString(36);
  const addFresh = await rpc('add_favorite', { uid: FRESH, song_id: 'xiafeng' });
  const add1 = await rpc('add_favorite', { uid: UID, song_id: 'shimo-song' });
  const add2 = await rpc('add_favorite', { uid: UID, song_id: 'shimo-song' });
  const missing = await rpc('add_favorite', { uid: '', song_id: '' });

  const out = {
    'GET /api/songs': {
      status: songs.status,
      keys: Object.keys(songs.json),
      ok: songs.json.ok,
      rows: songs.json.data ? songs.json.data.length : null,
      first: songs.json.data && songs.json.data[0] ? songs.json.data[0].id : null,
    },
    'GET /api/favorites': {
      status: favs.status,
      keys: Object.keys(favs.json),
      ok: favs.json.ok,
      data: favs.json.data,
    },
    'POST /api/favorites (新 uid 首次)': {
      status: addFresh.status,
      keys: Object.keys(addFresh.json),
      ok: addFresh.json.ok,
      data: addFresh.json.data,
      error: addFresh.json.error,
    },
    'POST /api/favorites (首次)': {
      status: add1.status,
      keys: Object.keys(add1.json),
      ok: add1.json.ok,
      data: add1.json.data,
      error: add1.json.error,
    },
    'POST /api/favorites (重复)': {
      status: add2.status,
      keys: Object.keys(add2.json),
      ok: add2.json.ok,
      duplicate: !!(add2.json.data && add2.json.data.duplicate),
      error: add2.json.error,
    },
    'POST /api/favorites (缺字段)': {
      status: missing.status,
      keys: Object.keys(missing.json),
      ok: missing.json.ok,
      error: missing.json.error,
    },
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => { console.log('FAIL ' + e.message); process.exit(2); });
