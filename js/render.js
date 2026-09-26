// ============================================================
// render.js —— 渲染层（依据 TECH_DESIGN.md §2）
// 只负责把数据画成 HTML；路由与动效在 app.js。
// 本期（第 6 步）新增：系列区块 + 系列详情页（PRD F2 / 验收 B1-B4），
// 卡片上的系列标签升级为可点击链接（B4 反向跳转）。
// ============================================================

const Render = {
  /** 首页：歌曲卡片列表 + 系列区块（PRD F1 + F2） */
  homePage(songs) {
    const cards = songs.map(songCard).join("");

    const seriesCards = Store.getAllSeries()
      .map(
        (s) => `
        <a class="series-card reveal" href="#/series/${escapeHtml(s.id)}">
          <div class="series-head">
            <h3 class="series-name">📚 ${escapeHtml(s.name)}</h3>
            <span class="badge">${s.songCount} 首</span>
          </div>
          <p class="series-intro">${escapeHtml(s.intro)}</p>
        </a>`
      )
      .join("");

    return `
      <main class="home-page">
        <header class="home-header">
          <h1 class="home-title">🎵 中V歌曲故事</h1>
          <p class="home-sub">把歌曲蕴含的故事，做成一页页看得见的漫画。</p>
          <div class="search-box">
            <input
              id="search-input"
              class="search-input"
              type="search"
              placeholder="搜索曲名 / 虚拟歌手 / 系列名…"
              autocomplete="off"
            />
          </div>
        </header>
        <section class="card-list" id="card-list">${cards}</section>
        <section class="series-section reveal">
          <h2 class="section-title">📚 系列曲</h2>
          <div class="series-list">${seriesCards}</div>
        </section>
        <footer class="page-footer">🎵 中V歌曲故事 · 由 vibe coding 学习营 · 世末歌者工作室出品</footer>
      </main>
    `;
  },

  /** 系列详情页：世界观简介 + 该系列全部歌曲（PRD F2 / B3）。
   *  若系列定义了 chapters（如妄想症的序曲/坠落之章/上升之章），按章节分组展示。 */
  seriesPage(data) {
    if (!data) return Render.notFoundPage();

    const byId = {};
    data.songs.forEach((s) => (byId[s.id] = s));

    let body;
    if (data.chapters) {
      // 章节分组：标题下按章节小标题陈列各章歌曲
      body = data.chapters
        .map((ch) => {
          const songs = ch.songIds.map((id) => byId[id]).filter(Boolean);
          if (songs.length === 0) return "";
          return `
          <section class="chapter-block">
            <h2 class="section-title">${escapeHtml(ch.name)}</h2>
            <div class="card-list">${songs.map(songCard).join("")}</div>
          </section>`;
        })
        .join("");
    } else {
      body = `<section class="card-list">${data.songs.map(songCard).join("")}</section>`;
    }

    return `
      <main class="home-page">
        <header class="home-header">
          <h1 class="home-title">📚 ${escapeHtml(data.name)}</h1>
          <p class="home-sub">${escapeHtml(data.intro)}</p>
          <div class="song-badges"><span class="badge">${data.songCount} 首</span></div>
          <p class="series-back"><a class="btn" href="#/">← 返回首页</a></p>
        </header>
        ${body}
        <footer class="page-footer">🎵 中V歌曲故事 · 由 vibe coding 学习营 · 世末歌者工作室出品</footer>
      </main>
    `;
  },

  /**
   * 搜索结果列表（F4）：只重绘 #card-list，不整页刷新，输入框不丢焦点。
   * 无匹配时显示空状态（PRD D4：不清屏、不报错）。
   */
  filteredList(keyword) {
    const songs = Store.searchSongs(keyword);
    if (songs.length === 0) {
      return `
        <div class="empty-state">
          <p class="empty-text">没有找到相关歌曲（试试「世末」「洛天依」「妄想症」）</p>
          <button class="btn" id="clear-search" type="button">清空搜索</button>
        </div>
      `;
    }
    return songs.map(songCard).join("");
  },

  /** 漫剧页：单曲故事页（PRD F3） */
  songPage(song) {
    const badges = song.badges
      .map((b) => `<span class="badge">${escapeHtml(b)}</span>`)
      .join("");

    const panels = song.panels
      .map(
        (p, i) => `
        <figure class="panel reveal">
          <div class="panel-art" data-panel="${i + 1}">${
            p.image
              ? `<img src="${escapeHtml(p.image)}" alt="画格${i + 1}" onerror="this.parentElement.classList.add('art-fallback');this.remove()">`
              : ""
          }</div>
          <figcaption class="panel-caption">「${escapeHtml(p.caption)}」</figcaption>
        </figure>`
      )
      .join("");

    // 里程碑时间轴（PRD E1：节点带日期；date 含「快照待核」等标注原样展示，求真务实）
    const timeline = song.milestones
      .map(
        (m) => `
        <li class="milestone reveal">
          <span class="milestone-dot"></span>
          <span class="milestone-date">${escapeHtml(m.date)}</span>
          <span class="milestone-label">${escapeHtml(m.label)}</span>
        </li>`
      )
      .join("");

    return `
      <main class="song-page">
        <header class="song-header">
          <h1 class="song-title">${escapeHtml(song.title)}</h1>
          <p class="song-meta">${escapeHtml(song.singer)} · ${escapeHtml(song.author)} · ${escapeHtml(song.date)}</p>
          <div class="song-badges">${badges}</div>
        </header>
        <section class="panels">${panels}</section>
        <section class="milestones reveal">
          <h2 class="section-title">📈 成长里程碑</h2>
          <ul class="timeline">${timeline}</ul>
        </section>
        <section class="my-story reveal">
          <h2 class="section-title">💙 我的故事</h2>
          <p class="my-story-text">${escapeHtml(song.myStory)}</p>
        </section>
        <p class="listen-row">
          <a class="btn btn-listen" href="${escapeHtml(song.bilibili)}" target="_blank" rel="noopener noreferrer">▶ 去B站听这首</a>
        </p>
        <footer class="page-footer">🎵 中V歌曲故事 · 由 vibe coding 学习营 · 世末歌者工作室出品</footer>
      </main>
    `;
  },

  /** 路由兜底：找不到歌曲/页面时（TECH_DESIGN §6） */
  notFoundPage() {
    const quickLinks = Store.getAllSongs()
      .map((s) => `<a class="btn" href="#/song/${escapeHtml(s.id)}">${escapeHtml(s.title)}</a>`)
      .join(" ");
    return `
      <main class="song-page">
        <header class="song-header">
          <h1 class="song-title">没有找到这个页面</h1>
          <p class="song-meta">链接可能输错了。也许你想找的是——</p>
          <p class="nf-links">${quickLinks}</p>
          <p><a class="btn" href="#/">← 返回首页</a></p>
        </header>
      </main>
    `;
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 歌曲卡片（首页与系列页共用，PRD B3「复用卡片样式」）；系列标签可点击跳系列页（B4） */
function songCard(song) {
  const series = song.seriesId
    ? SERIES.find((s) => s.id === song.seriesId)
    : null;
  const seriesTag = series
    ? `<a class="card-series" href="#/series/${escapeHtml(series.id)}">📚 ${escapeHtml(series.name)}</a>`
    : "";
  const badges = song.badges
    .map((b) => `<span class="badge">${escapeHtml(b)}</span>`)
    .join("");
  return `
    <a class="song-card reveal" href="#/song/${escapeHtml(song.id)}">
      <div class="card-head">
        <h2 class="card-title">${escapeHtml(song.title)}</h2>
        <div class="card-badges">${badges}</div>
      </div>
      <p class="card-meta">${escapeHtml(song.singer)} · ${escapeHtml(song.author)} · ${escapeHtml(song.date)}</p>
      <p class="card-intro">${escapeHtml(song.intro)}</p>
      ${seriesTag}
    </a>`;
}
