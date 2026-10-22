// ============================================================
// app.js —— 路由与交互（依据 TECH_DESIGN.md §2）
// hash 路由：
//   #/              → 首页卡片列表 + 系列区块（PRD F1 + F2）
//   #/song/{id}     → 漫剧页（PRD F3）
//   #/series/{id}   → 系列详情页（PRD F2）
//   #/about         → 关于页（框架 B 新增）
// ============================================================

function route() {
  const app = document.getElementById("app");
  // TECH_DESIGN §6 原则：任何单点失败不允许整页崩溃。
  // 渲染抛异常（如某条数据结构录错）时降级到兜底页，并 console.error 留痕。
  try {
    renderRoute(app);
  } catch (err) {
    console.error("[app] 页面渲染出错，已降级到兜底页：", err);
    app.innerHTML = Render.notFoundPage();
  }
  setActiveNav();
  setupRevealAnimation();
}

/**
 * 状态演示开关（Day 13）：网址里加 ?state=loading / error / empty，
 * 可把当前页面「按住」停在指定状态，方便肉眼检查与截图。
 * 位置两处都认（前者推荐，地址栏更直观）：
 *   http://localhost:8000/?state=error#/series/wangxiang
 *   http://localhost:8000/#/series/wangxiang?state=error
 * 不带这个参数 = 正常状态，日常访问不受影响。
 */
function getStateOverride() {
  const fromSearch = new URLSearchParams(location.search).get("state");
  if (fromSearch) return fromSearch;
  const raw = location.hash || "";
  const q = raw.indexOf("?");
  if (q === -1) return "";
  return new URLSearchParams(raw.slice(q + 1)).get("state") || "";
}

/** 「重试」按钮（Day 13）：先摘掉网址里的演示参数，再重跑当前路由 */
function retryRoute() {
  const url = new URL(location.href);
  url.searchParams.delete("state");
  const cleanHash = url.hash.split("?")[0];
  history.replaceState(null, "", url.pathname + url.search + cleanHash);
  route(); // 参数已摘干净，这一步会真正把数据渲染出来（不再回到演示状态）
}

/** 导航栏当前页高亮（框架 B）：song/series 归入「首页」高亮 */
function setActiveNav() {
  const hash = location.hash || "#/";
  // Day 20：检查台不进导航，也不该让「首页」被点亮——它不属于首页
  const current = hash.startsWith("#/about")
    ? "about"
    : hash.startsWith("#/status")
    ? ""
    : "home";
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === current);
  });
}

// 系列页的「加载中」定时器句柄：连续快速切换路由时用同一个，避免旧定时器把新页面覆盖掉
let seriesLoadTimer = null;

