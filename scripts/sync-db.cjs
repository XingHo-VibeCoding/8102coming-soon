// sync-db.cjs —— 一次性把 js/data.js 的 37 首歌同步进 Supabase Postgres，并建立 RPC 读取接口。
// 运行（需 NODE_PATH 指向含 pg 的 node_modules）：
//   NODE_PATH=... node scripts/sync-db.cjs
// 环境变量 DB_URI 为 Supabase 事务连接池串（postgresql://...:6543/postgres）
const { Client } = require('pg');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const src = readFileSync(resolve(root, 'js/data.js'), 'utf8');
const { SONGS } = new Function(src + '\nreturn { SONGS }')();

const uri = process.env.DB_URI;
if (!uri) { console.log('NO_DB_URI'); process.exit(1); }

const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });

const SCHEMA = `
CREATE TABLE IF NOT EXISTS songs (
  id text PRIMARY KEY,
  title text NOT NULL,
  singer text,
  author text,
  date text,
  bilibili text,
  no_bilibili text,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  intro text,
  series_id text,
  heat jsonb,
  panels jsonb NOT NULL DEFAULT '[]'::jsonb,
  milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  my_story text
);
CREATE TABLE IF NOT EXISTS favorites (
  uid text NOT NULL,
  song_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (uid, song_id)
);
`;

const RPC = `
CREATE OR REPLACE FUNCTION get_songs()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'data', coalesce(
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
    ),
    'error', null
  ) AS result
  FROM songs s;
$$;

DROP FUNCTION IF EXISTS get_favorites(text);
CREATE OR REPLACE FUNCTION get_favorites(uid text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'data', coalesce(json_agg(f.song_id ORDER BY f.created_at), '[]'::json),
    'error', null
  )
  FROM favorites f
  WHERE f.uid = get_favorites.uid;
$$;
`;

async function main() {
  await client.connect();
  // 1) schema
  await client.query(SCHEMA);
  console.log('SCHEMA_OK');

  // 2) seed songs (idempotent)
  const cols = ['id','title','singer','author','date','bilibili','no_bilibili','badges','intro','series_id','heat','panels','milestones','my_story'];
  const ph = cols.map((_, i) => `$${i + 1}`).join(',');
  const ins = `INSERT INTO songs (${cols.join(',')}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`;
  let inserted = 0;
  for (const s of SONGS) {
    const vals = [
      s.id, s.title, s.singer, s.author, s.date, s.bilibili, s.noBilibili,
      JSON.stringify(s.badges ?? []), s.intro, s.seriesId,
      s.heat ? JSON.stringify(s.heat) : null,
      JSON.stringify(s.panels ?? []), JSON.stringify(s.milestones ?? []), s.myStory,
    ];
    const r = await client.query(ins, vals);
    inserted += r.rowCount || 0;
  }
  const cnt = await client.query('select count(*)::int as n from songs');
  console.log(`SEED_OK inserted=${inserted} total=${cnt.rows[0].n}`);

  // 3) rpc
  await client.query(RPC);
  await client.query('GRANT EXECUTE ON FUNCTION get_songs() TO anon, authenticated');
  await client.query('GRANT EXECUTE ON FUNCTION get_favorites(text) TO anon, authenticated');
  console.log('RPC_OK');

  // 4) verify shape
  const v = await client.query('select get_songs() as j');
  const j = v.rows[0].j;
  console.log('VERIFY ok=' + j.ok + ' data_len=' + (j.data ? j.data.length : 0) + ' first_id=' + (j.data && j.data[0] ? j.data[0].id : null));

  await client.end();
}

main().catch((e) => { console.log('FAIL ' + e.message); process.exit(2); });
