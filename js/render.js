// ============================================================
// render.js —— 渲染层（依据 TECH_DESIGN.md §2）
// 只负责把数据画成 HTML；路由与动效在 app.js。
// 本期（第 6 步）新增：系列区块 + 系列详情页（PRD F2 / 验收 B1-B4），
// 卡片上的系列标签升级为可点击链接（B4 反向跳转）。
// ============================================================

const Render = {
  /**
   * 首页（PRD F1 改版）：三种页面级状态——loading / success / error。
   * success 时按三区块组织：🔥 热度榜 / 🎵 全部歌曲（含搜索+空状态）/ 📚 系列曲。
   * 空状态在区块 2 内部（搜索无匹配，不清屏）。
   */
  homePage(status) {
    let content;
    if (status === "loading") {
      content = Render.homeSkeleton();
    } else if (status === "error") {
      content = Render.homeError();
    } else {
      content = `
        ${Render.hotList(Store.getHotSongs(3))}
        <section class="all-songs-section">
          <h2 class="section-title">🎵 全部歌曲</h2>
          <div class="card-list" id="card-list">${Store.getAllSongs().map(songCard).join("")}</div>
        </section>
        <section class="series-section reveal">
          <h2 class="section-title">📚 系列曲</h2>
          <div class="series-list">${Render.seriesCards()}</div>
        </section>`;
    }

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
              ${status !== "success" ? "disabled" : ""}
            />
          </div>
        </header>
        <div id="home-content">${content}</div>
        <footer class="page-footer">🎵 中V歌曲故事 · 由 vibe coding 学习营 · 世末歌者工作室出品</footer>
      </main>
    `;
  },

  /** 区块 1 🔥 热度榜：Top N，播放数为公开快照值（来源见 data.js heat 字段） */
  hotList(songs) {
    if (!songs.length) return ""; // 无可靠数据时不渲染榜单，不编造
    const medals = ["🥇", "🥈", "🥉"];
    const rows = songs
      .map((song, i) => {
        const h = song.heat;
        return `
        <a class="hot-row reveal" href="#/song/${escapeHtml(song.id)}">
          <span class="hot-rank">${medals[i] || i + 1}</span>
          <span class="hot-info">
            <span class="hot-title">${escapeHtml(song.title)}</span>
            <span class="hot-sub">${escapeHtml(song.singer)}</span>
          </span>
          <span class="hot-plays">
            <span class="hot-num">${h.plays} 万</span>
            <span class="hot-asof">播放快照 · ${escapeHtml(h.asOf)}</span>
          </span>
        </a>`;
      })
      .join("");
    return `
      <section class="hot-section">
        <h2 class="section-title">🔥 热度榜</h2>
        <div class="hot-list">${rows}</div>
        <p class="hot-note">播放数为公开快照值（来源见各曲数据）；无可靠数字的歌曲不参与排名。</p>
      </section>`;
  },

  /** 系列区块卡片（首页区块 3）——复用下方 seriesCard 组件 */
  seriesCards() {
    return Store.getAllSeries().map(seriesCard).join("");
  },

  /** 加载中状态：骨架屏（本地数据同步加载，此态仅短暂展示） */
  homeSkeleton() {
    const bar = (w) => `<span class="sk-bar" style="width:${w}%"></span>`;
    const skCard = `
      <div class="sk-card">
        <div class="sk-row">${bar(45)}${bar(20)}</div>
        ${bar(85)}${bar(60)}
      </div>`;
    return `
      <div class="home-skeleton" aria-busy="true" aria-label="加载中">
        <div class="sk-hot">${skCard}</div>
        ${skCard}${skCard}
      </div>`;
  },

  /** 错误状态：数据层异常/为空时的兜底面板（不白屏，可重试） */
  homeError() {
    return `
      <div class="error-state" role="alert">
        <p class="error-emoji">🌧️</p>
        <p class="error-text">数据加载失败了——雨太大，把数据冲走了。</p>
        <p class="error-hint">点击下面的按钮重试；若反复失败，请到仓库提交 issue 告诉站长。</p>
        <button class="btn" type="button" onclick="route()">重试</button>
      </div>`;
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
          <p class="song-meta">${escapeHtml(song.singer)} · ${escapeHtml(song.author)} · <span class="meta-date">${escapeHtml(song.date)}</span></p>
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

  /** 关于页：项目介绍 + 数据来源与纠错机制说明（框架 B 新增） */
  aboutPage() {
    const seriesCount = Store.getAllSeries().length;
    const songCount = Store.getAllSongs().length;
    return `
      <main class="home-page about-page">
        <header class="home-header">
          <h1 class="home-title">关于本站</h1>
          <p class="home-sub">把中V歌曲蕴含的故事，做成一页页看得见的漫画。</p>
        </header>
        <section class="about-block reveal">
          <h2 class="section-title">🎵 这是什么</h2>
          <p>「中V歌曲故事」把中文 VOCALOID 歌曲背后的故事，改编成漫画分镜式的可视化页面——每首歌一页漫剧，逐格读完一个故事。目前收录 ${songCount} 首歌曲、${seriesCount} 个系列。</p>
          <p>纯静态网站：无后端、无登录、无任何需要密钥的服务，部署在 GitHub Pages 上。</p>
        </section>
        <section class="about-block reveal">
          <h2 class="section-title">📖 内容是怎么来的</h2>
          <p>歌曲数据（曲名、分镜旁白、里程碑、简介）由 AI 依据公开资料（B站投稿信息、萌娘百科等）<strong>起草代录、免审入库</strong>；每条数据在源码中标注来源链接与录入日期。资料之间有冲突时，以 B站投稿信息为准。</p>
          <p><strong>纠错机制</strong>：任何人任何时候发现资料错误（数字、日期、剧情描述等），向站长指出即立即修正，纠错不设时限、不设次数。</p>
          <p>「💙 我的故事」栏目是站长的私人感想，AI 不代写，由站长亲自撰写补入。</p>
        </section>
        <section class="about-block reveal">
          <h2 class="section-title">🎨 关于配图</h2>
          <p>画格配图均为 AI 原创生成，不使用任何官方曲绘或 PV 截图；未配图的画格以色块排版呈现，故事依然完整可读。</p>
        </section>
        <section class="about-block reveal">
          <h2 class="section-title">🖥️ 技术构成</h2>
          <p>纯 HTML / CSS / JavaScript，hash 路由无刷新切换页面；数据只有一个文件（data.js），增删歌曲不需要改动页面代码。</p>
          <p>源码仓库：<a class="about-link" href="https://github.com/XingHo-VibeCoding/8102coming-soon" target="_blank" rel="noopener noreferrer">XingHo-VibeCoding/8102coming-soon</a></p>
        </section>
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

/**
 * 【可复用组件】系列卡片（余力加练 · Day 8）
 * 输入：Store.getAllSeries() 的一条元素（须含 id/name/intro/songCount）
 * 输出：整卡可点的 HTML 字符串，跳转对应系列详情页
 * 使用处：首页系列区块（区块3）；新页面陈列系列时同样 map(seriesCard) 即可。
 */
function seriesCard(s) {
  return `
    <a class="series-card reveal" href="#/series/${escapeHtml(s.id)}">
      <div class="series-head">
        <h3 class="series-name">📚 ${escapeHtml(s.name)}</h3>
        <span class="badge">${s.songCount} 首</span>
      </div>
      <p class="series-intro">${escapeHtml(s.intro)}</p>
    </a>`;
}

/**
 * 【可复用组件】歌曲卡片（余力加练 · Day 8）
 * 输入：一条歌曲数据对象（data.js 的 SONGS 元素）
 * 输出：整卡可点的 HTML 字符串；系列标签自带反向跳转（B4）
 * 使用处：首页全部歌曲（区块2）、系列详情页、搜索结果列表
 * 新页面想陈列歌曲时，直接 songs.map(songCard).join("") 即可。
 */
function songCard(song) {
  const series = song.seriesId
    ? SERIES.find((s) => s.id === song.seriesId)
    : null;
  const seriesTag = series
    ? `<span class="card-series" role="link" tabindex="0" data-series-href="#/series/${escapeHtml(series.id)}">📚 ${escapeHtml(series.name)}</span>`
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
      <p class="card-meta">${escapeHtml(song.singer)} · ${escapeHtml(song.author)} · <span class="meta-date">${escapeHtml(song.date)}</span></p>
      <p class="card-intro">${escapeHtml(song.intro)}</p>
      ${seriesTag}
    </a>`;
}