function renderRoute(app) {
  // 先剥掉 hash 里的演示参数（如 #/series/wangxiang?state=error），否则会当成路由 id 的一部分
  const hash = (location.hash || "#/").split("?")[0];
  const forced = getStateOverride();

  const songMatch = hash.match(/^#\/song\/(.+)$/);
  const seriesMatch = hash.match(/^#\/series\/(.+)$/);
  if (songMatch) {
    const song = Store.getSongById(songMatch[1]);
    if (!song) {
      app.innerHTML = Render.notFoundPage(); // 错 hash 兜底（TECH_DESIGN §6）
    } else if (forced === "loading" || forced === "error") {
      app.innerHTML = Render.songPage(song, forced); // 演示开关：停在指定状态不自动切
    } else {
      renderSong(app, song); // 正常访问：先骨架，再出内容
    }
  } else if (seriesMatch) {
    const series = Store.getSeriesById(seriesMatch[1]);
    if (!series) {
      app.innerHTML = Render.notFoundPage(); // 系列 id 根本不存在
    } else if (forced) {
      app.innerHTML = Render.seriesPage(series, forced); // 演示开关：停在指定状态不自动切
    } else {
      renderSeries(app, series); // 正常访问：先骨架，再出内容
    }
  } else if (hash === "#/status") {
    renderStatus(app);
  } else if (hash === "#/about") {
    app.innerHTML = Render.aboutPage();
  } else if (hash === "#/" || hash === "#" || hash === "") {
    renderHome(app);
  } else {
    app.innerHTML = Render.notFoundPage();
  }

  setupRevealAnimation();
}

/**
 * 云端数据检查台（Day 20）：每次进入都**真打一次接口**，不复用 Store 的缓存。
 * 检查台的意义是「现在这一刻通不通、数据是不是真的」，看缓存等于自己骗自己。
 * 返回的数据同时过一遍业务层的 validateSong，与页面列表口径保持一致。
 */
function renderStatus(app) {
  app.innerHTML = Render.statusPage(null, "loading");

  const t0 = performance.now();
  // 两件事一起等：①检查台自己真打一次接口（要耗时与条数）
  //              ②首页那次 Store.loadSongs() 落地（否则「首页数据来源」会误报「尚未请求」）
  Promise.all([Api.getSongs(), Store.loadSongs()])
    .then(([j]) => {
      const ms = Math.round(performance.now() - t0);
      const list = j && Array.isArray(j.data) ? j.data : [];
      const apiOk = !!(j && j.ok === true && list.length > 0);
      const passedCount = list.filter(validateSong).length;
      const first = list[0] || (typeof SONGS !== "undefined" ? SONGS[0] : null);

      app.innerHTML = Render.statusPage(
        {
          apiOk,
          apiCount: list.length,
          passedCount,
          ms,
          at: nowText(),
          error: apiOk ? "" : (j && j.error) || "接口没有返回有效数据",
          source: Store.getDataSource(),
          probeTitle: first ? first.title : "",
          probeId: first ? first.id : "",
        },
        apiOk ? "success" : "error"
      );
      setActiveNav();
      setupRevealAnimation();
    })
    .catch((err) => {
      // Api.getSongs 内部已兜网络异常，这里只兜「连兜底都炸了」的极端情况
      console.error("[app] 检查台检测异常：", err);
      app.innerHTML = Render.statusPage(
        { apiOk: false, apiCount: 0, passedCount: 0, ms: 0, at: nowText(), error: "检测过程出错：" + (err && err.message), source: Store.getDataSource() },
        "error"
      );
      setActiveNav();
      setupRevealAnimation();
    });
}

/**
 * 检查台的写入测试（Day 20）：写一条收藏进库，再立刻读回来。
 * 判断「真的落库」不看写入接口自己说什么，看读回列表里有没有它。
 */
async function handleStatusWrite(btn) {
  const out = document.getElementById("status-write-result");
  if (!out || btn.dataset.busy === "1") return;

  const uid = Store.getUid();
  const songId = btn.getAttribute("data-song-id") || "";
  out.className = "status-result";
  if (!uid || !songId) {
    out.className = "status-result status-result--bad";
    out.textContent = "✗ 缺少本机 uid 或没有可写的歌，写入测试跳过";
    return;
  }

  btn.dataset.busy = "1";
  btn.setAttribute("aria-busy", "true");
  btn.setAttribute("aria-disabled", "true");
  const prevLabel = btn.textContent;
  btn.textContent = "写入中…";
  out.textContent = "";

  try {
    const w = await Api.addFavorite(uid, songId);
    const r = await Api.getFavorites(uid); // 无论写入结果如何都读回一次——这是落库的证据
    const list = r && Array.isArray(r.data) ? r.data : [];
    const hit = list.indexOf(songId) !== -1;

    if (w && w.ok === true && hit) {
      out.className = "status-result status-result--ok";
      out.textContent = `✓ 写入成功：${songId} 已落库；读回 ${list.length} 条收藏，其中包含这条。`;
    } else if (w && w.ok === false && w.data && w.data.duplicate && hit) {
      out.className = "status-result status-result--ok";
      out.textContent = `✓ 这条测试收藏上次已经写过了（重复提交被正确拦下）；读回 ${list.length} 条，其中仍包含它 —— 数据一直留在库里。`;
    } else if (w && w.ok === false) {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 写入被拒：${w.error || "未知原因"}`;
    } else {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 写入返回异常；读回 ${list.length} 条，里面没有这条。`;
    }
  } catch (err) {
    console.error("[app] 检查台写入测试失败：", err);
    out.className = "status-result status-result--bad";
    out.textContent = `✗ 写入失败：${err && err.message ? err.message : "网络异常"}`;
  } finally {
    btn.dataset.busy = "0";
    btn.removeAttribute("aria-busy");
    btn.removeAttribute("aria-disabled");
    btn.textContent = prevLabel;
  }
}

/**
 * 检查台的改备注测试（Day 22）：改一条收藏的备注，再立刻读明细回来。
 * 「真改了」的判据不在改接口自己嘴里，在读回的明细里：note 字段等于刚写入的值。
 */
async function handleStatusNote(btn) {
  const out = document.getElementById("status-note-result");
  if (!out || btn.dataset.busy === "1") return;

  const uid = Store.getUid();
  const songId = btn.getAttribute("data-song-id") || "";
  const input = document.getElementById("status-note-input");
  const note = input ? input.value : "";
  out.className = "status-result";

  // 先读「改之前」的值——没有前值，就没有「前后对比」可言
  const before = await Api.getFavoriteDetail(uid);
  const beforeList = before && Array.isArray(before.data) ? before.data : [];
  const beforeRow = beforeList.find((x) => x && x.song_id === songId);

  btn.dataset.busy = "1";
  btn.setAttribute("aria-busy", "true");
  const prevLabel = btn.textContent;
  btn.textContent = "保存中…";

  try {
    const w = await Api.updateFavoriteNote(uid, songId, note);
    if (w && w.ok === false) {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 修改被拒：${w.error || "未知原因"}`;
      return;
    }
    const r = await Api.getFavoriteDetail(uid);
    const list = r && Array.isArray(r.data) ? r.data : [];
    const row = list.find((x) => x && x.song_id === songId);
    const now = row && typeof row.note === "string" ? row.note : "";
    const want = note.trim() === "" ? "" : note.trim();

    if (row && now === want) {
      out.className = "status-result status-result--ok";
      out.textContent = `✓ 备注已改：读回明细，${escapeHtml(songId)} 的 note 从「${beforeRow ? beforeRow.note || "（空）" : "（无此行）"}」变成「${now === "" ? "（空）" : now}」，与输入一致。`;
    } else if (!row) {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 读回明细里没有 ${songId} 这条收藏——先点上面「写入一条测试收藏」再试。`;
    } else {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 改完读回的 note（${now || "（空）"}）和写入的不一致，数据没有真正落库。`;
    }
  } catch (err) {
    console.error("[app] 检查台改备注失败：", err);
    out.className = "status-result status-result--bad";
    out.textContent = `✗ 修改失败：${err && err.message ? err.message : "网络异常"}`;
  } finally {
    btn.dataset.busy = "0";
    btn.removeAttribute("aria-busy");
    btn.textContent = prevLabel;
  }
}

/**
 * 检查台的删收藏测试（Day 22）：真删一条，再读列表确认它消失。
 * 删除不可逆：先 confirm 二次确认（与歌曲页取消收藏同一规则）。
 */
async function handleStatusDelete(btn) {
  const out = document.getElementById("status-note-result");
  if (!out || btn.dataset.busy === "1") return;

  // Day 24 修复：busy 标记必须在任何 await 之前设上。
  // 之前是在读列表 + confirm 之后才设，快速连点时两次点击都能通过守卫，
  // 导致 delete_favorite 被真实请求两次（第二次靠服务端 missing 兜底才没出错）。
  btn.dataset.busy = "1";

  const uid = Store.getUid();
  const songId = btn.getAttribute("data-song-id") || "";
  out.className = "status-result";

  // 删除前先读一次列表：拿到「删之前它还在」的证据
  const before = await Api.getFavorites(uid);
  const beforeList = before && Array.isArray(before.data) ? before.data : [];
  const existed = beforeList.indexOf(songId) !== -1;

  if (!existed) {
    out.className = "status-result status-result--bad";
    out.textContent = `✗ 收藏列表里本来就没有 ${songId}，先点上面「写入一条测试收藏」再试删除。`;
    delete btn.dataset.busy;
    return;
  }

  const yes = window.confirm(`确定删除收藏 ${songId} 吗？\n会从云端数据库里真正删掉，不会进回收站。`);
  if (!yes) {
    delete btn.dataset.busy;
    return;
  }

  btn.setAttribute("aria-busy", "true");
  const prevLabel = btn.textContent;
  btn.textContent = "删除中…";

  try {
    const d = await Api.deleteFavorite(uid, songId);
    if (d && d.ok === false) {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 删除被拒：${d.error || "未知原因"}`;
      return;
    }
    const r = await Api.getFavorites(uid);
    const list = r && Array.isArray(r.data) ? r.data : [];
    if (list.indexOf(songId) === -1) {
      out.className = "status-result status-result--ok";
      out.textContent = `✓ 已删除：删除前列表 ${beforeList.length} 条（含 ${songId}），删除后读回 ${list.length} 条，这条已经不在 GET 结果里。`;
      refreshFavButtons();
    } else {
      out.className = "status-result status-result--bad";
      out.textContent = `✗ 删除接口返回成功，但 GET 结果里仍有 ${songId}——没有真删，这是故障。`;
    }
  } catch (err) {
    console.error("[app] 检查台删收藏失败：", err);
    out.className = "status-result status-result--bad";
    out.textContent = `✗ 删除失败：${err && err.message ? err.message : "网络异常"}`;
  } finally {
    btn.dataset.busy = "0";
    btn.removeAttribute("aria-busy");
    btn.textContent = prevLabel;
  }
}

/**
 * 首页状态机（PRD F1 改版）：加载中 → 成功 / 错误。
 * 数据为本地同步加载，「加载中」为短暂展示（约 0.4s），
 * 让四种状态在真实站点可见：成功（默认）、空（搜索无匹配）、
 * 错误（数据层异常/为空）、加载中（首屏瞬间）。
 */
let homeLoadTimer = null;

function renderHome(app) {
  if (homeLoadTimer) clearTimeout(homeLoadTimer); // 快速连续切路由时防抖
  if (seriesLoadTimer) { clearTimeout(seriesLoadTimer); seriesLoadTimer = null; }

  // 演示开关：?state=loading / error 时「按住」在这个状态不自动切，方便肉眼检查与截图
  const forced = getStateOverride();
  if (forced === "loading" || forced === "error") {
    app.innerHTML = Render.homePage(forced);
    return;
  }

  // 1. 先渲染「加载中」骨架屏
  app.innerHTML = Render.homePage("loading");

  // 2. 数据就绪后切换到「成功」；数据层异常或为空则切「错误」
  homeLoadTimer = setTimeout(() => {
    homeLoadTimer = null;
    // Day 17：等到云端读取落地（成功或失败都 resolve），再决定渲染真实数据还是回落静态
    Store.loadSongs().then(() => {
      try {
        const songs = Store.getAllSongs();
        if (!songs.length) {
          app.innerHTML = Render.homePage("error"); // 数据为空 = 错误态，不用兜底页蒙混
          console.error("[app] 数据为空：SONGS 校验后无有效歌曲");
        } else {
          app.innerHTML = Render.homePage("success");
          setupFilters();
        }
      } catch (err) {
        console.error("[app] 数据层异常，首页进入错误态：", err);
        app.innerHTML = Render.homePage("error");
      }
      setActiveNav();
      setupRevealAnimation();
    });
  }, 400);
}

/**
 * 系列页状态机（Day 13）：加载中 → 成功 / 空。
 * 数据同样是本地同步的，「加载中」只短暂出现（约 0.4s），但它必须真实存在 ——
 * 否则这一态在站点上永远看不见，也就没法检查它长什么样。
 * 网址开关（?state=loading / error / empty）由 renderRoute 直接按住，不走这里。
 */
function renderSeries(app, series) {
  app.innerHTML = Render.seriesPage(series, "loading");
  seriesLoadTimer = setTimeout(() => {
    seriesLoadTimer = null;
    const fresh = Store.getSeriesById(series.id);
    // 系列在、但一首可用歌曲都没有 → 空状态（不假装有内容）
    const state = !fresh || fresh.songCount === 0 ? "empty" : "success";
    app.innerHTML = Render.seriesPage(fresh || series, state);
    setActiveNav();
    setupRevealAnimation();
  }, 400);
}

/** 歌曲页状态机（Day 13）：加载中 → 成功（详情页没有「空」态，「找不到这首歌」走兜底页） */
function renderSong(app, song) {
  app.innerHTML = Render.songPage(song, "loading");
  seriesLoadTimer = setTimeout(() => {
    seriesLoadTimer = null;
    const fresh = Store.getSongById(song.id);
    app.innerHTML = Render.songPage(fresh || song, "success");
    setActiveNav();
    setupRevealAnimation();
  }, 400);
}

/**
 * 首页筛选（Day 12）：虚拟歌手按钮 + 搜索关键词，两者叠加生效。
 * 不整页重绘 —— 只换 #card-list 的内容，输入框和筛选按钮的焦点都不丢。
 * 筛选条件与结果条数实时显示在 #filter-status 上，用户一眼看到「筛了什么、剩几首」。
 */
function setupFilters() {
  const input = document.getElementById("search-input");
  const list = document.getElementById("card-list");
  const bar = document.getElementById("singer-filter");
  if (!input || !list || !bar) return;

  const state = { singer: "", keyword: "" };
  let wasActive = false; // 仅从「无筛选」切到「有筛选」时滚动一次，避免每次按键都跳
  // 筛选生效时把结果区搬到搜索框正下方（#home-content 首位），清空后搬回原位（末尾）。
  // 背景：结果区原本排在系列曲/推荐区之后、离搜索框数屏远，桌面端打字看不见变化。
  const homeContent = list.closest("#home-content");
  const section = list.closest(".all-songs-section");

  // 按 state 重画列表 + 条件条（不清输入框、不重绘按钮，焦点保住）
  const apply = () => {
    const songs = Store.filterSongs(state.singer, state.keyword);
    list.innerHTML = Render.filteredList(state.keyword, state.singer);
    const status = document.getElementById("filter-status");
    if (status) {
      status.textContent = Render.filterStatusText(state.singer, state.keyword, songs.length);
    }
    setupRevealAnimation();

    const active = !!(state.keyword || state.singer);

    // 结果区随筛选状态前移/归位（输入框在 header 里，不在被搬的节点内，焦点不受影响）
    if (homeContent && section) {
      if (active && !wasActive) {
        homeContent.insertBefore(section, homeContent.firstElementChild);
      } else if (!active && wasActive) {
        homeContent.appendChild(section);
      }
    }

    // 兜底：万一搬完结果区仍不在视口内（如输入时页面停在很下方），滚一次到可见区
    if (active && !wasActive) {
      const box = document.querySelector(".search-box");
      const boxH = box ? box.getBoundingClientRect().height : 0;
      const rect = list.getBoundingClientRect();
      const visible = rect.top >= boxH && rect.bottom <= window.innerHeight;
      if (!visible) {
        const y = rect.top + window.scrollY - boxH - 12;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
    wasActive = active;
  };

  // 把按钮的选中态同步到 state（只改 aria-pressed，不重建按钮节点）
  const syncChips = () => {
    bar.querySelectorAll(".singer-chip").forEach((chip) => {
      chip.setAttribute("aria-pressed", String((chip.dataset.singer || "") === state.singer));
    });
  };

  input.addEventListener("input", () => {
    state.keyword = input.value;
    apply();
  });

  // 筛选按钮：点一次选中，再点同一位歌手即取消（回到「全部」）
  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".singer-chip");
    if (!chip) return;
    const value = chip.dataset.singer || "";
    state.singer = state.singer === value ? "" : value;
    syncChips();
    apply();
  });

  // 列表容器委托（容器随首页重建，不会累积监听）：清空按钮 + 分组折叠开关
  list.addEventListener("click", (e) => {
    // 空状态「清空筛选条件」按钮
    const clearBtn = e.target.closest("#clear-filters");
    if (clearBtn) {
      state.singer = "";
      state.keyword = "";
      input.value = "";
      syncChips();
      apply();
      input.focus();
      return;
    }
    // 分组折叠/展开开关（Day 17）：点开关只改该组的 .is-collapsed，不整页重绘
    const toggle = e.target.closest(".group-toggle");
    if (toggle) {
      const block = toggle.closest(".group-block");
      if (block) {
        const nowCollapsed = !block.classList.contains("is-collapsed");
        block.classList.toggle("is-collapsed", nowCollapsed);
        toggle.setAttribute("aria-expanded", String(!nowCollapsed));
        const name = block.dataset.groupName || "分组";
        toggle.setAttribute(
          "aria-label",
          `${nowCollapsed ? "展开" : "收起"}「${name}」分组`
        );
      }
      return;
    }
  });
}

/** 画格滚动渐显动效（PRD C3）：进入视口时加 .visible */
function setupRevealAnimation() {
  const panels = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    panels.forEach((p) => p.classList.add("visible")); // 降级：直接显示
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  panels.forEach((p) => observer.observe(p));
}

// ============================================================
// 收藏按钮（Day 11）：处理中 → 成功 / 失败 三态，再点一次即撤销
// 提示条容器由 JS 创建（不动 index.html 的结构），role=status 供读屏器播报
// ============================================================

let toastTimer = null;

/** 弹一条提示；type 为 "success"（成功）或 "error"（失败），2.6 秒后自动收起 */
function showToast(message, type) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    root.className = "toast-root";
    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    document.body.appendChild(root);
  }
  root.innerHTML = `<div class="toast toast-${
    type === "error" ? "error" : "success"
  }">${escapeHtml(message)}</div>`;
  root.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    root.classList.remove("show");
    toastTimer = null;
  }, 2600);
}

