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

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
