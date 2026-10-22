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
        ${/* 区块顺序（同伴反馈后调整）：系列是比单曲更上位的层级，提到最前面——
            一进首页首屏就能看到「这个站是按系列组织的」，不必再滑到页面最底部。 */ ""}
        <section class="series-section reveal">
          <h2 class="section-title">📚 系列曲</h2>
          <div class="series-list">${Render.seriesCards()}</div>
        </section>
        ${Render.hotList(Store.getHotSongs(3))}
        <section class="all-songs-section">
          <h2 class="section-title">🎵 全部歌曲</h2>
          ${Render.singerFilterBar("")}
          <p class="filter-status" id="filter-status" role="status">${Render.filterStatusText("", "", Store.getAllSongs().length)}</p>
          <div class="card-list" id="card-list">${Render.songGroups(Store.getAllSongs(), { collapsed: true })}</div>
        </section>`;
    }

    return `
      <main class="home-page" data-view-state="${escapeHtml(status)}">
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
        ${/* Day 20：云端接口失败时页面会静默回落本地 data.js，界面上一模一样——
             这正是「以为接了真库、其实还在用备份」的坑。所以这里必须显式喊一声。 */ ""}
        ${status === "success" && Store.getDataSource() === "local"
          ? `<p class="data-warn" role="status">
               ⚠️ 云端接口暂时不可用，当前展示的是<strong>站内本地备份数据</strong>，可能不是最新的库数据。
               <a class="data-warn-link" href="#/status">查看数据检查台</a>
             </p>`
          : ""}
        <div id="home-content">${content}</div>
        <footer class="page-footer">🎵 中V歌曲故事 · 由 vibe coding 学习营 · 世末歌者工作室出品</footer>
      </main>
    `;
  },

  /**
   * 面包屑导航（Day 13）：多级页面里让读者随时知道「我在哪、从哪来、怎么回去」。
   * 输入：`[{ label, href }]`，末项代表当前页（不给 href，标 aria-current）。
   * 中间的分隔符只是装饰，标 aria-hidden，读屏器不会念出「›」。
   * 无障外说明：外层是真 <nav aria-label="面包屑">，键盘可 Tab 逐个走。
   */
  breadcrumb(items) {
    const parts = items
      .map((it, i) => {
        const sep =
          i > 0 ? `<span class="crumb-sep" aria-hidden="true">›</span>` : "";
        const isLast = i === items.length - 1;
        const node =
          isLast || !it.href
            ? `<span class="crumb-current" aria-current="page">${escapeHtml(it.label)}</span>`
            : `<a class="crumb" href="${escapeHtml(it.href)}">${escapeHtml(it.label)}</a>`;
        return sep + node;
      })
      .join("");
    return `<nav class="breadcrumb" aria-label="面包屑">${parts}</nav>`;
  },

  /** 区块 1 🔥 站长推荐：Top N，展示里程碑/站长推荐语，不展示播放数字（B 方案） */
  hotList(songs) {
    if (!songs.length) return ""; // 无可靠数据时不渲染榜单，不编造
    const medals = ["🥇", "🥈", "🥉"];
    const rows = songs
      .map((song, i) => {
        const h = song.heat || {};
        const milestone =
          h.milestone || (song.badges && song.badges[0]) || "站内热门";
        return `
        <a class="hot-row reveal" href="#/song/${escapeHtml(song.id)}">
          <span class="hot-rank">${medals[i] || i + 1}</span>
          <span class="hot-info">
            <span class="hot-title">${escapeHtml(song.title)}</span>
            <span class="hot-sub">${escapeHtml(song.singer)}</span>
          </span>
          <span class="hot-plays">
            <span class="hot-milestone">${escapeHtml(milestone)}</span>
          </span>
        </a>`;
      })
      .join("");
    return `
      <section class="hot-section">
        <h2 class="section-title">🔥 站长推荐</h2>
        <div class="hot-list">${rows}</div>
        <p class="hot-note">以下为站长主观推荐，按站内影响力排序，<strong class="hot-note-em">不代表实时播放数据</strong>；想看最新播放量请点进 B 站原曲页。</p>
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

  /**
   * 页面级状态块 —— 加载中骨架（Day 13 抽公用）。
   * 卡片形状与真实歌曲卡接近，避免「加载完布局跳一下」。n = 骨架张数。
   */
  skeletonCards(n) {
    const bar = (w) => `<span class="sk-bar" style="width:${w}%"></span>`;
    const skCard = `
      <div class="sk-card">
        <div class="sk-row">${bar(42)}${bar(18)}</div>
        ${bar(88)}${bar(60)}
      </div>`;
    const count = Math.max(1, n || 3);
    return `
      <div class="home-skeleton" aria-busy="true" aria-label="加载中">
        ${skCard.repeat(count)}
      </div>`;
  },

  /**
   * 页面级「错误」面板（Day 13 抽公用）：系列页、歌曲页共用首页同款长相。
   * role="alert" 让读屏器立刻播报；重试按钮走 retryRoute()——它会先摘掉网址里的
   * 演示参数（?state=error）再重试，所以「重试」是真能成功的，不是摆设。
   */
  stateErrorPanel(text, hint) {
    return `
      <div class="error-state" role="alert">
        <p class="error-emoji">🌧️</p>
        <p class="error-text">${escapeHtml(text)}</p>
        <p class="error-hint">${escapeHtml(hint)}</p>
        <button class="btn" type="button" onclick="retryRoute()">重试</button>
      </div>`;
  },

  /** 系列页「空」状态（Day 13）：该系列已被收录，但旗下暂无可用歌曲 */
  seriesEmpty(name) {
    return `
      <div class="empty-state">
        <p class="empty-text">「${escapeHtml(name)}」目前还没有可看的歌曲</p>
        <p class="empty-hint">该系列的歌曲还在整理中，先回首页看看别的吧。</p>
        <p><a class="btn" href="#/">← 返回首页</a></p>
      </div>`;
  },

  /**
   * 系列详情页：世界观简介 + 该系列全部歌曲（PRD F2 / B3）。
   * 若系列定义了 chapters（如妄想症的序曲/坠落之章/上升之章），按章节分组展示。
   * Day 13 起支持页面级四态：loading（骨架屏）/ success（正常）/
   * empty（旗下无歌曲）/ error（数据取不回来时的兜底面板）。
   */
  seriesPage(data, status) {
    if (!data) return Render.notFoundPage();
    const state = status || "success";

    // 面包屑：首页 › 系列名（末项为当前页）
    const crumbs = [
      { label: "首页", href: "#/" },
      { label: data.name },
    ];

    const byId = {};
    data.songs.forEach((s) => (byId[s.id] = s));

    let body;
    if (state === "loading") {
      // 外壳（面包屑 + 标题）先用真数据立住，只有内容区是骨架，减少「加载完跳一下」
      body = Render.skeletonCards(3);
    } else if (state === "error") {
      body = Render.stateErrorPanel(
        "这个系列暂时打不开——数据没能取回来。",
        "点下面的按钮重试；若反复失败，请到仓库提交 issue 告诉站长。"
      );
    } else if (state === "empty" || data.songCount === 0) {
      body = Render.seriesEmpty(data.name);
    } else if (data.chapters) {
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
      <main class="home-page" data-view-state="${escapeHtml(state)}">
        ${Render.breadcrumb(crumbs)}
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
   * 虚拟歌手筛选按钮组（Day 12）：一颗「全部」+ 每位歌手一颗。
   * 用真 <button>（不是 span[role=button]），Tab 可达、回车/空格原生可触发，
   * 也自动被 css/style.css 的 button:focus-visible 焦点圈覆盖。
   * aria-pressed 表达「当前选中」，读屏器能播报。
   */
  singerFilterBar(activeSinger) {
    const chip = (value, label, on, count) => `
      <button class="singer-chip" type="button" data-singer="${escapeHtml(value)}" aria-pressed="${on}">
        ${escapeHtml(label)} <span class="chip-count">${count}</span>
      </button>`;
    return `
      <div class="singer-filter" id="singer-filter" role="group" aria-label="按虚拟歌手筛选">
        ${chip("", "全部", !activeSinger, Store.getAllSongs().length)}
        ${Store.getSingers()
          .map((s) => chip(s.name, s.name, activeSinger === s.name, s.count))
          .join("")}
      </div>`;
  },

  /**
   * 当前筛选条件与结果条数（Day 12）：让用户一眼看到「筛了什么、剩几首」。
   * 纯文本（不给标签），便于原地更新而不重建节点 —— 更新时不会打断读屏焦点。
   */
  filterStatusText(singer, keyword, count) {
    const parts = [];
    if (singer) parts.push(`歌手：${singer}`);
    const kw = String(keyword || "").trim();
    if (kw) parts.push(`关键词：${kw}`);
    return `${parts.length ? parts.join(" · ") : "未筛选"} · 共 ${count} 首`;
  },

  /**
   * 按系列分组陈列歌曲（同伴「愉终」反馈：首页分不清系列、要滑 8 屏才看到系列）。
   * 组标题本身就是进系列页的入口（真 <a>，可 Tab、可点），标题右侧是该组首数 + 折叠开关。
   * 组内按投稿日期升序（故事脉络顺序）；筛选后某组为空则整组隐藏；无系列的歌归入「其他单曲」。
   * opts.collapsed=true 时各组默认收起（Day 17：首页过长 → 默认折叠到 ~3 屏，点开关再展开），
   * 组标题的系列链接始终可点进系列页，不受折叠影响。
   */
  songGroups(songs, opts = {}) {
    const collapsed = opts.collapsed === true;
    const byDate = (a, b) => String(a.date || "").localeCompare(String(b.date || ""));
    const groups = [];
    SERIES.forEach((s) => {
      const inSeries = songs.filter((song) => song.seriesId === s.id).sort(byDate);
      if (inSeries.length) {
        groups.push({ name: s.name, href: `#/series/${s.id}`, songs: inSeries });
      }
    });
    const rest = songs.filter((song) => !song.seriesId).sort(byDate);
    if (rest.length) groups.push({ name: "其他单曲", href: null, songs: rest });

    return groups
      .map(
        (g, i) => `
      <section class="group-block${collapsed ? " is-collapsed" : ""}" data-group-index="${i}" data-group-name="${escapeHtml(g.name)}">
        <h3 class="group-title">
          ${
            g.href
              ? `<a class="group-link" href="${escapeHtml(g.href)}">📚 ${escapeHtml(g.name)}</a>`
              : `<span class="group-link group-link-static">🎵 ${escapeHtml(g.name)}</span>`
          }
          <span class="group-meta">
            <span class="group-count">${g.songs.length} 首</span>
            <button class="group-toggle" type="button" aria-expanded="${!collapsed}" aria-label="${collapsed ? "展开" : "收起"}「${escapeHtml(g.name)}」分组（共 ${g.songs.length} 首）">
              <span class="group-toggle-icon" aria-hidden="true"></span>
            </button>
          </span>
        </h3>
        <div class="card-list">${g.songs.map(songCard).join("")}</div>
      </section>`
      )
      .join("");
  },

  /**
   * 搜索结果列表（F4）：只重绘 #card-list，不整页刷新，输入框不丢焦点。
   * 无匹配时显示空状态（PRD D4：不清屏、不报错），并写明当前筛选条件（Day 12）。
   */
  filteredList(keyword, singer) {
    const kw = String(keyword || "").trim();
    const sg = String(singer || "").trim();
    const songs = Store.filterSongs(sg, kw);
    if (songs.length === 0) {
      const cond = [sg && `歌手「${sg}」`, kw && `关键词「${kw}」`]
        .filter(Boolean)
        .join(" + ");
      return `
        <div class="empty-state">
          <p class="empty-text">没有找到相关歌曲${cond ? `（当前条件：${escapeHtml(cond)}）` : ""}</p>
          <p class="empty-hint">换个歌手，或点下面的按钮清空条件。</p>
          <button class="btn" id="clear-filters" type="button">清空筛选条件</button>
        </div>
      `;
    }
    return Render.songGroups(songs);
  },

  /**
   * 漫剧页：单曲故事页（PRD F3）。
   * Day 13 起支持两态：loading（骨架屏）/ success（正常）。
   * 详情页没有「空」态（单曲必有内容）；「找不到这首歌」走 notFoundPage，属另一回事。
   */
  songPage(song, status) {
    const state = status || "success";

    // 面包屑：首页 › 所属系列（若有）› 歌名；末项为当前页，是「多级页面」的回溯路径
    const crumbs = [{ label: "首页", href: "#/" }];
    const seriesOfSong = song.seriesId
      ? SERIES.find((s) => s.id === song.seriesId)
      : null;
    if (seriesOfSong) {
      crumbs.push({ label: seriesOfSong.name, href: `#/series/${seriesOfSong.id}` });
    }
    crumbs.push({ label: song.title });

    if (state === "loading" || state === "error") {
      const inner =
        state === "loading"
          ? Render.skeletonCards(3)
          : Render.stateErrorPanel(
              "这一页暂时打不开——曲目数据没能取回来。",
              "点下面的按钮重试；若反复失败，请到仓库提交 issue 告诉站长。"
            );
      return `
        <main class="song-page" data-view-state="${escapeHtml(state)}">
          ${Render.breadcrumb(crumbs)}
          <header class="song-header">
            <h1 class="song-title">${escapeHtml(song.title)}</h1>
            <p class="song-meta">${escapeHtml(song.singer)} · ${escapeHtml(song.author)}</p>
          </header>
          ${inner}
          <footer class="page-footer">🎵 中V歌曲故事 · 由 vibe coding 学习营 · 世末歌者工作室出品</footer>
        </main>
      `;
    }

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
      <main class="song-page" data-view-state="${escapeHtml(state)}">
        ${Render.breadcrumb(crumbs)}
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
          ${favButton(song.id, "page")}
          ${
            song.bilibili
              ? `<a class="btn btn-listen" href="${escapeHtml(song.bilibili)}" target="_blank" rel="noopener noreferrer">▶ 去B站听这首</a>`
              : `<span class="listen-none">🎧 ${escapeHtml(song.noBilibili || "本曲暂无B站投稿页")}</span>`
          }
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
      <main class="home-page about-page" data-view-state="success">
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

  /**
   * 云端数据检查台（Day 20）：把「数据是不是真的来自云端」变成一眼能看懂的一页。
   * 输入 `model`：
   *   {} 或 null            → loading 骨架
   *   { apiOk, apiCount, passedCount, ms, at, error, source, probeTitle }
   * 这一页不打广告、不放导航入口，只做验收取证（课程 Day 20 的「检查台」）。
   */
  statusPage(model, status) {
    const state = status || (model && model.apiOk ? "success" : "error");
    const apiUrl = `${API_BASE.url}/rest/v1/rpc/get_songs`;

    if (state === "loading") {
      return `
        <main class="home-page status-page" data-view-state="loading">
          <header class="home-header">
            <h1 class="home-title">云端数据检查台</h1>
            <p class="home-sub">正在真实请求云端接口，请稍候…</p>
          </header>
          <div class="status-skeleton" aria-hidden="true">
            <div class="sk-card"></div>
            <div class="sk-card"></div>
            <div class="sk-card"></div>
          </div>
        </main>
      `;
    }

    const m = model || {};
    const ok = !!m.apiOk;
    const removed = Math.max(0, (m.apiCount || 0) - (m.passedCount || 0));
    const sourceText =
      m.source === "cloud"
        ? "云端数据库（真实数据）"
        : m.source === "local"
        ? "本地 data.js（兜底数据，不是最新的库数据）"
        : "尚未请求";

    const badge = ok
      ? `<span class="status-badge status-badge--ok">● 接口正常</span>`
      : `<span class="status-badge status-badge--bad">● 接口异常</span>`;

    const errorBlock = ok
      ? ""
      : `<p class="status-error" role="alert">失败原因：${escapeHtml(m.error || "未知错误")}</p>
         <p><button type="button" class="btn" data-status-retry>重新检测</button></p>`;

    return `
      <main class="home-page status-page" data-view-state="${ok ? "success" : "error"}">
        <header class="home-header">
          <h1 class="home-title">云端数据检查台</h1>
          <p class="home-sub">这一页只做一件事：让你亲眼确认页面上的数据真的来自云端数据库。</p>
        </header>

        <section class="about-block reveal">
          <h2 class="section-title">① 链路状态</h2>
          <p class="status-badge-row">${badge}</p>
          <dl class="status-list">
            <div class="status-row">
              <dt>接口地址</dt>
              <dd class="status-url">${escapeHtml(apiUrl)}</dd>
            </div>
            <div class="status-row">
              <dt>返回结果</dt>
              <dd>${ok ? `ok: true · 取到 ${m.apiCount} 条` : "没有拿到有效数据"}</dd>
            </div>
            <div class="status-row">
              <dt>响应耗时</dt>
              <dd>${escapeHtml(String(m.ms))} ms</dd>
            </div>
            <div class="status-row">
              <dt>抓取时间</dt>
              <dd>${escapeHtml(m.at || "—")}<span class="status-hint">（本次请求完成的真实时刻）</span></dd>
            </div>
          </dl>
          ${errorBlock}
        </section>

        <section class="about-block reveal">
          <h2 class="section-title">② 数据核对</h2>
          <dl class="status-list">
            <div class="status-row">
              <dt>接口返回</dt>
              <dd>${ok ? `${m.apiCount} 条` : "—"}</dd>
            </div>
            <div class="status-row">
              <dt>通过字段校验</dt>
              <dd>${ok ? `${m.passedCount} 条` : "—"}</dd>
            </div>
            <div class="status-row">
              <dt>被静默剔除</dt>
              <dd class="${removed > 0 ? "status-num--bad" : ""}">${ok ? `${removed} 条` : "—"}</dd>
            </div>
            <div class="status-row">
              <dt>首页数据来源</dt>
              <dd>${escapeHtml(sourceText)}</dd>
            </div>
          </dl>
          <p class="status-note">
            被剔除 = 缺必填字段的歌。它不会报错，只会从列表里悄悄消失，所以单独列一项盯着：
            这个数字不是 0，就得去查是哪首歌缺了字段。
          </p>
        </section>

        <section class="about-block reveal">
          <h2 class="section-title">③ 写入测试</h2>
          <p class="status-note">
            把《${escapeHtml(m.probeTitle || "第一首歌")}》写一条收藏进数据库，再立刻读回来。
            读得回 = 写真的落库了，不是只在前端装样子。
          </p>
          <p><button type="button" class="btn status-write" data-status-write data-song-id="${escapeHtml(m.probeId || "")}">写入一条测试收藏</button></p>
          <p class="status-result" id="status-write-result" role="status" aria-live="polite"></p>
        </section>

        <section class="about-block reveal">
          <h2 class="section-title">④ 改备注 / 删收藏（Day 22）</h2>
          <p class="status-note">
            对上面写的那条测试收藏做「改」和「删」：改备注后再读一次明细，看得见新备注 = 真改了；
            删掉后再读一次，这条消失 = 真删了。改/删不存在的 id，接口会用中文明确说「不存在」。
          </p>
          <p class="status-form">
            <label>备注（留空 = 清空）：<input type="text" id="status-note-input" maxlength="200" placeholder="如：测试-改" class="status-input"></label>
            <button type="button" class="btn" data-status-note data-song-id="${escapeHtml(m.probeId || "")}">改这条的备注</button>
            <button type="button" class="btn status-btn--danger" data-status-delete data-song-id="${escapeHtml(m.probeId || "")}">删掉这条收藏</button>
          </p>
          <p class="status-result" id="status-note-result" role="status" aria-live="polite"></p>
        </section>

        <section class="about-block reveal">
          <h2 class="section-title">⑤ 你也可以自己验</h2>
          <ol class="status-steps">
            <li>按 <code>F12</code> → <code>Network</code> 面板 → 刷新本页，找到 <code>rpc/get_songs</code> 那条请求：地址必须是 <code>https://…supabase.co</code>。出现 <code>localhost</code> 或 <code>127.0.0.1</code> 就是没切干净。</li>
            <li>去数据库控制台改一条歌名 → 回首页刷新：名字跟着变 = 页面读的是真库；不变 = 还在用本地备份。</li>
            <li>点上面那个按钮写入一次 → 刷新本页再点一次，提示「已经在收藏里了」= 上一次确实写进了库。</li>
          </ol>
        </section>

        <footer class="page-footer">🎵 中V歌曲故事 · 位于第 3 周验收用的检查页 · <a class="about-link" href="#/">回首页</a></footer>
      </main>
    `;
  },

  /** 路由兜底：找不到歌曲/页面时（TECH_DESIGN §6） */
  notFoundPage() {
    const quickLinks = Store.getAllSongs()
      .map((s) => `<a class="btn" href="#/song/${escapeHtml(s.id)}">${escapeHtml(s.title)}</a>`)
      .join(" ");
    return `
      <main class="song-page" data-view-state="notfound">
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
 * 【可复用组件】收藏按钮（Day 11）
 * 输入：歌曲 id + 样式变体（card = 卡片上的小胶囊 / page = 歌曲页上的按钮）
 * 输出：带当前收藏状态的按钮 HTML。
 * 卡片本身是 <a>，按 HTML 规矩链接里不能再放 <button>，所以卡片用 span[role=button]；
 * 歌曲页是独立按钮，直接用真 <button>。两者都靠 data-fav-id 走同一套事件委托。
 */
function favButton(songId, variant) {
  const on = Store.isFavorite(songId);
  const isCard = variant === "card";
  const cls = isCard ? "fav-btn fav-btn-card" : "fav-btn btn";
  const tagAttrs = isCard ? ' role="button" tabindex="0"' : ' type="button"';
  // Day 22：DELETE 已上线，已收藏态提示「再点一次可取消」（app.js 里会先二次确认）
  return `<${isCard ? "span" : "button"} class="${cls}"${tagAttrs} data-fav-id="${escapeHtml(songId)}" aria-pressed="${on}" aria-busy="false" title="${on ? "已收藏，再点一次可取消" : "点击加入收藏"}">${on ? "♥ 已收藏" : "♡ 收藏"}</${isCard ? "span" : "button"}>`;
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
  // 封面：约定路径 assets/covers/<歌曲id>.jpg（B站投稿封面，构建期抓取入库）。
  // 没有 B站链接/封面文件的歌，img 加载失败自动移除，露出色块+歌名首字兜底。
  const media = `
    <span class="card-media" data-initial="${escapeHtml(song.title.slice(0, 1))}" aria-hidden="true">
      <img class="card-cover" src="assets/covers/${escapeHtml(song.id)}.jpg" alt="" loading="lazy" onerror="this.remove()">
    </span>`;
  return `
    <a class="song-card reveal" href="#/song/${escapeHtml(song.id)}">
      ${media}
      <div class="card-body">
      <div class="card-head">
        <h2 class="card-title">${escapeHtml(song.title)}</h2>
        <div class="card-badges">${badges}</div>
      </div>
      <p class="card-meta">${escapeHtml(song.singer)} · ${escapeHtml(song.author)} · <span class="meta-date">${escapeHtml(song.date)}</span></p>
      <p class="card-intro">${escapeHtml(song.intro)}</p>
      ${seriesTag}
      ${favButton(song.id, "card")}
      </div>
    </a>`;
}