/**
 * 点收藏按钮的完整流程：禁用 + 「处理中…」→ 成功切换状态并提示 → 失败回原样并提示。
 * 处理中会置 data-busy=1，连点无效（防重复提交）。
 * Day 22：已收藏的歌再点 = 取消收藏。删除不可逆，先弹二次确认（confirm），
 * 用户点了「取消」就当什么都没发生；点了「确定」才真发 DELETE。
 */
async function handleFavorite(el) {
  const id = el.getAttribute("data-fav-id");
  if (!id || el.dataset.busy === "1") return; // 处理中：忽略连点

  // Day 22：已收藏 → 取消收藏（二次确认后真删）
  if (Store.isFavorite(id)) {
    const yes = window.confirm("确定取消收藏这首吗？\n取消后会从云端收藏里真正删掉，不会进回收站。");
    if (!yes) return; // 用户反悔：什么都不做
    await unfavoriteFlow(el, id);
    return;
  }

  const prevLabel = el.textContent;
  const prevPressed = el.getAttribute("aria-pressed") === "true";

  // ① 处理中：按钮变灰、文案改「处理中…」、不可再点
  // 刻意不用 el.disabled：浏览器会因此让聚焦中的按钮失焦，键盘用户按一下回车就被甩出按钮、
  // 看不到结果。改用 aria-disabled + data-busy 守卫，视觉与行为上依然"点不动"，但焦点留住（Day 11 加练）。
  el.dataset.busy = "1";
  el.classList.add("is-busy");
  el.setAttribute("aria-busy", "true");
  el.setAttribute("aria-disabled", "true");
  el.textContent = "处理中…";

  try {
    // ② 成功：真实写入云端数据库（Day 18 的 POST /api/favorites）
    await Store.addFavorite(id);
    el.setAttribute("aria-pressed", "true");
    el.setAttribute("title", "已收藏，再点一次可取消");
    el.textContent = "♥ 已收藏";
    showToast("已加入收藏 ♥", "success");
  } catch (err) {
    // ③ 失败：按钮回到原状态 + 失败提示（不静默吞掉错误）
    console.error("[app] 收藏失败：", err);
    el.setAttribute("aria-pressed", String(prevPressed));
    el.textContent = prevLabel;
    // 重复提交不是故障，提示文案要分开：重复说「已经收藏过」，其它显示服务端中文原因
    if (err && err.duplicate) {
      showToast("已经收藏过啦 ♥", "success");
    } else {
      showToast(err && err.message ? err.message : "收藏失败，请再试一次", "error");
    }
  } finally {
    // ④ 收尾：解除禁用，恢复可点（真按钮全程保持可聚焦，焦点不丢）
    el.dataset.busy = "0";
    el.classList.remove("is-busy");
    el.setAttribute("aria-busy", "false");
    el.removeAttribute("aria-disabled");
  }
}

