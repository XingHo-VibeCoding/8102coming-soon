---
name: shimo-frontend-design
description: 世末歌者（中V歌曲故事）站点的前端设计规则。改动本仓库任何页面结构、配色、卡片、按钮或移动端样式之前，先读本文件；改完按本文件「改后验证」逐条核对。覆盖六类：页面层级 / 颜色和字体 / 卡片与按钮 / 移动端适配 / 改前检查 / 改后验证。
---

# 世末歌者 · 前端设计规则

这份文件是本站的**前端样式规范**，写给 AI 看，也是给「现实」自己复查用的清单。
它不是协作流程（流程见 `AGENTS.md`），只管一件事：**页面长什么样、什么算合格**。

- 适用仓库：`世末歌者`（线上 https://xingho-vibecoding.github.io/8102coming-soon/）
- 样式正本：`css/style.css`（全部颜色/字号/断点都在这里，改样式只改这个文件）
- 结构正本：`TECH_DESIGN.md` §2（新文件放哪、叫什么名字）

> 一句话：**动手改页面前先过「改前检查」六条，改完用「改后验证」三条证明它是好的。**

---

## 一、页面层级（谁比谁大）

靠字号大小表达「谁更重要」，**区块标题必须大于卡片标题**，否则读者分不清层级。

| 层级 | 字号 | 例子 |
|---|---|---|
| 歌曲页主标题 | 36px | `.song-title` 歌名大标题 |
| 首页主标题 | 34px | `.home-title`「中V歌曲故事」 |
| 区块标题 | 23px | `.section-title`「猜你喜欢」等 |
| 卡片标题 | 22px | `.card-title` 卡片里的歌名 |
| 卡片正文 | 15–16px | `.card-intro` 简介 |
| 次要信息 | 13–14px | `.card-meta` 日期、`.card-series` 系列标签 |

**底线**：区块标题 ≥ 卡片标题 + 1px。当前是 23 > 22，合规。
新增任何标题级元素，先在这张表里给它找位置，不要出现两个同级标题抢视觉。

## 二、颜色和字体

**只准用变量，不准写死颜色**（写死颜色以后改主题要一处一处翻）。

```css
:root {
  --bg-1:        #1a1a2e;              /* 页面渐变起点（末日夜深蓝） */
  --bg-2:        #16213e;              /* 页面渐变终点 */
  --card-bg:     rgba(255,255,255,.06);/* 卡片底色（半透明白） */
  --card-border: rgba(255,255,255,.12);/* 卡片描边 */
  --text:        #ffffff;              /* 主文字 */
  --text-dim:    #9aa5ce;              /* 次要文字（日期/副标题） */
  --text-soft:   #c3cee3;              /* 正文（简介段落） */
  --accent:      #7aa2ff;              /* 强调色（焦点圈 / 选中态） */
  --accent-soft: rgba(122,162,255,.22);/* 选中态底色 */
  --accent-border: rgba(122,162,255,.55); /* 选中态描边 */
}
```

> 注：焦点圈那行仍是写死的 `#7aa2ff`（Day 12 前就有的代码），与上面的 `--accent` 同值但没走变量；属已知小瑕疵，待用户点头再统一。

- 字体统一 `"Microsoft YaHei", sans-serif`，不引外部字体（不增加加载依赖）。
- **对比度**：正文文字与背景对比度 **≥ 4.5:1**。次要信息不要用比 `--text-dim` 更暗的颜色。
- 颜色表达语义要一致：加粗高亮用 `--text` 白，附属信息用 `--text-dim`，正文用 `--text-soft`。
- 移动端小字有下限：任何正文不小于 **12px**，可读性优先于"排得下"。

## 三、卡片与按钮

**卡片**（`.song-card` / 歌曲条目）：
- 圆角 16px、底色 `--card-bg`、描边 1px `--card-border`、内边距约 22px 24px。
- 悬停时轻微上浮 `translateY(-3px)` + 底色变亮到 `rgba(255,255,255,.09)`，过渡 0.25s。

**可点元素必须有三种状态**（缺一即返工）：

| 状态 | 触发 | 表现 |
|---|---|---|
| hover | 鼠标悬停 | 上浮 / 底色变亮 / 文字变色 |
| active | 按下瞬间 | 有按下反馈（缩放或加深） |
| focus-visible | **键盘 Tab 聚焦** | 可见焦点圈（描边），不能只靠鼠标效果 |

