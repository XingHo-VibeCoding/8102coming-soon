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

// 收藏的本地存储键（Day 11）：纯静态站无服务器，收藏先记在本机浏览器里
const FAV_KEY = "zvf:favorites";

const Store = {
  /** 全部歌曲（F1 首页卡片列表用） */
  getAllSongs() {
    return SONGS.filter(validateSong);
  },

  /** 按 id 取单首歌（F3 漫剧页用）；找不到返回 null */
  getSongById(id) {
    const song = SONGS.find((s) => s.id === id);
    return song && validateSong(song) ? song : null;
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

  // ---------- 收藏（Day 11 · 页面只调这三个函数，不直接碰 localStorage）----------
  // 为什么先存本地：网站是纯静态的，没有服务器可存用户数据（PRD 方案 A）。
  // 将来接云后端（方案 B）时，只改这三个函数的内部实现，页面代码零改动。

  /** 收藏的歌曲 id 列表；读不到或数据损坏时返回空数组（不让页面崩） */
  getFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
    } catch (err) {
      console.warn("[store] 读取收藏失败（当作没有收藏处理）：", err);
      return [];
    }
  },

  /** 这首歌收藏了没 */
  isFavorite(id) {
    return Store.getFavorites().indexOf(id) !== -1;
  },

  /**
   * 切换收藏：点一下收藏，再点一下取消（撤销）。
   * 返回 Promise —— 成功给出新状态（true = 已收藏）；失败 reject 一个 Error，由界面显示失败提示。
   * 刻意延迟 700ms：让「处理中」这一态在真实站点上看得见（今天是临时实现，将来换成真实网络请求）。
   * 失败演示开关：网址后面加 ?favfail=1，操作必定失败（用于练习「失败提示」，见 README）。
   */
  toggleFavorite(id) {
    const forceFail =
      new URLSearchParams(location.search).get("favfail") === "1";

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (forceFail) {
          reject(new Error("模拟失败：网址带了 ?favfail=1"));
          return;
        }
        try {
          const list = Store.getFavorites();
          const idx = list.indexOf(id);
          let nextFav;
          if (idx === -1) {
            list.push(id);
            nextFav = true;
          } else {
            list.splice(idx, 1);
            nextFav = false;
          }
          localStorage.setItem(FAV_KEY, JSON.stringify(list));
          resolve(nextFav);
        } catch (err) {
          // 浏览器禁用本地存储 / 存储写满，都会走到这里 → 界面显示失败提示
          reject(err);
        }
      }, 700);
    });
  },
};