/**
 * Day 22：取消收藏的完整流程（与 handleFavorite 对称的三态）。
 * 成功：按钮回到 ♡ 未收藏态；失败：回原样并提示服务端中文原因。
 */
async function unfavoriteFlow(el, id) {
  const prevLabel = el.textContent;
  const prevPressed = el.getAttribute("aria-pressed") === "true";

  el.dataset.busy = "1";
  el.classList.add("is-busy");
  el.setAttribute("aria-busy", "true");
  el.setAttribute("aria-disabled", "true");
  el.textContent = "取消中…";

  try {
    await Store.removeFavorite(id);
    el.setAttribute("aria-pressed", "false");
    el.setAttribute("title", "点击加入收藏");
    el.textContent = "♡ 收藏";
    showToast("已取消收藏", "success");
  } catch (err) {
    console.error("[app] 取消收藏失败：", err);
    el.setAttribute("aria-pressed", String(prevPressed));
    el.textContent = prevLabel;
    showToast(err && err.message ? err.message : "取消收藏失败，请再试一次", "error");
  } finally {
    el.dataset.busy = "0";
    el.classList.remove("is-busy");
    el.setAttribute("aria-busy", "false");
    el.removeAttribute("aria-disabled");
  }
}

/**
 * Day 18：云端收藏加载完成后调用——把页面上所有收藏按钮刷成真实状态。
 * 不改页面结构，只改 aria-pressed / 文案 / title，避免整页重渲染。
 */