- 焦点圈统一在 `css/style.css` 末尾维护，选择器已覆盖：
  `a` / `button` / `[role="button"]` / `[role="link"]` / `.search-input`。
  新增自定义可点元素时，**必须**把它加进这组选择器，否则键盘用户看不到自己停在哪。
  （用真 `<button>` 的新元素——如首页筛选按钮 `.singer-chip`——已被 `button` 覆盖，无需再加。）
- 状态切换用 `aria-disabled="true"` 而不是 `disabled`，避免处理中丢键盘焦点。
- 「选中」这类状态用 `aria-pressed="true"` 表达，不要只靠颜色区分（色盲用户看不到）。

## 四、移动端适配

两个断点：**640px** 与 **480px**（`@media (max-width: 640px)` / `(max-width: 480px)`）。

- **触控目标**：手机上所有可点元素高度 **≥ 44px**、宽度足够点中（导航 `.nav-link`、系列标签 `.card-series`、收藏按钮 `.fav-btn-card` 等）。
  - ⚠️ **已知偏差（待修）**：`.card-series` 系列标签手机端实测高约 37px，未达 44px。修它属于独立任务，需先列入当天清单再做。
- **输入框字号 ≥ 16px**：否则 iOS Safari 聚焦时会自动放大页面（`.search-input` 已设 16px）。
- **不许横向溢出**：任意宽度下 `document.documentElement.scrollWidth == window.innerWidth`。
  长英文 / 长 URL 用 `overflow-wrap: anywhere` 兜底（`.about-block p`、`.about-link` 已加）。
- **不许拆断**：日期这类整体信息用 `white-space: nowrap`（`.meta-date` 已加），避免折到第二行。
- 网格在手机上塌成单列，字号在断点里逐级下调：
  首页主标题 34 → 28（≤640）→ 22（≤480）；歌曲页主标题 36 → 30 → 24；卡片标题 22 → 19。

## 五、改前检查（动手前，逐条过）

1. 这个改动属于**今天清单里的任务**吗？（越界的不做，先问）
2. 用到的新颜色，是复用变量还是写死？（写死就不合规范）
3. 新加的标题/文字，层级填进第一节那张表了吗？对比度够 4.5:1 吗？
4. 新加的可点元素，hover / active / focus-visible 三态齐了吗？加进焦点圈选择器了吗？
5. 手机上高度 ≥ 44px、字号 ≥ 16px（输入框）吗？
6. 会不会撑出横向滚动条？长文本有 `overflow-wrap` 兜底吗？

## 六、改后验证（改完，拿证据说话）

用真机宽度渲染，不信 `--window-size` 的假宽度（headless 渲染宽度 ≠ 设定值，会误判布局）。

```bash
# 脚本放在 AI 技能库里（不随仓库提交），路径：
#   C:\Users\Administrator\.workbuddy\skills\zhongv-song-story\scripts\

# 1) 真机宽度渲染 + 取值 + 截图
node "...\scripts\probe.mjs" --url "http://127.0.0.1:8000/#/" --width 375 --height 812 \
  --out "%TEMP%\shot-375.png" \
  --eval "JSON.stringify({scrollW:document.documentElement.scrollWidth,vw:window.innerWidth})"

# 2) 合成地址栏，产出可交付截图（用户一眼认出是哪个页面）
#    注意：shot_bar.py 没有 --width 参数，地址栏高度按图宽自适应
python "...\scripts\shot_bar.py" "%TEMP%\shot-375.png" "screenshots/dayXX-after.png" "http://localhost:8000/#/"
```

**固定三件，缺一不算过：**

| 项 | 合格线 |
|---|---|
| 控制台报错 | **0 条** |
| 横向溢出 | `scrollWidth == innerWidth`（目标宽度下成立） |
| 交互状态 | 改动前后有**肉眼可见**的差异（截图或现象） |

改一个字就要拍一次，不要"改完一起看"。三种情况都要试：**有结果 / 无结果 / 清空恢复**。

---

## 附：这份 Skill 检查什么（一句话）

> **它检查「页面改完之后，还算不算一个合格的页面」——层级清楚、颜色统一、按钮三态齐全、手机上点得中、不横向溢出、控制台零报错。**

## 相关文件

- `AGENTS.md`：协作流程规则（任务边界、单步推进、提交纪律）。
- `TECH_DESIGN.md`：文件存放位置与命名规范。
- 验证脚本（放项目外，不进仓库）：`C:\Users\Administrator\.workbuddy\skills\zhongv-song-story\scripts\` 下的
  `probe.mjs`（CDP 真机渲染 / 取值 / 截图）与 `shot_bar.py`（给截图合成地址栏）。
