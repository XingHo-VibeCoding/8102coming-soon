# 🎵 中V歌曲故事

把中V（中文 VOCALOID）歌曲蕴含的故事，做成一页页看得见的漫画/漫剧。

- **线上地址**：https://xingho-vibecoding.github.io/8102coming-soon/
- **当前收录**：《世末歌者》（世末歌者系列）、《一重加害》等妄想症系列 10 首
- **技术形态**：纯静态站点（HTML/CSS/JS），无后端、无登录（PRD 拍板）

## 🚀 本地运行说明

### 方式一：直接打开（最快）

双击 `index.html`，浏览器直接打开即可（地址栏为 `file:///` 开头）。

### 方式二：本地服务器（推荐，地址栏为 localhost 开头）

任选一种命令，在**本项目根目录**执行：

```bash
# Python（Windows 自带或已安装）
python -m http.server 8000

# 或 Node.js
npx serve -l 8000 .
```

然后浏览器打开：

```
http://localhost:8000/
```

> 注意：必须以项目根目录为服务目录（即 index.html 所在目录），端口号可换，地址随之改变。

## 📁 项目结构

```
世末歌者/
├── index.html          # 站点外壳：导航栏 + 页面容器 + 脚本加载
├── 404.html            # GitHub Pages 404 专属页（内联样式零依赖）
├── css/
│   └── style.css       # 全站样式：末日夜色调/画格/时间轴/搜索/响应式
├── js/
│   ├── data.js         # 数据层：歌曲/系列全量数据（每条带来源溯源）
│   ├── store.js        # 访问层：getSongById/getAllSongs/getAllSeries/
│   │                   #         getSeriesById/searchSongs + 字段校验
│   ├── render.js       # 渲染层：首页/系列页/漫剧页/关于页/兜底页
│   └── app.js          # 路由层：hash 路由 + 渐显动效 + 搜索交互
└── assets/
    └── panels/         # 画格插画（AI 原创生成，jpeg，单张 <200KB）
```

## 🧭 页面路由（hash 路由）

| 地址 | 页面 |
|---|---|
| `#/` | 首页：歌曲卡片列表 + 系列区块 + 搜索框 |
| `#/song/{id}` | 漫剧页：信息卡 + 画格 + 里程碑时间轴 + 我的故事 + B站外链 |
| `#/series/{id}` | 系列详情页：按章节分组陈列该系列歌曲 |
| `#/about` | 关于页：项目介绍与内容机制说明 |

## 📚 加一首新歌怎么做（F4 验收项）

只改 `js/data.js` 一个文件：在 `SONGS` 数组加一条歌曲记录（含 id/title/singer/author/date/badges/intro/seriesId/panels/milestones/bilibili/myStory），如属新系列再往 `SERIES` 加一条。页面、路由、搜索自动生效，无需改任何代码。

## 📜 内容规则（摘自 AGENTS.md）

- 数据录入可溯源：公开资料带来源链接与录入日期（一·六）
- 数据源冲突时，以 B站投稿信息为准（一·六第 4 条）
- 「我的故事」为站长私人感想，AI 不代写，留占位待补
- 配图为 AI 原创同人插画，不复制官方曲绘/PV 截图（PRD C6）
- 汇报必须真实准确，不缺斤少两、不胡编乱造（一·七）

## 🛠 技术文档

- `research.md`：同类产品调研 → 方向定为漫剧式可视化
- `PRD.md`：产品需求与验收清单（A1-F4）
- `TECH_DESIGN.md`：技术方案（Plan A 纯静态）与数据流
- `AGENTS.md`：项目协作规则（七章节）
