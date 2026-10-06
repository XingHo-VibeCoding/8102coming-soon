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

/** 导航栏当前页高亮（框架 B）：song/series 归入「首页」高亮 */
function setActiveNav() {
  const hash = location.hash || "#/";
  const current = hash.startsWith("#/about") ? "about" : "home";
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === current);
  });
}

function renderRoute(app) {
  const hash = location.hash || "#/";

  const songMatch = hash.match(/^#\/song\/(.+)$/);
  const seriesMatch = hash.match(/^#\/series\/(.+)$/);
  if (songMatch) {
    const song = Store.getSongById(songMatch[1]);
    app.innerHTML = song
      ? Render.songPage(song)
      : Render.notFoundPage(); // 错 hash 兜底（TECH_DESIGN §6）
  } else if (seriesMatch) {
    app.innerHTML = Render.seriesPage(Store.getSeriesById(seriesMatch[1]));
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
        setupSearch();
      }
    } catch (err) {
      console.error("[app] 数据层异常，首页进入错误态：", err);
      app.innerHTML = Render.homePage("error");
    }
    setActiveNav();
    setupRevealAnimation();
  }, 400);
}

/** 搜索框即时过滤（F4）：输入即过滤，无需回车；不整页重绘，输入框不丢焦点 */
function setupSearch() {
  const input = document.getElementById("search-input");
  const list = document.getElementById("card-list");
  if (!input || !list) return;

  input.addEventListener("input", () => {
    list.innerHTML = Render.filteredList(input.value);
    const clearBtn = document.getElementById("clear-search");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        list.innerHTML = Render.filteredList("");
        input.focus();
      });
    }
    setupRevealAnimation();
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
