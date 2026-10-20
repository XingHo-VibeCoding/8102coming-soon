// ============================================================
// store.js —— 数据访问层（依据 TECH_DESIGN.md §4）
// 页面只调 Store 的函数，不直接碰 data.js。
// 未来迁移方案 B（云后端）时，只改本文件内部实现，页面代码零改动。
// ============================================================

// Song 必填字段（TECH_DESIGN §3.2）；myStory 虽标必填但首版为占位文案（2026-09-26 站长拍板），不校验
const REQUIRED_SONG_FIELDS = [
  "id", "title", "singer", "author", "date",
  "badges", "intro", "panels",
];
// bilibili 单列（Day 14 补录时改）：不是每首歌都在B站有投稿页（如《同归世界线》只投了 5sing）。
// 求真务实：允许没有 bilibili，但必须写明 noBilibili 原因，不许留空、更不许编造链接。
function validateSong(song) {
  const missing = REQUIRED_SONG_FIELDS.filter(
    (f) => song[f] === undefined || song[f] === null || song[f] === ""
  );
  const hasBili = typeof song.bilibili === "string" && song.bilibili.trim() !== "";
  const hasReason = typeof song.noBilibili === "string" && song.noBilibili.trim() !== "";
  if (!hasBili && !hasReason) missing.push("bilibili（或 noBilibili 说明）");
  if (missing.length > 0) {
    console.warn(
      `[store] 歌曲「${song.title || song.id}」缺少必填字段：${missing.join("、")}，已跳过该条`
    );
    return false;
  }
  return true;
}

/**
 * Day 20：把「这一刻」格式化成 `2026-10-20 19:52:31`（本地时区）。
 * 用作接口的真实抓取时间。故意不用 toLocaleString——各浏览器格式不一致，
 * 截图里的时间会长得不一样，验收时容易看错。
 */
function nowText() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// 收藏的本地存储键（Day 11）：云端读不到时的回落备份，不再是唯一数据源
const FAV_KEY = "zvf:favorites";
// 本机用户标识的存储键（Day 18）：课程不登录、不建用户表，
// 收藏按「本机生成的 uid」区分，首次访问时生成并一直复用。
const UID_KEY = "zvf:uid";

// ---- Day 19：HTTP 细节已拆到 js/api.js（数据访问层）----
// store.js 只负责业务逻辑（缓存、回落、状态整理），不再拼 URL / 带请求头。
// 接口契约见仓库根目录 api-contract.md。

