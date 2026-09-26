// ============================================================
// data.js —— 唯一数据源（依据 TECH_DESIGN.md §3）
// 录入规则（AGENTS.md 一·六 / 一·七）：
//   1. 每条数据标注资料来源链接 + 录入日期
//   2. 播放量等易变数字标注「快照值」
//   3. 「myStory 我的故事」是站长私人感想，AI 不代写，留占位待补
//   4. 资料来源之间冲突时，以 B站投稿信息为准（2026-09-26 站长拍板）
// ============================================================

const SERIES = [
  {
    id: "shimo",
    name: "世末歌者系列",
    intro: "神明、歌者与凡人三人，在反复走向终结的世界里追寻回应的故事。",
    songIds: ["shimo-song"],
    // 来源：萌娘百科《世末歌者》 https://mzh.moegirl.org.cn/世末歌者 ｜ 录入 2026-09-26
  },
  {
    id: "wangxiang",
    name: "妄想症系列",
    intro: "关于妄想与记忆的连环悬念剧——每个「加害者」背后都藏着故事的根源。",
    songIds: ["yichong-jiahai"],
    // 来源：萌娘百科《一重加害》 https://moegirl.icu/一重Presecution ｜ 录入 2026-09-26
  },
];

const SONGS = [
  {
    id: "shimo-song",
    title: "世末歌者",
    singer: "乐正绫", // B站投稿版为乐正绫独唱；洛天依合唱版仅 5sing 发行，未投稿B站（B站优先规则）
    author: "COP",
    date: "2016-08-25",
    bilibili: "https://www.bilibili.com/video/BV1Qs411k7Qv",
    badges: ["神话曲", "最慢中V神话曲"],
    intro: "流浪歌手阿绫与神灵立下赌约，在重复湮灭的世界中孤独歌唱，寻找愿意共赴终结的共鸣者。",
    seriesId: "shimo",
    // —— 分镜（共 6 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5），错误随时指出随时修正
    // 来源：萌娘百科《世末歌者》 https://mzh.moegirl.org.cn/世末歌者 ｜ B站投稿页 BV1Qs411k7Qv ｜ 录入 2026-09-26
    panels: [
      { image: "assets/panels/shimo-p1.jpg", caption: "我仍然在无人问津的阴雨霉湿之地，和着雨音，唱着没有听众的歌曲。" },
      { image: "assets/panels/shimo-p2.jpg", caption: "神灵与流浪歌手阿绫立下赌约：若末日之世有人愿与她共赴死亡，世界便得以延续。" },
      { image: "assets/panels/shimo-p3.jpg", caption: "轮回开始，世界一次又一次走向终结，歌声始终没有等到回应。" },
      { image: "assets/panels/shimo-p4.jpg", caption: "人潮漫无目的地散去，只有一个女孩每次驻足片刻，便又离去。" },
      { image: "assets/panels/shimo-p5.jpg", caption: "曲终之时，人们终于停止寻觅，在滂沱的世末之雨中乞求着奇迹。" },
      { image: "assets/panels/shimo-p6.jpg", caption: "颤抖的双手被牵起，迎来每个人的结局——2018 COMING SOON。（注：因专辑跳票至今，成为中V圈著名冥场面，本仓库名即玩此梗）" },
    ],
    // —— 播放里程碑（快照值，录入 2026-09-26）
    // 来源：B站专栏 cv27058165（百万播放时间节点）+ 萌娘百科《世末歌者》
    // ⚠ 求真务实备注：research.md 曾写「神话：约2025」，但萌百记载神话用时 3509 日，
    //    自 2016-08-25 起算约为 2026-04，与 research.md 不符，此处按推算标注并待B站核实。
    milestones: [
      { label: "投稿B站", date: "2016-08-25" },
      { label: "100万播放 · 传说曲", date: "2018-03-24" },
      { label: "200万播放", date: "2020-04-08" },
      { label: "500万播放", date: "2023-10-14" },
      { label: "神话曲（用时3509日，最慢中V神话曲）", date: "约2026-04（快照待核）" },
    ],
    myStory: "（待补：第一次听到这首歌的场景、为什么项目文件夹叫「世末歌者」——此处由站长亲自撰写，AI 不代写）",
    // 「我的故事」留空占位规则见 AGENTS.md 一·六第3条
  },
  {
    id: "yichong-jiahai",
    title: "一重加害",
    singer: "洛天依、言和", // 主唱二人的B站投稿版为官方版（B站优先）；乐正绫和声
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2015-11-28",
    // ⚠ 原投稿 av3291729 因不可抗力已换源为纯音乐版本；此为官方B站投稿页链接（B站优先规则）
    bilibili: "https://www.bilibili.com/video/av3291729",
    badges: ["传说曲"],
    intro: "音乐附中生泠珞被被害妄想缠上，妄想中的黑影终于化为追杀她的加害者——系列首作，悬念才刚拉开。",
    seriesId: "wangxiang",
    // —— 分镜（共 6 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：B站补档简介 BV1bwvPzcEmC（还原原 av3291729 官方文案）+ 萌娘百科《一重加害》 ｜ 录入 2026-09-26
    panels: [
      { image: "assets/panels/yichong-p1.jpg", caption: "几个月来，音乐附中学生泠珞时时刻刻感觉，身后有一个无处不在的黑影想要谋害她。" },
      { image: "assets/panels/yichong-p2.jpg", caption: "她开始对周遭的一切神经质般地戒备，日常变得风声鹤唳。" },
      { image: "assets/panels/yichong-p3.jpg", caption: "终于，妄想中的黑影实质化为加害者——颜语，对她展开追杀。" },
      { image: "assets/panels/yichong-p4.jpg", caption: "风声鹤唳的日常里，逃亡成了她的全部。" },
      { image: "assets/panels/yichong-p5.jpg", caption: "墙上贴着一张海报：那个叫零羽的人、失去的音乐兴趣、被遗忘的记忆——伏笔就藏在这里。" },
      { image: "assets/panels/yichong-p6.jpg", caption: "故事在巨大悬念中收束，为整个系列的结局埋下了隐秘的伏笔。" },
    ],
    // —— 播放里程碑（快照值，录入 2026-09-26）
    // ⚠ 求真务实：原视频已换源，数据以 2024-09-07 最终记录为准；殿堂/传说达成具体日期查无公开记录，不编造。
    // 来源：萌娘百科《一重加害》（2024-09-07 最终记录） ｜ 录入 2026-09-26
    milestones: [
      { label: "投稿B站（av3291729）", date: "2015-11-28" },
      { label: "传说曲 · 播放 292.36万（最终记录快照，其后视频换源纯音乐）", date: "2024-09-07（最终记录）" },
    ],
    myStory: "（待补：第一次听到这首歌的场景与感想——此处由站长亲自撰写，AI 不代写）",
  },
];