function refreshFavButtons() {
  document.querySelectorAll("[data-fav-id]").forEach((el) => {
    const id = el.getAttribute("data-fav-id");
    const on = Store.isFavorite(id);
    el.setAttribute("aria-pressed", String(on));
    el.setAttribute("title", on ? "已收藏，再点一次可取消" : "点击加入收藏");
    el.textContent = on ? "♥ 已收藏" : "♡ 收藏";
  });
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
  Store.loadSongs(); // Day 17：首屏前就发起云端读取，首页成功态会等到它落地
  // Day 18：云端收藏到位后，把页面上所有收藏按钮的状态刷新一遍
  Store.loadFavorites().then(refreshFavButtons);
  route();

  // 卡片内「系列标签」跳转（B4 反向跳回）：用事件委托实现，
  // 避免 <a> 嵌套 <a> 的无效 HTML；点击/回车/空格均触发，并阻止外层歌曲卡链接抢跳。
  const goSeries = (el) => {
    location.hash = el.getAttribute("data-series-href");
  };
  document.addEventListener("click", (e) => {
    const tag = e.target.closest("[data-series-href]");
    if (tag) {
      e.preventDefault(); // 取消外层歌曲卡 <a> 的默认跳转
      goSeries(tag);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const tag = e.target.closest("[data-series-href]");
    if (tag) {
      e.preventDefault();
      goSeries(tag);
    }
  });

  // 收藏按钮（Day 11）：同一套委托同时管卡片上的 span[role=button] 和歌曲页的真 <button>。
  // 卡片是 <a>，所以必须 preventDefault，否则会顺带跳进歌曲页。
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav-id]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    handleFavorite(btn);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const btn = e.target.closest("[data-fav-id]");
    // 真 <button> 的 Enter/空格会自己触发 click，这里只管 span[role=button]，避免触发两次
    if (btn && btn.tagName !== "BUTTON") {
      e.preventDefault();
      handleFavorite(btn);
    }
  });

  // Day 20：检查台的两个按钮。用委托而不是 onclick，检查台重渲染后依然有效。
  document.addEventListener("click", (e) => {
    const write = e.target.closest("[data-status-write]");
    if (write) {
      e.preventDefault();
      handleStatusWrite(write);
      return;
    }
    // Day 22：检查台的「改备注 / 删收藏」
    const note = e.target.closest("[data-status-note]");
    if (note) {
      e.preventDefault();
      handleStatusNote(note);
      return;
    }
    const del = e.target.closest("[data-status-delete]");
    if (del) {
      e.preventDefault();
      handleStatusDelete(del);
      return;
    }
    const retry = e.target.closest("[data-status-retry]");
    if (retry) {
      e.preventDefault();
      renderStatus(document.getElementById("app"));
    }
  });
});
