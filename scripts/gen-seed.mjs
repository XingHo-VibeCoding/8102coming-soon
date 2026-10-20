// gen-seed.mjs —— 从 js/data.js 的 SONGS 生成 scripts/seed-songs.sql
// 运行：node scripts/gen-seed.mjs
// 产物：可重复执行的 INSERT（ON CONFLICT DO NOTHING），供 Supabase SQL Editor / CLI 导入。
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = readFileSync(resolve(root, "js/data.js"), "utf8");

// data.js 是纯数据（const SERIES / const SONGS），用 new Function 取出
const { SONGS } = new Function(src + "\nreturn { SONGS }")();

const esc = (s) => String(s ?? "").replace(/'/g, "''");
const sqlStr = (v) => (v === undefined || v === null || v === "" ? "NULL" : `'${esc(v)}'`);
const sqlJson = (v) => {
  if (v === undefined || v === null) return "NULL";
  const j = JSON.stringify(v).replace(/'/g, "''");
  return `'${j}'::jsonb`;
};
// badges/panels/milestones 缺省落为空数组（而非 NULL），与表默认一致
const sqlJsonArr = (v) => {
  const arr = v === undefined || v === null ? [] : v;
  return `'${JSON.stringify(arr).replace(/'/g, "''")}'::jsonb`;
};

const lines = [];
lines.push("-- 世末歌者 · 种子数据（由 js/data.js 自动生成，可重复执行）");
lines.push("-- 每行独立 INSERT，主键冲突则跳过，重复执行不产生重复行。");
lines.push("");

for (const s of SONGS) {
  const cols = [
    "id", "title", "singer", "author", "date", "bilibili", "no_bilibili",
    "badges", "intro", "series_id", "heat", "panels", "milestones", "my_story",
  ];
  const vals = [
    sqlStr(s.id), sqlStr(s.title), sqlStr(s.singer), sqlStr(s.author), sqlStr(s.date),
    sqlStr(s.bilibili), sqlStr(s.noBilibili), sqlJsonArr(s.badges), sqlStr(s.intro),
    sqlStr(s.seriesId), sqlJson(s.heat), sqlJsonArr(s.panels), sqlJsonArr(s.milestones), sqlStr(s.myStory),
  ];
  lines.push(
    `insert into songs (${cols.join(", ")}) values (${vals.join(", ")}) ` +
    `on conflict (id) do nothing;`
  );
}

lines.push("");
lines.push(`-- 共 ${SONGS.length} 首`);

const out = resolve(root, "scripts/seed-songs.sql");
writeFileSync(out, lines.join("\n"), "utf8");
console.log("wrote", out, "songs=", SONGS.length);
