// sync-refactor.cjs —— Day 19：把接口层重构成薄入口 + Repository 数据访问层。
// 顺序：003_repository.sql（SQL 查询/写入）→ 004_rpc_entry.sql（接口只调 repo）→ GRANT。
// 运行（需 NODE_PATH 指向含 pg 的 node_modules）：
//   NODE_PATH=... DB_URI=postgresql://... node scripts/sync-refactor.cjs
const { Client } = require('pg');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const uri = process.env.DB_URI;
if (!uri) { console.log('NO_DB_URI'); process.exit(1); }

const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
const REPO = readFileSync(resolve(__dirname, '003_repository.sql'), 'utf8');
const ENTRY = readFileSync(resolve(__dirname, '004_rpc_entry.sql'), 'utf8');

async function main() {
  await client.connect();

  await client.query(REPO);
  console.log('REPOSITORY_OK');

  await client.query(ENTRY);
  console.log('ENTRY_OK');

  for (const fn of ['get_songs()', 'get_favorites(text)', 'add_favorite(text, text)']) {
    await client.query(`GRANT EXECUTE ON FUNCTION ${fn} TO anon, authenticated`);
  }

  const r = await client.query(
    "select proname from pg_proc where proname like 'repo\\_%' order by proname"
  );
  console.log('REPO_FNS=' + r.rows.map((x) => x.proname).join(','));

  await client.end();
}

main().catch((e) => { console.log('FAIL ' + e.message); process.exit(2); });
