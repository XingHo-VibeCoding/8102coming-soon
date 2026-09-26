// ============================================================
// store.js —— 数据访问层（依据 TECH_DESIGN.md §4）
// 页面只调 Store 的函数，不直接碰 data.js。
// 未来迁移方案 B（云后端）时，只改本文件内部实现，页面代码零改动。
// ============================================================

// Song 必填字段（TECH_DESIGN §3.2）；myStory 虽标必填但首版为占位文案（2026-09-26 站长拍板），不校验
const REQUIRED_SONG_FIELDS = [
  "id", "title", "singer", "author", "date",
  "bilibili", "badges", "intro", "panels",
];

function validateSong(song) {
  const missing = REQUIRED_SONG_FIELDS.filter(
    (f) => song[f] === undefined || song[f] === null || song[f] === ""
  );
  if (missing.length > 0) {
    console.warn(
      `[store] 歌曲「${song.title || song.id}」缺少必填字段：${missing.join("、")}，已跳过该条`
    );
    return false;
  }
  return true;
}

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
};
