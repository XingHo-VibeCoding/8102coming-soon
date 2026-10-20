// 世末歌者 · Edge Function: GET /api/songs
// 从 songs 表读取全部歌曲真实数据，返回统一形状 { ok, data, error }
//
// 运行环境：Supabase Edge Function（Deno）
// 依赖：仅 Deno 标准库 + postgres 驱动（URL import，无 npm 第三方依赖）
//   课程约束（Node 18 云函数）：不引入第三方依赖、SQL 参数化、密钥走环境变量。
//   本函数以 Deno 等价实现：postgres 驱动经 URL import，无需本地 npm install；
//   查询统一用「标记模板」自动参数化，禁止字符串拼接；DATABASE_URL 仅从环境变量读取。
//
// 错误一律转成 { ok: false, error: "中文说明" }，返回 200，禁止白屏或裸英文堆栈。

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
    const conn = await pool.connect();
    try {
      const result = await conn.queryObject<Record<string, unknown>>`
        select id, title, singer, author, date, bilibili, no_bilibili,
               badges, intro, series_id, heat, panels, milestones, my_story, updated_at
        from songs
        order by date asc
      `;
      return new Response(JSON.stringify({ ok: true, data: result.rows }), {
        headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
      });
    } finally {
      conn.release();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ ok: false, error: "读取歌曲失败：" + msg }),
      { headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } }
    );
  }
});
