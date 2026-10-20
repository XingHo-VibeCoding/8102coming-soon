// sync-write.cjs —— Day 18：部署第一条业务写入接口 add_favorite（POST /api/favorites）。
// 可重复执行：读取同目录 002_write_api.sql 建/换函数，再授予 anon 执行权。
// 运行（需 NODE_PATH 指向含 pg 的 node_modules）：
//   NODE_PATH=... DB_URI=postgresql://... node scripts/sync-write.cjs
const { Client } = require('pg');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const uri = process.env.DB_URI;
if (!uri) { console.log('NO_DB_URI'); process.exit(1); }

const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
const SQL = readFileSync(resolve(__dirname, '002_write_api.sql'), 'utf8');

async function main() {
  await client.connect();
  await client.query(SQL);
  await client.query('GRANT EXECUTE ON FUNCTION add_favorite(text, text) TO anon, authenticated');
  console.log('WRITE_API_OK');

  const r = await client.query("select proname from pg_proc where proname = 'add_favorite'");
  console.log('FN_COUNT=' + r.rowCount);

  await client.end();
}

main().catch((e) => { console.log('FAIL ' + e.message); process.exit(2); });
