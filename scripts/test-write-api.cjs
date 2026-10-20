// test-write-api.cjs —— Day 18 验收：对公网 POST 接口跑三条测试 + 读回验证。
// 三条测试（课程要求）：① 正常写入 ② 重复提交被拒 ③ 缺必填字段被拒且提示中文。
// 运行：node scripts/test-write-api.cjs
const URL = 'https://wtqzywartwuyzeiiqlyb.supabase.co';
const KEY = 'sb_publishable_0NtBaZMaYbW605haSsqhUA_rifL8HCO';
const UID = process.env.TEST_UID || 'day18-test';
const SONG = process.env.TEST_SONG || 'shimo-song';

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
  const out = { uid: UID, song_id: SONG, steps: [] };

  // ① 正常写入（若已存在则先记录为 duplicate，便于重复跑本脚本）
  const r1 = await rpc('add_favorite', { uid: UID, song_id: SONG });
  out.steps.push({ test: '1_normal_write', ...r1 });

  // ② 重复提交：立刻用同样参数再调一次，应被拒
  const r2 = await rpc('add_favorite', { uid: UID, song_id: SONG });
  out.steps.push({ test: '2_duplicate_rejected', ...r2 });

  // ③ 缺必填字段：两个参数都传空串，应被拒且 error 为中文
  //    （注意：完全不传参数时 PostgREST 会先返回 404 PGRST202，函数不会被调用，
  //     所以要验证"接口自己的校验"，必须让参数出现在请求体里、值为空。）
  const r3 = await rpc('add_favorite', { uid: '', song_id: '' });
  out.steps.push({ test: '3_missing_required_empty', ...r3 });

  // ⑤ 只传 uid、song_id 为 null：应被拒，并明确指出缺的是 song_id
  const r5 = await rpc('add_favorite', { uid: UID, song_id: null });
  out.steps.push({ test: '5_missing_song_id', ...r5 });

  // ④ 读回验证：get_favorites 应能读到刚才写的 song_id
  const r4 = await rpc('get_favorites', { uid: UID });
  out.steps.push({ test: '4_read_back', ...r4 });

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => { console.log('FAIL ' + e.message); process.exit(2); });
