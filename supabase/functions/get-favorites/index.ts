// 世末歌者 · Edge Function: GET /api/favorites?uid=<uid>
// 从 favorites 表读取指定用户的收藏歌曲 id 列表，返回统一形状 { ok, data, error }
//
// 运行环境：Supabase Edge Function（Deno）
// 依赖：仅 Deno 标准库 + postgres 驱动（URL import，无 npm 第三方依赖）
// 查询用「标记模板」自动参数化（uid 来自查询参数，绝不字符串拼接）。
// DATABASE_URL 仅从环境变量读取；错误一律转成 { ok:false, error } 返回 200。
//
// 注意：收藏的「写入」接口（POST/DELETE）留到 Day 18。

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const DATABASE_URL = Deno.env.get("DATABASE_URL") ?? "";
const pool = new Pool(DATABASE_URL, 5, true);

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");
    if (!uid) {
      return new Response(
        JSON.stringify({ ok: false, error: "缺少必填参数 uid" }),
        { headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } }
      );
    }
    const conn = await pool.connect();
    try {
      const result = await conn.queryObject<{ song_id: string }>`
        select song_id from favorites where uid = ${uid} order by created_at asc
      `;
      const data = result.rows.map((r) => r.song_id);
      return new Response(JSON.stringify({ ok: true, data }), {
        headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
      });
    } finally {
      conn.release();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ ok: false, error: "读取收藏失败：" + msg }),
      { headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } }
    );
  }
});
