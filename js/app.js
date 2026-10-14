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
  const current = hash.startsWith("#/about") ? "about" : "home";
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

  // 按 state 重画列表 + 条件条（不清输入框、不重绘按钮，焦点保住）
  const apply = () => {
    const songs = Store.filterSongs(state.singer, state.keyword);
    list.innerHTML = Render.filteredList(state.keyword, state.singer);
    const status = document.getElementById("filter-status");
    if (status) {
      status.textContent = Render.filterStatusText(state.singer, state.keyword, songs.length);
    }
    setupRevealAnimation();

    // 手机端：筛选后把结果滚动到可见区，否则用户看不到列表变化、以为搜索是摆设
    // （结果在搜索框下方约 2 屏处；仅窄屏、且仅在「开始筛选」那一刻滚动一次）
    const active = !!(state.keyword || state.singer);
    if (active && !wasActive && window.innerWidth <= 600) {
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

  // 空状态的「清空筛选条件」按钮由列表容器委托（容器随首页重建，不会累积监听）
  list.addEventListener("click", (e) => {
    if (!e.target.closest("#clear-filters")) return;
    state.singer = "";
    state.keyword = "";
    input.value = "";
    syncChips();
    apply();
    input.focus();
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
 */
async function handleFavorite(el) {
  const id = el.getAttribute("data-fav-id");
  if (!id || el.dataset.busy === "1") return; // 处理中：忽略连点

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
    // ② 成功：切到新状态 + 成功提示（再点一次即撤销，走的是同一条路径）
    const nowFav = await Store.toggleFavorite(id);
    el.setAttribute("aria-pressed", String(nowFav));
    el.setAttribute("title", nowFav ? "点击取消收藏" : "点击加入收藏");
    el.textContent = nowFav ? "♥ 已收藏" : "♡ 收藏";
    showToast(nowFav ? "已加入收藏 ♥" : "已取消收藏", "success");
  } catch (err) {
    // ③ 失败：按钮回到原状态 + 失败提示（不静默吞掉错误）
    console.error("[app] 收藏失败：", err);
    el.setAttribute("aria-pressed", String(prevPressed));
    el.textContent = prevLabel;
    showToast("收藏失败，请再试一次", "error");
  } finally {
    // ④ 收尾：解除禁用，恢复可点（真按钮全程保持可聚焦，焦点不丢）
    el.dataset.busy = "0";
    el.classList.remove("is-busy");
    el.setAttribute("aria-busy", "false");
    el.removeAttribute("aria-disabled");
  }
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
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
});