const Store = {
  // Day 17：云端歌曲缓存；null = 尚未加载，回落静态 SONGS
  _songs: null,
  _loadPromise: null,

  // Day 20：记录「这次数据到底从哪来的」，给云端数据检查台和首页兜底提示用。
  //   source: "none" 还没请求过 / "cloud" 云端真实数据 / "local" 本地 data.js 兜底
  //   apiCount: 接口原样返回的条数（未经校验）
  //   ms: 本次请求耗时；at: 请求完成的真实时刻；error: 失败原因（成功时为空）
  _meta: { source: "none", apiCount: 0, ms: 0, at: "", error: "" },

  // Day 18：云端收藏缓存；null = 尚未加载，回落本地备份
  _favs: null,
  _favPromise: null,

  /** 全部歌曲（F1 首页卡片列表用）。Day 17 起优先返回云端真实数据，失败回落静态 SONGS。 */
  getAllSongs() {
    return (Store._songs || SONGS).filter(validateSong);
  },

  /** 按 id 取单首歌（F3 漫剧页用）；找不到返回 null */
  getSongById(id) {
    const song = (Store._songs || SONGS).find((s) => s.id === id);
    return song && validateSong(song) ? song : null;
  },

  /**
   * Day 17：从云端读取真实歌曲数据（第一条 GET 读接口）。
   * 用课程要求的统一返回形状 {ok,data,error}；任何失败都回落静态 SONGS，不让页面崩。
   * 结果缓存到 _songs，重复调用复用同一次请求。
   */
  loadSongs() {
    if (Store._loadPromise) return Store._loadPromise;
    Store._loadPromise = (async () => {
      const t0 = performance.now();
      try {
        // Day 19：调用数据访问层，不再在这里拼请求
        const j = await Api.getSongs();
        const ms = Math.round(performance.now() - t0);
        if (j && j.ok === true && Array.isArray(j.data) && j.data.length) {
          Store._songs = j.data;
          // Day 20：记下「云端成功」，检查台与首页据此显示数据来源
          Store._meta = {
            source: "cloud",
            apiCount: j.data.length,
            ms,
            at: nowText(),
            error: "",
          };
          console.info(`[store] 已从云端加载 ${Store._songs.length} 首真实歌曲（${ms}ms）`);
        } else {
          Store._meta = {
            source: "local",
            apiCount: 0,
            ms,
            at: nowText(),
            error: (j && j.error) || "云端返回异常（ok 不为 true 或 data 为空）",
          };
          console.warn("[store] 云端返回异常，回落静态数据：", j);
        }
      } catch (e) {
        Store._meta = {
          source: "local",
          apiCount: 0,
          ms: Math.round(performance.now() - t0),
          at: nowText(),
          error: (e && e.message) || "网络异常",
        };
        console.warn("[store] 云端读取失败，回落静态数据：", e);
      }
      return Store._songs;
    })();
    return Store._loadPromise;
  },

  /**
   * Day 20：当前页面用的是哪份数据——"cloud"（云端真实）/ "local"（本地兜底）/ "none"（还没请求）。
   * 首页用它决定是否亮出「云端不可用」提示条；检查台直接展示同一个值。
   */
  getDataSource() {
    return Store._meta.source;
  },

  /** Day 20：加载元信息的只读快照（检查台渲染用） */
  getLoadMeta() {
    return { ...Store._meta };
  },

  /** 全部系列，附收录歌曲数（F2 系列列表用） */
  getAllSeries() {
    return SERIES.map((s) => ({
      ...s,
      songCount: s.songIds.filter((id) => Store.getSongById(id)).length,
    }));
  },

  /** 按 id 取单个系列及其歌曲（F2 系列详情页用）；找不到返回 null */
  getSeriesById(id) {
    const series = SERIES.find((s) => s.id === id);
    if (!series) return null;
    const songs = series.songIds
      .map((sid) => Store.getSongById(sid))
      .filter(Boolean);
    return { ...series, songCount: songs.length, songs };
  },

  /**
   * 热度榜（首页区块 1）：取带 heat 数值的歌，按播放快照降序。
   * 没有可靠数字的歌不参与排名（一·六/一·七：不编造）。
   */
  getHotSongs(limit) {
    return Store.getAllSongs()
      .filter((s) => s.heat && typeof s.heat.plays === "number")
      .sort((a, b) => b.heat.plays - a.heat.plays)
      .slice(0, limit || 3);
  },

  /**
   * 搜索歌曲（F4）：按曲名 / 虚拟歌手 / 系列名匹配，大小写不敏感。
   * 空关键词返回全部。
   */
  searchSongs(keyword) {
    const kw = String(keyword || "").trim().toLowerCase();
    const songs = Store.getAllSongs();
    if (!kw) return songs;

    // 歌曲id → 所属系列名（可能属于多个系列）
    const seriesNames = {};
    SERIES.forEach((s) =>
      s.songIds.forEach((sid) => {
        (seriesNames[sid] = seriesNames[sid] || []).push(s.name.toLowerCase());
      })
    );

    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(kw) ||
        song.singer.toLowerCase().includes(kw) ||
        (seriesNames[song.id] || []).some((name) => name.includes(kw))
    );
  },

  // ---------- 虚拟歌手筛选（Day 12）----------
  // 一首歌的 singer 可能是多人合唱，形如「洛天依、言和、乐正绫」，
  // 拆分符按顿号/逗号/斜杠兼容（数据录入时可能混用）。

  /** 拆分 singer 字段为歌手名数组，去空格去空值 */
  splitSingers(singer) {
    return String(singer || "")
      .split(/[、,，/]/)
      .map((name) => name.trim())
      .filter(Boolean);
  },

  /**
   * 全部虚拟歌手 + 各自歌曲数（按曲数降序），供首页筛选按钮使用。
   * 曲数按「该歌手参与的全部歌曲」计（合唱曲对每个歌手都记一次），
   * 因此各数之和会大于歌曲总数，这是合唱的正常结果，不是算错。
   */
  getSingers() {
    const counts = new Map();
    Store.getAllSongs().forEach((song) => {
      Store.splitSingers(song.singer).forEach((name) => {
        counts.set(name, (counts.get(name) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh"));
  },

  /**
   * 筛选歌曲（Day 12）：歌手 + 关键词，两者叠加生效（同时满足才留下）。
   * singer 传空字符串表示不限歌手；关键词沿用 searchSongs 的匹配规则。
   */
  filterSongs(singer, keyword) {
    const sg = String(singer || "").trim();
    const songs = Store.searchSongs(keyword);
    if (!sg) return songs;
    return songs.filter((song) => Store.splitSingers(song.singer).indexOf(sg) !== -1);
  },

  // ---------- 收藏（Day 11 建形 · Day 18 接云端写入）----------
  // Day 18 起：收藏真实写进 Supabase 的 favorites 表（POST /api/favorites），
  // 本机 localStorage 降级为「云端读不到时」的回落备份，不再是唯一数据源。
  // 页面依旧只调 Store 的函数，不直接碰 localStorage / fetch。
  //
  // 重要：课程 Day 18 明确「今日不做 DELETE」，所以这里只有「加入收藏」，
  // 没有「取消收藏」——取消要等第 4 周的 DELETE 接口（见 api-contract.md）。

  /** 本机用户标识：首次访问时生成，之后一直复用（课程不登录、不建用户表） */
  getUid() {
    try {
      let uid = localStorage.getItem(UID_KEY);
      if (!uid) {
        uid = "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(UID_KEY, uid);
      }
      return uid;
    } catch (err) {
      console.warn("[store] 无法读写本机 uid，收藏将不可用：", err);
      return "";
    }
  },

  /** 本地收藏列表（云端不可用时的回落备份） */
  _localFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
    } catch (err) {
      console.warn("[store] 读取本地收藏失败（当作没有收藏处理）：", err);
      return [];
    }
  },

  /** 收藏的歌曲 id 列表：优先云端缓存，云端还没加载完就先用本地备份 */
  getFavorites() {
    return Store._favs || Store._localFavorites();
  },

  /** 这首歌收藏了没 */
  isFavorite(id) {
    return Store.getFavorites().indexOf(id) !== -1;
  },

  /**
   * Day 18：从云端读取我的收藏（GET /api/favorites）。
   * 失败时静默回落到本地备份，不让页面崩。
   */
  loadFavorites() {
    if (Store._favPromise) return Store._favPromise;
    Store._favPromise = (async () => {
      const uid = Store.getUid();
      if (!uid) return Store._localFavorites();
      try {
        // Day 19：调用数据访问层，不再在这里拼请求
        const j = await Api.getFavorites(uid);
        if (j && j.ok === true && Array.isArray(j.data)) {
          Store._favs = j.data;
          console.info(`[store] 已从云端加载 ${Store._favs.length} 条收藏`);
        } else {
          console.warn("[store] 云端收藏返回异常，回落本地：", j);
        }
      } catch (e) {
        console.warn("[store] 云端读取收藏失败，回落本地：", e);
      }
      return Store.getFavorites();
    })();
    return Store._favPromise;
  },

  /**
   * Day 18：加入收藏（POST /api/favorites）——真实写进数据库。
   * 成功：更新云端缓存 + 同步本地备份，返回 true。
   * 被拒（重复 / 缺字段 / 歌曲不存在）：reject 一个带中文说明的 Error，由界面提示。
   * 注意：不做「取消收藏」——DELETE 属于第 4 周，课程 Day 18 明确今日不做。
   */
  async addFavorite(id) {
    const uid = Store.getUid();
    if (!uid) throw new Error("本机无法生成用户标识，收藏不可用");

    // Day 19：HTTP 细节在 api.js；这里只处理业务结果
    const j = await Api.addFavorite(uid, id);
    if (j.ok === false) {
      const err = new Error(j.error || "收藏失败");
      // 重复提交 ≠ 故障，界面据此提示「已经收藏过啦」而不是「收藏失败」
      err.duplicate = !!(j.data && j.data.duplicate);
      throw err;
    }

    // 成功：更新缓存，并同步一份到本地备份
    const list = (Store._favs || Store._localFavorites()).slice();
    if (list.indexOf(id) === -1) list.push(id);
    Store._favs = list;
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(list));
    } catch (e) {
      // 本地备份写不进去不影响云端已经写成功的结果
    }
    return true;
  },
};
