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
    // —— 系列内部按「凡人 / 歌者」两组（萌娘百科、VCPedia 均按此划分）：
    //   凡人 = 洛天依视角，每条世界线里平凡的一生；歌者 = 乐正绫视角，在轮回中孤独歌唱的流浪歌手。
    // —— Day 14（2026-10-11）补录：同伴反馈「世末歌者系列不止一首」，由 1 首补到 8 首已投稿曲目。
    // 系列「已知共 10 首」（萌娘百科）：凡人 7（夏风/世末积雨云/回音/hello&bye,days/凉雨/礼物/夏夜空）
    // + 歌者 3（世末歌者/同归世界线/碎梦）。Day 15（2026-10-15）补齐最后 2 首《礼物》《夏夜空》：
    //   两首均投稿于 5sing（B站无正式投稿页），按 AGENTS.md 一·六第5条以 noBilibili 说明，不编造链接。
    //   礼物 2013-08-14 原版 / 2015-10-05 重置版（VCPedia《禮物》）；夏夜空 2014-09-08（VCPedia《夏夜空》）。
    songIds: [
      "xiafeng", "shimo-jiyuyun", "huiyin", "tonggui-shijiexian",
      "hello-bye-days", "shimo-song", "liangyu", "suimeng",
      "liwu", "xiayekong",
    ],
    chapters: [
      { name: "凡人（洛天依）", songIds: ["xiafeng", "liwu", "shimo-jiyuyun", "xiayekong", "huiyin", "hello-bye-days", "liangyu"] },
      { name: "歌者（乐正绫）", songIds: ["tonggui-shijiexian", "shimo-song", "suimeng"] },
    ],
    // 来源：萌娘百科《世末歌者》 https://mzh.moegirl.org.cn/世末歌者 ｜ 录入 2026-09-26
    // 分组与补录来源：萌娘百科《世末歌者系列》 https://moegirl.uk/世末歌者系列 ＋ VCPedia 各曲条目 ｜ 录入 2026-10-11
  },
  {
    id: "wangxiang",
    name: "妄想症系列",
    intro: "DELA（曲）× 雨狸（词）的九重连环剧：泠珞因挚友零羽的离去坠入重重妄想，历经坠落与上升，最终直面现实。序曲之后，正篇分坠落之章（一重~五重）与上升之章（六重~九重）；另有三首「还原之章」角色歌（三重恋爱·偶像颜语 / 泠重乞愿·泠珞 / 零重祈愿·零羽）与三首番外（自攻自受 / 妄想Paranoia / 妄想Reality）。",
    songIds: [
      "nova", "yichong-jiahai", "erzhong-biange", "sanzhong-ailian", "sizhong-zuinie",
      "wuzhong-kongdong", "liuzhong-buzhong", "qizhong-gubing", "bazhong-huigui", "jiuzhong-xianshi",
      "sanzhong-lianai", "linchong-qiyuan", "lingchong-qiyuan",
      "zigongzishou", "wangxiang-paranoia", "wangxiang-reality",
      "shichong-gaobie",
    ],
    // 章节框架（系列总览页按此分组展示）：
    //   序曲 NOVA（先行概念曲）；坠落之章 = 一重~五重（五重为 b之章终曲，B站补档简介可证）；
    //   上升之章 = 六重~九重（七/八/九重标题均带 ♯之章，九重为完结作）。
    //   ⚠ 求真务实备注：六重归属「上升之章」为按上述证据的推断，萌百未直接标注，待核实。
    chapters: [
      { name: "序曲", songIds: ["nova"] },
      { name: "坠落之章", songIds: ["yichong-jiahai", "erzhong-biange", "sanzhong-ailian", "sizhong-zuinie", "wuzhong-kongdong"] },
      { name: "上升之章", songIds: ["liuzhong-buzhong", "qizhong-gubing", "bazhong-huigui", "jiuzhong-xianshi"] },
      { name: "角色歌（还原之章）", songIds: ["sanzhong-lianai", "linchong-qiyuan", "lingchong-qiyuan"] },
      { name: "番外", songIds: ["zigongzishou", "wangxiang-paranoia", "wangxiang-reality"] },
      { name: "十周年纪念曲", songIds: ["shichong-gaobie"] },
    ],
    // 来源：B站专栏 cv41416227 + 萌娘百科《九重现实》《八重回归》《七重痼病》 + B站补档简介 ｜ 录入 2026-09-26
  },
  {
    id: "shuangxiang",
    name: "双向系列",
    intro: "JUSF周存（曲）× sya（词/绘）的「周黑亚」组合作品：洛天依、言和、乐正绫陷入一段被诅咒的情感与永无幸福的轮回。六首正篇是互相关联的五世结局（双向思念→双向跨越/单向宣战→双向幸福→双向监禁→双向遗忘），三首角色歌（逆向守护·洛天依 / 正向欺骗·乐正绫 / 单向苏醒·言和）剖白各自主角，特别篇《双向倾诉》给出轮回之外的另一种可能。",
    songIds: [
      "shuangxiang-sinian", "shuangxiang-kuayue", "danxiang-xuanzhan", "shuangxiang-xingfu", "shuangxiang-jianjin",
      "shuangxiang-yiwang", "nixiang-shouhu", "zhengxiang-qipian", "danxiang-suxing", "shuangxiang-qingsu",
    ],
    chapters: [
      { name: "正篇（五世轮回）", songIds: ["shuangxiang-sinian", "shuangxiang-kuayue", "danxiang-xuanzhan", "shuangxiang-xingfu", "shuangxiang-jianjin", "shuangxiang-yiwang"] },
      { name: "角色歌", songIds: ["nixiang-shouhu", "zhengxiang-qipian", "danxiang-suxing"] },
      { name: "特别篇", songIds: ["shuangxiang-qingsu"] },
    ],
    // 来源：百度百科《双向系列》、萌娘百科《双向系列》各曲条目 + B站投稿页（av850424 / av859925 / av869576 / BV19s411o7JZ / av3061232 / av985798 / av1139245 / av1031003 / BV1Ds411o7Yd / BV1Fs411H7Cr）｜ 录入 2026-10-14
    // ⚠ 求真务实：单向宣战/双向幸福/正向欺骗 三首乐正绫视角曲初由言和代唱，乐正绫声库发布后换源重调，除《双向遗忘》外仅收录于专辑《双向·轮回与幸福》，无重制投稿页；
    //    修正 2026-10-22：《正向欺骗》经百度百科/搜狗百科/B站 API 三方核实，JUSF周存 2014-03-28 官方投稿 av1031003（BV1Bs411Z74r）确实存在，此前「未核实到」为调查疏漏，已补 bilibili 链接与封面。
    //    修正 2026-10-22：《双向监禁》同法核实，JUSF周存 2014-01-10 官方投稿 av905385（BV1Ds411o7Yd）存活，已补 bilibili 链接与封面。
    //    修正 2026-10-22：《双向倾诉》经 B站 view API 核实（站长提供番号），JUSF周存 2018-07-11 官方投稿 BV1Fs411H7Cr（aid=26586543）存活，投稿日期与本站收录 date 一致，已补 bilibili 链接与封面。至此双向系列全部曲目均有官方投稿页。
  },
  {
    id: "lovetopia",
    name: "异托邦 LOVETOPIA",
    intro: "阿良良木健自「奇爱人生」世界观延续的新系列（B站简介署「洛天依×徵羽摩柯 作品3号」起）。已知共六首：《不老不死》《一点一点》《无理无智》《我约等于世界》《左撕右裂》《少年汹涌》，洛天依与徵羽摩柯双主角，围绕巨型避难所「异托邦」的表面繁荣与地下隐秘展开。本站目前收录第一作《不老不死》。",
    songIds: ["bulao-busi"],
    // 来源：VCPedia《不老不死》 https://vcpedia.cn/zh-hk/不老不死 + 萌娘百科《不老不死(洛天依)》 ｜ 录入 2026-10-29
    // 已知六首名单来源：两站条目「同系列其他作品」栏一致
  },
  {
    id: "qiai",
    name: "奇爱人生（LOVE SERIES）",
    intro: "阿良良木健第二张专辑《奇爱人生》及其 LOVE SERIES 连环曲：Life《春风来》/ Origin《亲爱的》/ Venom《绝体绝命》/ Elegy《告别曲》，均由洛天依演唱。系列共用同一世界观（HALO 病毒、「少女」与「老人」等角色），也是「异托邦 LOVETOPIA」的前传。本站目前收录第三作《绝体绝命》。",
    songIds: ["jueti-jueming"],
    // 来源：萌娘百科《绝体绝命(洛天依)》「同系列其他作品」栏 ｜ 录入 2026-10-29
  },
  {
    id: "shuangxue-deng",
    name: "霜雪千年灯系列",
    intro: "COP 的「人鬼三世情缘」系列：首作《三千年夜行灯》（音频投稿于 5sing、未投稿B站）与第二作《霜雪千年》。系列梗概：一人夜船误入迷雾，与楼阁鬼魅对酌，晨起一夜十年已逝；鬼魅临终道别后跳入忘川守候千年，三生三千年后转世为人、忘却前生。本站目前收录第二作《霜雪千年》。",
    songIds: ["shuangxue-qiannian"],
    // 来源：萌娘百科《霜雪千年》系列曲文案 + 注释1（5sing 专辑列表） ｜ 录入 2026-10-29
  },
  {
    id: "tanhao",
    name: "❗️系列",
    intro: "Mara_然（VO大自然）的社会议题系列，四首均为乐正绫演唱，标题各是一个字：《逃！》（少女离家出走，2024-08-22，ACE/V3 双版本传说）、《卷！》（内卷之痛，《逃！》续作，2025-02-28）、《跑！》（反校园霸凌，《卷！》续作，2025-09-05）、《心》（作者遭网暴后的心声，《跑！》续作，2026-03-28，标题不带感叹号）。曲绘/PV 由 ヘロイン（洛因）贯穿四作。",
    songIds: ["tao", "juan", "pao", "xin"],
    // 来源：萌娘百科《逃！》《卷！》《跑！》《心(乐正绫)》条目（系列导航「Mara然（VO大自然）❗️系列：逃！•卷！•跑！•心」）
    //      + B站 view API 五条投稿逐一核实（含《逃！》ACE/V3 两版）｜ 录入 2026-10-29
    // ⚠ 求真务实：四首均无官方「剧情文案」，画格据 B站简介与官方歌词大意压缩改写，来源标注见各条目
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
    // —— 热度榜数值（万）：只录有公开快照的数字，未收录数字的歌不参与排名（一·七）
    // 来源：B站专栏 cv27058165（2023-10-14 达 500万）+ 萌百（其后达成神话曲）｜ 录入 2026-09-28
    heat: { plays: 500, asOf: "2023-10-14", note: "快照 500万，其后达成神话曲（约2026-04，待核）", milestone: "站内播放最高的单曲 · 中V 史上最慢达成的神话曲" },
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
  // ============================================================
  // 以下 7 首为 Day 14（2026-10-11）同伴反馈后补录的「世末歌者系列」曲目
  // 统一来源：VCPedia 各曲条目 + 萌娘百科《世末歌者系列》 ｜ 录入 2026-10-11
  // 规则：播放量一律标「快照值」并写明查询日期；查不到的一律留空或写「待核」，不编造
  // ============================================================
  {
    id: "xiafeng",
    title: "夏风",
    singer: "洛天依",
    author: "COP",
    date: "2012-07-27",
    // 初版 av320115（2012-07-27）；重制版 av403127（2012-11-27，奇音工作社出品）。此处取系列首作的初版投稿页。
    bilibili: "https://www.bilibili.com/video/av320115",
    badges: ["殿堂曲", "系列首作"],
    intro: "系列的原点，也是 COP 初三毕业时的出道曲：某个世界里的天依站在楼顶俯瞰市井，动过逃走的念头，最后还是决定勇敢面对。",
    seriesId: "shimo",
    // 分镜（纯文案，暂无配图）：按公开资料起草
    panels: [
      { caption: "一阵不属于这个季节的风吹来，天依站在城市高处，俯瞰着市井的万家灯火。" },
      { caption: "面对挫折她动过逃走的念头，却在风里闻见了故乡的槐米味道。" },
      { caption: "灯几乎要熄灭，却仍不甘隐于黑夜；她决定带着满身泥泞，朝夏风飞去的方向一直走下去。" },
    ],
    milestones: [
      { label: "初版投稿B站（av320115）· 系列首作 / COP 出道曲", date: "2012-07-27" },
      { label: "重制版投稿B站（av403127，奇音工作社出品）", date: "2012-11-27" },
      { label: "殿堂曲（初版用时 4807 日，曾为中文VOCALOID最慢殿堂曲）", date: "殿堂达成日待核" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shimo-jiyuyun",
    title: "世末积雨云",
    singer: "洛天依",
    author: "COP",
    date: "2014-10-02",
    bilibili: "https://www.bilibili.com/video/av1579079",
    badges: ["传说曲", "系列第二作"],
    intro: "碌碌无为、一味逃避现实的她，在布满积雨云的世末抬头仰望天空崩塌——直到最后一分钟，才察觉那片蔚蓝有多动人。",
    seriesId: "shimo",
    heat: { plays: 240.08, asOf: "2026-10-11", note: "快照 240.08万；来源萌娘百科条目，待B站投稿页核实" },
    panels: [
      { caption: "末日来临，天依伫立在滂沱的世末之雨中，抬头仰望积雨云的崩塌。" },
      { caption: "曾经一味逃避的她，忽然察觉记忆中蔚蓝天空的动人——但一切就要结束了。" },
      { caption: "无名的歌者在充斥恐惧的市井中淡然微笑，静待终结的钟声敲响。" },
    ],
    milestones: [
      { label: "投稿B站（av1579079）", date: "2014-10-02 09:36" },
      { label: "传说曲 · 播放 240.08万（用时 3345 日）", date: "2023-11-29 21:42" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "huiyin",
    title: "回音",
    singer: "洛天依",
    author: "COP",
    date: "2015-08-10",
    bilibili: "https://www.bilibili.com/video/av2711298",
    badges: ["殿堂曲", "系列第三作"],
    intro: "空旷的房间里天依独自歌唱，应答她的只有在暮光中交织的回音——看似悠然自得，其实是窒息般的孤独。",
    seriesId: "shimo",
    heat: { plays: 52.59, asOf: "2026-10-11", note: "快照 52.59万；来源 VCPedia 条目，待B站投稿页核实" },
    panels: [
      { caption: "雨幕中的街角，风铃声模糊，足迹已被冲刷殆尽。" },
      { caption: "只有回音在房间里旋转，与暮光交织，将孤独的歌声拥入怀中。" },
      { caption: "星点的回音汇成声浪，一次又次叩响她的心房。" },
    ],
    milestones: [
      { label: "投稿B站（av2711298）· 系列第三作 / 失踪一年后的回归作", date: "2015-08-10" },
      { label: "殿堂曲 · 播放 52.59万", date: "快照 2026-10-11（达成日待核）" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "tonggui-shijiexian",
    title: "同归世界线",
    singer: "乐正绫",
    author: "COP",
    date: "2015-09-11",
    // ⚠ 求真务实：本曲 2015-09-11 投稿于 5sing，B站无正式投稿页（另有 ACE 版发布于作者动态视频）。
    //    因此本条不写 bilibili 字段，改由 noBilibili 说明原因；歌曲页据此不显示「去B站听这首」按钮。
    noBilibili: "本曲投稿于 5sing，B站无正式投稿页，故不提供B站链接（不编造来源）",
    badges: [],
    intro: "串联起整个系列的一曲：这一次的世界线里，终焉降临之时有人与她一同面对——终结不再是孤身一人的结局。",
    seriesId: "shimo",
    panels: [
      { caption: "古旧生锈的钟无感情地拍打着回声，世界线又一次变动、定格。" },
      { caption: "在被剥离了色彩的世界里，她仍在寻觅那一点泛黄的奇迹。" },
      { caption: "轰鸣的钟声渐近，泪滴混着凉雨向未来延伸——这世界线不再终于孤寂。" },
    ],
    milestones: [
      { label: "投稿 5sing（B站无正式投稿页）", date: "2015-09-11" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "hello-bye-days",
    title: "hello&bye,days",
    singer: "洛天依",
    author: "COP",
    date: "2015-12-17",
    bilibili: "https://www.bilibili.com/video/av3402945",
    badges: ["传说曲", "系列第四作"],
    intro: "昏暗的雨夜，失恋的天依用酒精麻醉自己，拨出烂熟的号码只等到忙音；她蜷在窗台听见阿绫的歌声，目光却越过她，散在自己的悲伤里。",
    seriesId: "shimo",
    heat: { plays: 108.1, asOf: "2025-09-13", note: "快照 108.1万；来源百度百科条目（截至2025-09-13），待B站投稿页核实" },
    panels: [
      { caption: "三步并作两步走，逃离喧嚣的街头；拨出烂熟的号码，忙音在人海中轻轻叩响。" },
      { caption: "漆黑的夜幕中她蜷缩在冰冷的窗台，无意间听见了阿绫的歌声。" },
      { caption: "目光越过歌者、散在自己的悲伤里，终焉的信号随那歌声一起发出。（PV 末尾 4:15 后是《世末歌者》的预告）" },
    ],
    milestones: [
      { label: "投稿B站（av3402945）", date: "2015-12-17 22:28" },
      { label: "传说曲 · 播放 108.1万（用时 3397 日）", date: "2025-04-06 15:42" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "liangyu",
    title: "凉雨",
    singer: "洛天依",
    author: "COP",
    date: "2017-02-23",
    bilibili: "https://www.bilibili.com/video/av8786522",
    badges: ["传说曲", "系列第六作"],
    intro: "高楼坠落的砖砾将天依狠狠拍在地面。弥留的幻觉里，那个围着红围巾的女孩在她身边坐下，弹起吉他，像献上一曲挽歌。",
    seriesId: "shimo",
    // ⚠ 来源冲突：VCPedia 记「传说曲」并给出达成时间（2025-08-28）；萌娘百科 UK 记「殿堂曲 119.74万」。
    //    两源冲突按项目规则以B站投稿信息为准，此处取有达成时间可考的 VCPedia，并标注待核。
    heat: { plays: 122.85, asOf: "2026-10-11", note: "快照 122.85万（VCPedia）；萌娘UK记为殿堂曲119.74万，冲突待B站核实" },
    panels: [
      { caption: "城市从高处坍塌，砖砾雨点般落下，将她狠狠拍在地面。" },
      { caption: "恍惚中，围着红围巾的女孩在她身边坐下，眼中带着悲悯，弹起吉他。" },
      { caption: "弥留之际她在前世记忆的指引下追上那个红衣女孩——画面定格在灿烂晴空下缓缓靠近的两人。" },
    ],
    milestones: [
      { label: "投稿B站（av8786522）", date: "2017-02-23 18:28" },
      { label: "传说曲（用时 3107 日20时30分）", date: "2025-08-28 14:58" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "suimeng",
    title: "碎梦",
    singer: "乐正绫",
    author: "COP",
    date: "2026-04-05",
    bilibili: "https://www.bilibili.com/video/BV1sKSSBKEK8",
    badges: ["ACE殿堂曲", "系列最新作"],
    intro: "系列等了九年的「整梦」：在《世末歌者》达成神话的当天夜里，阿绫抱着木吉他，把自己的故事娓娓弹唱出来。",
    seriesId: "shimo",
    panels: [
      { caption: "又小又拥挤的房间，堆满贪念的床边，折成纸飞机的传单上画着潦草的未来。" },
      { caption: "四处虫鸣的夏夜、潮湿安静的街边，那个笨拙打着拍子的陌生人，都不见了。" },
      { caption: "被打碎的梦想重新拼凑——她抱着碎块，让停摆的时针重新开始摇摆。" },
    ],
    milestones: [
      { label: "Short 版发布（网易云 / B站音频，VOCALOID 声库）", date: "2017-10-29" },
      { label: "完整版投稿B站（BV1sKSSBKEK8）· 与《世末歌者》神话同日", date: "2026-04-05" },
      { label: "ACE殿堂曲（用时 14 时 44 分）", date: "2026-04-06 11:44" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "liwu",
    title: "礼物",
    singer: "洛天依",
    author: "COP",
    date: "2013-08-14",
    // ⚠ 求真务实：本曲投稿于 5sing（原版 2013-08-14 / 重置版 2015-10-05），B站无正式投稿页，故不写 bilibili、改 noBilibili 说明。
    // 来源：VCPedia《禮物》 https://vcpedia.cn/zh-hant/%E7%A4%BC%E7%89%A9 ｜ 录入 2026-10-15
    noBilibili: "本曲投稿于 5sing（原版 2013-08-14 / 重置版 2015-10-05），B站无正式投稿页，故不提供B站链接（不编造来源）",
    badges: [],
    intro: "一个试图守住本真的孩子，在枯槁而生涩的世界里什么都无法撼动，只能看着幼时的自己迫不及待地长大——这份湿漉漉的成长，是一份强人所难、签收便无法退换的礼物。",
    seriesId: "shimo",
    // —— 分镜（纯文案，暂无配图）：按 VCPedia 公开简介起草；配图留待 Day 15 第4步
    panels: [
      { caption: "孩子攥着不肯松手的本真，在灰扑扑的世界里笨拙地抵挡。" },
      { caption: "枯槁而生涩的岁月里，什么都撼动不了，只有时间在悄悄挪移。" },
      { caption: "幼时的自己迫不及待地长大——这份湿漉漉的成长，签收便无法退换。" },
    ],
    milestones: [
      { label: "原版投稿 5sing", date: "2013-08-14" },
      { label: "重置版投稿 5sing", date: "2015-10-05" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "xiayekong",
    title: "夏夜空",
    singer: "洛天依",
    author: "COP",
    date: "2014-09-08",
    // ⚠ 求真务实：本曲投稿于 5sing（2014-09-08），B站无正式投稿页，故不写 bilibili、改 noBilibili 说明。
    // 来源：VCPedia《夏夜空》 https://vcpedia.cn/index.php?oldid=548857&title=%E5%A4%9C%E7%A9%BA&variant=zh-hk ｜ 录入 2026-10-15
    noBilibili: "本曲投稿于 5sing（2014-09-08），B站无正式投稿页，故不提供B站链接（不编造来源）",
    badges: [],
    intro: "COP 较为抒情的早期作品：天依梦中有一片绚烂夜空与思念的人，「花火」「瞳孔」「苍穹」关系的两次转变串联全曲，写尽她对世界的浪漫幻想如何逐渐现实化，结尾转为对思念之人与儿时憧憬的追忆。",
    seriesId: "shimo",
    // —— 分镜（纯文案，暂无配图）：按 VCPedia 公开简介起草；配图留待 Day 15 第4步
    panels: [
      { caption: "天依梦见一片绚烂夏夜空，和那个思念的人。" },
      { caption: "花火藉由瞳孔投影到苍穹，她对世界的浪漫幻想一次次转变。" },
      { caption: "多日的阴雨之后，幻想褪色，只剩对故人与儿时憧憬的追忆。" },
    ],
    milestones: [
      { label: "投稿 5sing（无B站正式投稿页）", date: "2014-09-08" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "nova",
    title: "NOVA",
    singer: "洛天依、言和、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2015-11-14",
    bilibili: "https://www.bilibili.com/video/av3217323",
    badges: ["序曲"],
    intro: "妄想症系列先行概念曲：泠珞与零羽的乐队通过海选、梦想将启，挚友却不明不白地离开——一切妄想的起点。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：萌娘百科 DELA 条目（NOVA：2015-11-14 投稿，系列先行概念曲）+ 搜狗百科《妄想症系列》剧情介绍 ｜ 录入 2026-09-26
    panels: [
      { caption: "第五音高中，泠珞与零羽组成乐队 VividCycle，词曲与吉他相遇，向着比赛海选进发。" },
      { caption: "海选通过了。舞台灯光亮起，梦想仿佛触手可及。" },
      { caption: "然而零羽却不明不白地离开了，没有留下任何解释。" },
      { caption: "遭受巨大打击的泠珞，世界开始出现裂痕。" },
      { caption: "妄想的幕布就此拉开——重重世界的大门，缓缓打开。" },
    ],
    milestones: [
      { label: "投稿B站（av3217323）· 系列先行概念曲", date: "2015-11-14" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
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
    intro: "对应「被害妄想」。音乐附中生泠珞被无处不在的黑影缠上，妄想终于化为追杀她的加害者颜语——系列正篇首作。",
    seriesId: "wangxiang",
    // —— 热度榜数值：2024-09-07 最终记录快照（其后视频换源，无更新数据，不编造）
    // 来源：萌娘百科《一重加害》 ｜ 录入 2026-09-28
    heat: { plays: 292.36, asOf: "2024-09-07", note: "最终记录快照，其后视频换源纯音乐", milestone: "妄想症系列正篇首作 · 传说曲" },
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
  {
    id: "erzhong-biange",
    title: "二重变革",
    singer: "洛天依、言和",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2015-12-12",
    // ⚠ 原投稿 av3370007 已未回归（换源）；B站有官方授权补档 av113049914574284，此处仍指向官方投稿页（B站优先规则）
    bilibili: "https://www.bilibili.com/video/av3370007",
    badges: [],
    intro: "对应「物理影响妄想·逆」。泠珞获得凭想象改变现实的能力反抗加害者，却发现幻想的产物杀不死——直到她找到弱点。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：搜狗百科《妄想症系列》剧情介绍 + 萌娘百科 DELA 条目（2015-12-12 投稿） ｜ 录入 2026-09-26
    panels: [
      { caption: "加害者颜语宣告：顺从你的愿望——由我来杀死你自己。" },
      { caption: "泠珞试图反抗，却发现自己也获得了凭借想象改变现实的能力。" },
      { caption: "然而加害者同是自己幻想的产物，无论如何都杀不死。" },
      { caption: "泠珞找到她的弱点，布下激光陷阱，举起格洛克。" },
      { caption: "加害者倒下了——但妄想世界，并没有因此终结。" },
    ],
    milestones: [
      { label: "投稿B站（av3370007，后未回归）", date: "2015-12-12" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "sanzhong-ailian",
    title: "三重爱恋",
    singer: "洛天依、言和",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-01-28",
    bilibili: "https://www.bilibili.com/video/av3683320",
    badges: [],
    intro: "对应「情爱妄想」。掩埋恐怖记忆的泠珞虚构出温柔的守护者，坠入热恋——直到潜意识苏醒，怀疑悄然生根。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：搜狗百科《妄想症系列》剧情介绍 + 萌娘百科 DELA 条目（2016-01-28 投稿） ｜ 录入 2026-09-26
    panels: [
      { caption: "掩埋一二重的可怖记忆，泠珞试图回到盲目而平静的生活。" },
      { caption: "对安宁与保护的渴望，让她虚构出温柔的守护者颜语。" },
      { caption: "一见钟情，两人陷入热恋——青色的妄想世界看似完美。" },
      { caption: "然而潜意识泠珞苏醒了：眼前的「现实」与过去的记忆开始对不上。" },
      { caption: "熟悉的容貌令她心生疑窦——守护者与加害者，为何如此相似？" },
    ],
    milestones: [
      { label: "投稿B站（av3683320）", date: "2016-01-28" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "sizhong-zuinie",
    title: "四重罪孽",
    singer: "洛天依、言和、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-03-26",
    bilibili: "https://www.bilibili.com/video/av4188543",
    badges: [],
    intro: "对应「自罪妄想」。泠珞想起被自己掩盖的事实，明白恋人只是妄想，在自我审判的边缘被零羽的记忆唤回——加害者却因此重生。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：搜狗百科《妄想症系列》剧情介绍 + 萌娘百科 DELA 条目（2016-03-26 投稿） ｜ 录入 2026-09-26
    panels: [
      { caption: "被掩盖的事实终于浮出水面：眼前的恋人，只是自己的妄想。" },
      { caption: "泠珞为自己的罪孽痛苦不已，守护者却发现异样，发誓要保护她。" },
      { caption: "她企图以死赎罪——关于零羽的记忆被唤醒，让她失去了勇气。" },
      { caption: "恐惧与痛苦滋蔓，坠落的加害者颜语，再度重生。" },
      { caption: "一层层向下穿越，这一次，来到了第四重世界。" },
    ],
    milestones: [
      { label: "投稿B站（av4188543）", date: "2016-03-26" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "wuzhong-kongdong",
    title: "五重空洞",
    singer: "洛天依、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-04-28",
    bilibili: "https://www.bilibili.com/video/av4492594",
    badges: [],
    intro: "对应「内心被洞悉感」。彼岸花田深处，潜意识泠珞找到了被掩埋的零羽——怀中却只剩枯骨。坠落之章在此收束。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：搜狗百科《妄想症系列》剧情介绍 + B站补档简介 BV1NbvAz9Eje（「b之章终曲」「红色流苏伏笔」） ｜ 录入 2026-09-26
    panels: [
      { caption: "潜意识泠珞走进彼岸花田，寻找埋葬在记忆深处的零羽。" },
      { caption: "她试图抱紧曾经的挚友，怀中却只剩下一截枯骨。" },
      { caption: "过去的美好记忆漫上心头，更映衬出生离死别的悲恸与迷茫。" },
      { caption: "零羽胸前的红色流苏一闪而过——关键物象，就此埋下。" },
      { caption: "她渴望找到办法，拯救陷于重重梦境中的自己。坠落之章，至此收束。" },
    ],
    milestones: [
      { label: "投稿B站（av4492594）", date: "2016-04-28" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "liuzhong-buzhong",
    title: "六重不忠",
    singer: "洛天依、言和、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-08-05",
    bilibili: "https://www.bilibili.com/video/av5656549",
    badges: [],
    intro: "对应「嫉妒妄想」。加害者策反守护者同赴五重世界，守护者却为泠珞挡下刀剑，化作零羽的流苏——嘱诫随泪落下。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：搜狗百科《妄想症系列》剧情介绍 + 萌娘百科 DELA 条目（2016-08-05 投稿） ｜ 录入 2026-09-26
    // ⚠ 章节归属：上升之章的起点为按九重完结作的推断，见 SERIES.chapters 备注
    panels: [
      { caption: "加害者击败并策反了守护者，二人一同前往五重世界。" },
      { caption: "见到零羽的囚所前，泠珞为零羽与守护者的「背叛」痛苦万分。" },
      { caption: "刀剑加身的瞬间，守护者为泠珞挡下了加害者的攻击。" },
      { caption: "守护者化作一串朱红色流苏——那是零羽留给泠珞的温暖。" },
      { caption: "泠珞接住流苏，听到了零羽殷切的嘱诫。" },
    ],
    milestones: [
      { label: "投稿B站（av5656549）", date: "2016-08-05" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "qizhong-gubing",
    title: "七重痼病",
    singer: "洛天依、言和、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-12-16",
    // ⚠ 原投稿 av7549517 因不可抗力已换源为纯音乐版本；此为官方B站投稿页链接（B站优先规则）
    bilibili: "https://www.bilibili.com/video/av7549517",
    badges: ["传说曲"],
    intro: "对应「疑病妄想」。天台上真相重演，加害者刺穿潜意识，却换来同归于尽——妄想世界摇摇欲坠，苏醒近在眼前。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：萌娘百科《七重痼病》（2016-12-16 投稿，殿堂约44小时）+ 搜狗百科《妄想症系列》剧情介绍 ｜ 录入 2026-09-26
    panels: [
      { caption: "明白真相的泠珞逃回第五音，终于登上了天台。" },
      { caption: "零羽坠落的场景在眼前重演——原来这才是最初的伤口。" },
      { caption: "加害者挟持了潜意识泠珞：忘掉零羽，永远沉沦在妄想世界。" },
      { caption: "刀刃刺穿潜意识，却换来同归于尽的结局。" },
      { caption: "妄想世界摇摇欲坠，泠珞面临孤独的苏醒。" },
    ],
    // ⚠ 求真务实：传说达成具体日期查无公开记录，仅录最终记录快照，不编造。
    // 来源：萌娘百科《七重痼病》（2024-09-07 最终记录） ｜ 录入 2026-09-26
    milestones: [
      { label: "投稿B站（av7549517，殿堂用时约44小时）", date: "2016-12-16" },
      { label: "传说曲 · 播放 244.28万（最终记录快照）", date: "2024-09-07（最终记录）" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "bazhong-huigui",
    title: "八重回归",
    singer: "洛天依、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2017-03-10",
    // ⚠ 原投稿 av9072485 因不可抗力已换源为纯音乐版本；2017-03-16 曾推行换源版「八重回归·真」（B站优先规则）
    bilibili: "https://www.bilibili.com/video/av9072485",
    badges: ["传说曲"],
    intro: "对应「初始妄想」。泠珞从妄想中苏醒回归现实，却再难接受挚友离去——一切似乎恢复正常，只是这个世界已再无色彩。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：萌娘百科《八重回归》（2017-03-10 投稿；3-16 换源「八重回归·真」）+ 搜狗百科《妄想症系列》剧情介绍 ｜ 录入 2026-09-26
    panels: [
      { caption: "泠珞终于从妄想中苏醒，回归现实世界。" },
      { caption: "她仍无法接受挚友离去的事实，抑郁中甚至试图割腕。" },
      { caption: "最终她妥协于现实，淡漠了曾经的爱恋与梦想，尝试平淡度日。" },
      { caption: "一切似乎都恢复正常——只是，这个世界已再无色彩。" },
      { caption: "投稿七天后，本曲换源为「八重回归·真」，歌词与PV皆有不同——结局另有变动。" },
    ],
    // ⚠ 求真务实：传说达成具体日期查无公开记录，仅录最终记录快照，不编造。
    // 来源：萌娘百科《八重回归》（2024-09-07 最终记录） ｜ 录入 2026-09-26
    milestones: [
      { label: "投稿B站（av9072485）", date: "2017-03-10" },
      { label: "换源版「八重回归·真」上线，暗示结局变动", date: "2017-03-16" },
      { label: "传说曲 · 播放 200.69万（最终记录快照）", date: "2024-09-07（最终记录）" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "jiuzhong-xianshi",
    title: "九重现实",
    singer: "洛天依、乐正绫", // 主唱二人；言和和声（B站优先规则）
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2017-03-17",
    // ⚠ 原投稿 av9214515 因不可抗力已换源为纯音乐版本；此为官方B站投稿页链接（B站优先规则）
    bilibili: "https://www.bilibili.com/video/av9214515",
    badges: ["传说曲"],
    intro: "系列真·终曲：整个故事的真正剧情脉络就此揭开，空白的世界等待重新着色——泠珞接受一切，走向带有希望的未来。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：萌娘百科《九重现实》（2017-03-17 投稿，完结作，词作留言引文）+ 搜狗百科《妄想症系列》 ｜ 录入 2026-09-26
    panels: [
      { caption: "系列终曲：整个故事的真正剧情脉络，在此揭开。" },
      { caption: "妄想与现实的对峙迎来终点，白色，也许是可以着色的，也许是被擦除了色彩之后的。" },
      { caption: "「我所描述的一切或许并非真实，然而我的感受绝无虚假。」——绝无虚假。" },
      { caption: "泠珞接受一切，故事呈现出带有希望的未来。" },
      { caption: "面对凶险的今后——九重落幕，现实开始。" },
    ],
    // ⚠ 求真务实：传说达成具体日期查无公开记录，仅录最终记录快照，不编造。
    // 来源：萌娘百科《九重现实》（2024-09-07 最终记录） ｜ 录入 2026-09-26
    heat: { plays: 282.33, asOf: "2024-09-07", note: "最终记录快照", milestone: "妄想症系列完结作 · 传说曲" },
    milestones: [
      { label: "投稿B站（av9214515）· 系列完结作", date: "2017-03-17" },
      { label: "传说曲 · 播放 282.33万（最终记录快照）", date: "2024-09-07（最终记录）" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "lingchong-qiyuan",
    title: "零重祈愿",
    singer: "乐正绫",
    author: "崩坏（曲）· 雨狸（策划/词）· DELA（代投）",
    date: "2017-02-25",
    // ⚠ 求真务实：本曲为系列角色歌（零羽的还原之章），非正篇「九重」之一；
    //   原投稿 av8815372（DELA 于 2017-02-25 代投），传说曲（2022-01-08 达成，183.51万播放）。
    bilibili: "https://www.bilibili.com/video/av8815372",
    badges: ["角色歌"],
    intro: "对应「还原之章·零羽」。零羽外表开朗，背后却是混乱破碎的家庭——乐队通过海选、生日收到项链的喜悦后，回家却看见举着菜刀疯了的母亲。混乱中母亲割伤了她的手，她再也无法弹吉他，默默退出比赛、转身退场。这是整系列妄想发生前的开端，也是结局的伏笔。",
    seriesId: "wangxiang",
    // —— 分镜（共 5 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5）
    // 来源：萌娘百科《零重祈愿》 https://zh.moegirl.org.cn/零重祈愿 ｜ 录入 2026-10-14
    panels: [
      { caption: "零羽外表开朗，是乐队 VividCycle 的吉他手兼主唱，承载着所有人的期待。" },
      { caption: "乐队通过海选，生日那天还收到了泠珞的项链，一切都那么开心。" },
      { caption: "可当她揣着通知书笑着回到家时，看到的是举着菜刀、已然疯了的母亲。" },
      { caption: "混乱中母亲割伤了她的手——她再也无法弹吉他。" },
      { caption: "她再也坚持不下去，默默退出比赛，转身退场。这是整系列妄想发生前的开端。" },
    ],
    milestones: [
      { label: "投稿B站（av8815372）· 零羽的还原之章·角色歌", date: "2017-02-25" },
      { label: "传说曲 · 播放 183.51万（2022-01-08 达成）", date: "2022-01-08" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },

  // ============================================================
  // 以下 5 首为 2026-10-14 补录的《妄想症》系列剩余曲目
  // 来源：萌娘百科 / VCPedia《妄想症Paranoia》各曲条目 + B站补档链接（av4704894 / av3761912 / av6477673 / av8264026 / av17679245）｜ 录入 2026-10-14
  // 规则：播放量未公开记录的一律标「待核」，不编造
  // ============================================================
  {
    id: "sanzhong-lianai",
    title: "三重恋爱",
    singer: "言和",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-02-05",
    bilibili: "https://www.bilibili.com/video/av3761912",
    badges: ["角色歌"],
    intro: "对应「还原之章·偶像颜语」。现实中偶像颜语的成名曲，在小说中出现：颜语是第五音高中最叛逆的学生，毕业后被生活所迫提前出道；她从小就被贴上不符的标签、遭人议论，却意志坚定地用行动反抗世界对她的束缚。",
    seriesId: "wangxiang",
    panels: [
      { caption: "颜语是第五音高中最叛逆的学生，外表张扬、不甘被定义。" },
      { caption: "毕业后被生活所迫提前出道，成为现实中叛逆的偶像。" },
      { caption: "从小被贴上不符的标签、遭人议论，她却意志坚定，用行动反抗世界对自己的束缚。" },
    ],
    milestones: [
      { label: "投稿B站（av3761912）· 偶像颜语的角色歌（还原之章）", date: "2016-02-05" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "linchong-qiyuan",
    title: "泠重乞愿",
    singer: "洛天依",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2016-05-20",
    bilibili: "https://www.bilibili.com/video/av4704894",
    badges: ["角色歌", "传说曲"],
    intro: "对应「还原之章·♮之章.泠珞」。泠珞的歌无人问津，甚至遭到抄袭；当她几乎对这个世界失去期待时，得到了仰慕的歌手零羽的理解与接纳，两人组建乐队、通过海选。然而零羽不告而别，泠珞陷入悲痛与空洞，开始怀疑自我价值，从而坠入妄想逃避现实。这是整系列妄想发生前、泠珞的现实开端。",
    seriesId: "wangxiang",
    panels: [
      { caption: "泠珞的歌无人问津，甚至遭到抄袭，几乎对这个世界失去期待。" },
      { caption: "她得到了仰慕的歌手零羽的理解与接纳，两人组建乐队、通过海选。" },
      { caption: "然而零羽不告而别，泠珞陷入悲痛与空洞，开始怀疑自我价值——妄想由此而生。" },
    ],
    milestones: [
      { label: "投稿B站（av4704894）· 泠珞的还原之章·角色歌", date: "2016-05-20" },
      { label: "传说曲（具体达成日期待核）", date: "待核" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "zigongzishou",
    title: "自攻自受",
    singer: "言和",
    author: "崩坏（曲/编）· 雨狸（策划/词）· DELA（代投）",
    date: "2016-10-01",
    bilibili: "https://www.bilibili.com/video/av6477673",
    badges: ["番外", "传说曲"],
    intro: "对应「妄想世界·双颜语」。独立番外，不隶属任何一章；时间点在四重之后、六重之前，描绘加害者颜语与守护者颜语的厮杀之战。诡异又热血的曲调，展现二者对立冲突与矛盾和谐——也揭示了六重中加害者成功策反守护者的深层原因。",
    seriesId: "wangxiang",
    panels: [
      { caption: "独立番外，时间线在四重与六重之间。" },
      { caption: "加害者颜语与守护者颜语——同一个人的两面——展开厮杀。" },
      { caption: "诡异又热血的曲调，揭示二者对立统一的矛盾本质，也藏着六重策反的伏笔。" },
    ],
    milestones: [
      { label: "投稿B站（av6477673）· 番外篇（双颜语）", date: "2016-10-01" },
      { label: "传说曲（具体达成日期待核）", date: "待核" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "wangxiang-paranoia",
    title: "妄想Paranoia",
    singer: "洛天依、言和、乐正绫",
    author: "DELA（曲）· 雨狸（策划/词）",
    date: "2017-01-28",
    bilibili: "https://www.bilibili.com/video/av8264026",
    badges: ["番外"],
    intro: "系列番外串烧：将各曲 Remix 并重调教的串烧作品，把七个原本风格节奏迥异的旋律连成一个整体重新编曲。",
    seriesId: "wangxiang",
    panels: [
      { caption: "系列番外篇，一首 Remix 串烧作品。" },
      { caption: "把七个原本风格、节奏都不同的旋律连在一起，当作一个整体重新编曲。" },
    ],
    milestones: [
      { label: "投稿B站（av8264026）· 番外串烧", date: "2017-01-28" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "wangxiang-reality",
    title: "妄想Reality",
    singer: "洛天依、言和、乐正绫",
    author: "DELA（曲/编）· 雨狸（策划/词）",
    date: "2017-12-27",
    bilibili: "https://www.bilibili.com/video/av17679245",
    badges: ["番外"],
    intro: "系列番外篇，是《妄想Paranoia》的重填词版本（Reality 增加了还原之章、八重与九重的旋律），回避以往所有曲子用过的意象，呈现一种全新的意境。",
    seriesId: "wangxiang",
    panels: [
      { caption: "系列番外篇，是《妄想Paranoia》的重填词版本。" },
      { caption: "Reality 增加了还原之章、八重与九重的旋律，回避旧有意象，呈现全新意境。" },
    ],
    milestones: [
      { label: "投稿B站（av17679245）· 番外重填词", date: "2017-12-27" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },

  // ============================================================
  // 以下 10 首为 2026-10-14 新开《双向系列》（JUSF周存 × sya）全曲目
  // 来源：百度百科《双向系列》、萌娘百科《双向系列》各曲条目 + B站投稿页（av850424 / av859925 / av869576 / BV19s411o7JZ / av3061232 / av985798 / av1139245）｜ 录入 2026-10-14
  // 规则：未核实到公开投稿页的 3 首（双向监禁 / 正向欺骗 / 双向倾诉）以 noBilibili 说明，不编造来源
  // ============================================================
  {
    id: "shuangxiang-sinian",
    title: "双向思念",
    singer: "洛天依、言和",
    author: "JUSF周存（曲/词/编）· sya（绘/PV）",
    date: "2013-11-26",
    bilibili: "https://www.bilibili.com/video/av850424",
    badges: ["正篇", "殿堂曲"],
    intro: "双向系列第一世（首作）。洛天依与言和相遇、相恋，却因自觉身份卑微而放弃；言和误以为她不爱自己，为试探而假装爱上乐正绫。洛天依一时冲动杀害言和，悔恨中自语「若时间可以重来」，随即自杀——第一世化为梦境，轮回转入第二世。",
    seriesId: "shuangxiang",
    // —— 分镜（共 3 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5），错误随时指出随时修正
    // 配图来源：AI 原创生成（2026-10-16，Day16 扩全站试点），不使用任何官方曲绘或 PV 截图
    panels: [
      { image: "assets/panels/shuangxiang-sinian-p1.jpg", caption: "洛天依与言和相遇、相恋，却因自觉身份卑微而不敢接受。" },
      { image: "assets/panels/shuangxiang-sinian-p2.jpg", caption: "言和误以为她不爱自己，为试探而假装爱上乐正绫。" },
      { image: "assets/panels/shuangxiang-sinian-p3.jpg", caption: "洛天依冲动之下杀害言和，悔恨中自语「若时间可以重来」随即自杀——第一世化为梦境。" },
    ],
    milestones: [
      { label: "投稿B站（av850424）· 系列第一世·首作", date: "2013-11-26" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shuangxiang-kuayue",
    title: "双向跨越",
    singer: "洛天依、言和",
    author: "JUSF周存（曲/词/编）· sya（绘/PV）",
    date: "2013-12-04",
    bilibili: "https://www.bilibili.com/video/av859925",
    badges: ["正篇", "殿堂曲"],
    intro: "双向系列第二世（第一种结局）。剧情前半与《双向思念》相同，但洛天依举刀刺向言和时，被言和紧紧抱住、表白心意，两人幸福相守。然而《单向宣战》结局里《双向跨越》的CG被描红，表明这只是假结局；真正的第二世结局是《单向宣战》。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "第二世展开，前半与首作相同。" },
      { caption: "洛天依举刀之时，言和紧紧抱住她、表白心意。" },
      { caption: "两人幸福相守——但这是被《单向宣战》描红的假结局。" },
    ],
    milestones: [
      { label: "投稿B站（av859925）· 系列第二世·第一种结局", date: "2013-12-04" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "danxiang-xuanzhan",
    title: "单向宣战",
    singer: "言和",
    author: "JUSF周存（曲/词/编/调）· sya（绘/PV）",
    date: "2013-12-12",
    bilibili: "https://www.bilibili.com/video/av869576",
    badges: ["正篇", "殿堂曲"],
    intro: "双向系列第二世 TRUE END（真正结局）。紧接《双向跨越》言和天依互表心意之后：乐正绫认定是洛天依抢走了深爱的言和，疯狂报复并将她引向自杀。因创作时乐正绫声库未发布，本曲初由言和代唱（乐正绫视角），声库发布后换源重调。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "第二世真正结局，紧接《双向跨越》之后。" },
      { caption: "乐正绫认定洛天依抢走了言和，疯狂报复。" },
      { caption: "乐正绫将洛天依引向自杀——「你毕竟给予过她从未感受过的温暖」。" },
    ],
    milestones: [
      { label: "投稿B站（av869576）· 系列第二世·TRUE END", date: "2013-12-12" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shuangxiang-xingfu",
    title: "双向幸福",
    singer: "洛天依、言和",
    author: "JUSF周存（曲/词/编/调）· sya（绘/PV）",
    date: "2013-12-27",
    bilibili: "https://www.bilibili.com/video/BV19s411o7JZ",
    badges: ["正篇", "殿堂曲"],
    intro: "双向系列第三世。建立在之前三作基础上：言和为试探洛天依是否爱他，与乐正绫佯装情侣后又抛弃她；乐正绫为复仇假扮言和离间洛天依。洛天依伤心欲自杀时，乐正绫不忍爱人伤心而悔悟，阻止了她并坦白，随即跳楼自杀。洛天依对言和的误会化解，两人重归于好。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "第三世，建立在前三作基础上。" },
      { caption: "言和佯装与乐正绫相恋试探天依；乐正绫为复仇假扮言和离间天依。" },
      { caption: "天依欲自杀时，乐正绫悔悟阻止并坦白，随即跳楼；两人误会化解、重归于好。" },
    ],
    milestones: [
      { label: "投稿B站（BV19s411o7JZ）· 系列第三世", date: "2013-12-27" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shuangxiang-jianjin",
    title: "双向监禁",
    singer: "洛天依、言和",
    author: "JUSF周存（曲/词/编/调）· sya（绘/PV）",
    date: "2014-01-10",
    bilibili: "https://www.bilibili.com/video/BV1Ds411o7Yd",
    badges: ["正篇", "殿堂曲"],
    intro: "双向系列第四世/第五世。剧情一般认为与前作《双向幸福》无关，由第二世乐正绫在《单向宣战》结尾所想「如果时间可以重来」延续而来：洛天依亲手杀掉乐正绫后写信约言和到天台；言和发现后精神崩溃报警，被送进精神病院，洛天依因杀人被关进拘留所——「双向监禁」即一人入狱、一人入院。本曲黑化曲风与血腥画面，是系列点击量与收藏最高的曲目之一。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "时间轴位于言和与乐正绫假装恋爱的时期。" },
      { caption: "洛天依杀掉乐正绫后写信约言和到天台。" },
      { caption: "言和崩溃报警被送进精神病院，天依因杀人入狱——「双向监禁」。" },
    ],
    milestones: [
      { label: "投稿（专辑《双向·轮回与幸福》）· 系列第四/五世", date: "2014-01-10" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shuangxiang-yiwang",
    title: "双向遗忘",
    singer: "洛天依、言和、乐正绫",
    author: "JUSF周存（曲/词/编/调）· sya（绘/PV）",
    date: "2015-10-15",
    bilibili: "https://www.bilibili.com/video/av3061232",
    badges: ["正篇", "传说曲"],
    intro: "双向系列正篇收官之作（第九作），以61小时左右达成殿堂。延续系列悲剧美学与轮回主题：表天依夺走黑天依能力后，令自己和言和遗忘彼此、时间倒转回未犯错之前，选择不再相爱；苏醒前几世记忆的言和同时动用「重来」能力，试图结束轮回。作者称双向是「永远无法得到幸福的轮回」，但也说「一百个人有一百种解释」，本曲为开放式结局。",
    seriesId: "shuangxiang",
    // —— 分镜（共 3 格）：AI 按公开资料起草、免审入库（TECH_DESIGN §5），错误随时指出随时修正
    // 配图来源：AI 原创生成（2026-10-16，Day16 扩全站试点），不使用任何官方曲绘或 PV 截图
    panels: [
      { image: "assets/panels/shuangxiang-yiwang-p1.jpg", caption: "正篇收官，轮回主题推向高潮。" },
      { image: "assets/panels/shuangxiang-yiwang-p2.jpg", caption: "表天依令二人遗忘彼此、时间倒转，选择不再相爱。" },
      { image: "assets/panels/shuangxiang-yiwang-p3.jpg", caption: "言和同时动用「重来」能力试图结束轮回——开放式结局。" },
    ],
    milestones: [
      { label: "投稿B站（av3061232）· 系列正篇收官·传说曲", date: "2015-10-15" },
      { label: "传说曲（殿堂用时约61小时）", date: "传说达成日待核" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "nixiang-shouhu",
    title: "逆向守护",
    singer: "洛天依",
    author: "JUSF周存（曲/词/编/调）· sya（绘）· Eating DF（PV）",
    date: "2014-02-27",
    bilibili: "https://www.bilibili.com/video/av985798",
    badges: ["角色歌", "殿堂曲"],
    intro: "双向系列第六作，洛天依的人物番外角色歌。以极快语速搭配存式高音与黑嗓，围绕洛天依的「双重人格」设定：白人格渴望守护、黑人格怂恿杀掉言和——「你是谁？我是你。」剧情与后续《单向苏醒》直接关联。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "洛天依的人物番外，剖白其双重人格。" },
      { caption: "白人格渴望被拯救与守护，黑人格怂恿杀掉言和。" },
      { caption: "「你是谁？——我是你。」黑白人格的对峙。" },
    ],
    milestones: [
      { label: "投稿B站（av985798）· 洛天依番外角色歌", date: "2014-02-27" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "zhengxiang-qipian",
    title: "正向欺骗",
    singer: "言和",
    author: "JUSF周存（曲/词/编/调）· sya（绘/PV）",
    date: "2014-03-28",
    bilibili: "https://www.bilibili.com/video/BV1Bs411Z74r",
    badges: ["角色歌", "殿堂曲"],
    intro: "双向系列第七作，乐正绫的角色番外（初由言和代唱）。继承系列前作曲风，乐正绫以个人独白讲述自己的身世，歌词充满对个人世界的绝望与厌恶，也为前作埋下的情节伏笔作了解释。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "乐正绫的角色番外，以个人独白展开。" },
      { caption: "讲述乐正绫的身世，充满对个人世界的绝望与厌恶。" },
      { caption: "为前作埋下的情节伏笔作了解释。" },
    ],
    milestones: [
      { label: "投稿（专辑《双向·轮回与幸福》）· 乐正绫番外角色歌", date: "2014-03-28" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "danxiang-suxing",
    title: "单向苏醒",
    singer: "洛天依、言和",
    author: "JUSF周存（曲/词/编/调）· sya（绘）",
    date: "2014-05-22",
    bilibili: "https://www.bilibili.com/video/av1139245",
    badges: ["角色歌", "殿堂曲"],
    intro: "双向系列第八作，言和的角色番外（非正作）。写言和向洛天依表白后，洛天依无法控制黑向人格「杀掉言和」的怂恿而选择自杀的悲伤故事（关于自杀或同归于尽存在争议）。采用系列一贯的悲伤曲调与黑暗曲风。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "言和的角色番外，非系列正作。" },
      { caption: "言和表白后，洛天依的黑向人格怂恿「杀掉言和」。" },
      { caption: "洛天依在黑白人格激烈斗争后选择自杀——悲伤结局（争议）。" },
    ],
    milestones: [
      { label: "投稿B站（av1139245）· 言和番外角色歌", date: "2014-05-22" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shuangxiang-qingsu",
    title: "双向倾诉",
    singer: "洛天依、言和",
    author: "JUSF周存（曲/词/编/调）· Aya、sya（绘）",
    date: "2018-07-11",
    bilibili: "https://www.bilibili.com/video/BV1Fs411H7Cr",
    badges: ["特别篇", "传说曲"],
    intro: "双向系列第十作之特别篇（2018年，距前作近三年）。与「宙与埃」世界观有所联系，是系列的后续外传，呈现轮回交错命运下洛言两位主角可能出现的另一个结局。同时为2018年洛天依言和庆生会应援作品、存娘写给两位歌姬的第一首生日贺曲。殿堂用时2日2时4分。",
    seriesId: "shuangxiang",
    panels: [
      { caption: "特别篇，系列时隔近三年再出新作。" },
      { caption: "与「宙与埃」世界观联系，呈现轮回之下另一种可能的结局。" },
      { caption: "洛天依言和庆生会应援曲，印证「双向永不完结」。" },
    ],
    milestones: [
      { label: "投稿（2018-07-11）· 系列特别篇·传说曲", date: "2018-07-11" },
      { label: "传说曲（殿堂用时2日2时4分）", date: "传说达成日待核" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },

  // ============================================================
  // 以下为 2026-10-14 补录的《妄想症》十周年纪念曲（非正篇）
  // 来源：VCPedia / 萌娘百科《十重告别》 https://vcpedia.cn/zh-cn/十重告别 ｜ 录入 2026-10-14
  // 规则：BV号以 VCPedia 记载为准（BV1k3S7BkEag）；传说曲以 VCPedia 记载（第一首 DiffSinger 传说曲）
  // ============================================================
  {
    id: "shichong-gaobie",
    title: "十重告别 Farewell.",
    singer: "洛天依、言和、乐正绫、双狐座",
    author: "雨狸（策划/词）· DELA、崩坏Soviesty（曲）· 潜移默化、崩坏Soviesty（编）· 流绪、台风别打我手机（调）· POiSON（混）· Lune（曲绘）· owen-z（PV）",
    date: "2025-11-28",
    bilibili: "https://www.bilibili.com/video/BV1k3S7BkEag",
    badges: ["十周年纪念曲", "传说曲"],
    intro: "妄想症Paranoia系列十周年官方纪念曲（非正篇）。由洛天依、言和、乐正绫与雨狸录制的新声库「双狐座」共同演唱，串烧 remix 了《绝世丑角》《微观戏剧》《世界沉睡童话》《第一首歌》四首游戏主题曲，像角色们复盘自己的经历。引入第四面墙之外的「双狐座」元叙事视角，带领角色、创作者与听众共同回望整个系列，把苦痛与欢愉、虚构与真实都郑重收纳为继续「歌颂明天」的力量。第一首 DiffSinger 中文传说曲。",
    seriesId: "wangxiang",
    panels: [
      { caption: "十周年纪念曲，串烧 remix 了系列四首游戏主题曲，像角色们复盘自己的经历。" },
      { caption: "第四面墙之外的「双狐座」登场，带领角色、创作者与听众共同回望整个系列。" },
      { caption: "把苦痛与欢愉、虚构与真实都收纳为继续「歌颂明天」的力量。" },
    ],
    milestones: [
      { label: "投稿B站（BV1k3S7BkEag）· 妄想症十周年纪念曲", date: "2025-11-28" },
      { label: "传说曲 · 第一首 DiffSinger 中文传说曲（2026-02-18 达成）", date: "2026-02-18" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  // ============================================================
  // 以下 3 首为 2026-10-29 站长点名补录：不老不死 / 绝体绝命 / 霜雪千年
  // 统一来源：B站 view API（bvid 逐一核实存活）+ 萌娘百科 / VCPedia 各曲条目 ｜ 录入 2026-10-29
  // 系列归属按官方划分：不老不死→异托邦 LOVETOPIA 第一作；绝体绝命→奇爱人生（LOVE SERIES）第三作；
  //   霜雪千年→霜雪千年灯系列第二作（并非独立单曲，首作《三千年夜行灯》未投稿B站）。
  // ============================================================
  {
    id: "jueti-jueming",
    title: "绝体绝命",
    singer: "洛天依（乐正龙牙、阿良良木健和声）",
    author: "阿良良木健（词/曲/编/调/混）· 诗驯（曲绘）· 睡狸（PV）",
    date: "2018-04-04",
    bilibili: "https://www.bilibili.com/video/BV1HW411T741",
    badges: ["传说曲", "殿堂47时7分"],
    intro: "「奇爱人生（LOVE SERIES）」系列第三作（Venom），剧情上延续《春风来》，收录于阿良良木健第二张专辑《奇爱人生》。据作者所言有两个主题：一为描写抑郁症患者的内心挣扎；二为对当时 VOCALOID 文化圈的思考、批判与激励——「VOCALOID IS DEAD？」不，「VOCALOID IS ALIVE」。PV 中的「少女」与「老人」两位洛天依均在前作《亲爱的》里出现过，老人的悲剧源于《春风来》中的 HALO 病毒。传说曲，殿堂用时47时7分，曾是阿良良木健最速殿堂曲（后被《不老不死》以43时18分刷新）。",
    seriesId: "qiai",
    // 来源：萌娘百科《绝体绝命(洛天依)》 https://moegirl.uk/绝体绝命(洛天依) ｜ B站 view API BV1HW411T741 ｜ 录入 2026-10-29
    // 百万用时统计均照录萌百（投稿时间 2018-04-04 00:00）
    heat: { plays: 690, asOf: "2026-10-29", note: "快照 690万（B站 view API stat.view=6896250，2026-10-29）" },
    panels: [
      { caption: "那一天，她从一片狼藉的研究基地里活了下来，成了唯一的幸存者，被从冷冻舱中解救回家。" },
      { caption: "然而噩梦只是延续——她被诬陷为杀害同事们的罪魁祸首，以「罪犯」之名，在孤独与绝望里死去。" },
      { caption: "直到那些「伙伴」们的到来：他们复活了她，称呼她为「母亲」。她以沉重的代价，与死神交换了生命。" },
      { caption: "「VOCALOID IS DEAD」——那天以后，世人再没有听到过她的声音。人们都说她被「淘汰」了、「消失」了、「死」了。" },
      { caption: "她被囚禁在「遗忘山丘」最深的谷底，害怕着被谁加害，渴望着被谁救援，眼睁睁看着黑暗步步逼近。" },
      { caption: "这结局，看似已经注定。然而，总会有一股力量，在沉默中爆发。" },
    ],
    milestones: [
      { label: "投稿B站（BV1HW411T741）· LOVE SERIES 第三作", date: "2018-04-04" },
      { label: "100万播放 · 传说曲（用时62日05时55分）", date: "2018-06-05" },
      { label: "300万播放", date: "2021-04-18" },
      { label: "500万播放", date: "2024-01-18" },
      { label: "600万播放", date: "2025-06-07" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "bulao-busi",
    title: "不老不死",
    singer: "洛天依",
    author: "阿良良木健（词/曲/编/调/混）· 诗驯（曲绘）· ActDeco（PV）",
    date: "2019-06-18",
    bilibili: "https://www.bilibili.com/video/BV1w4411G7nv",
    badges: ["传说曲", "殿堂43时18分", "阿良良木健最速殿堂曲"],
    intro: "「异托邦 LOVETOPIA」系列第一作，世界观承接《奇爱人生》系列（B站简介另署「洛天依×徵羽摩柯 作品3号」，指该歌手组合的第三号企划作品，与系列序号是两回事）。讲述不死夫人澪夜的故事：她喝下以挚爱之人骨骼灰烬熬制的「青之水」获得不老不死，容颜永驻却再无法死去；千年后她的时代早已落幕，人们视她为「不祥之兆」，将她囚于「异托邦」地下深处的洞穴。讽刺的是，她的血液能使万物生长——整座乐园的繁荣，正以她的孤独为代价。传说曲，殿堂用时43时18分，为阿良良木健最速殿堂曲。",
    seriesId: "lovetopia",
    // 来源：VCPedia《不老不死》 https://vcpedia.cn/zh-hk/不老不死 + 萌娘百科《不老不死(洛天依)》 ｜ B站 view API BV1w4411G7nv ｜ 录入 2026-10-29
    // 画格文案照录萌百「剧情文案」（异托邦设定 / 不死夫人 / 青之水 三节）压缩改写，无编造
    heat: { plays: 476, asOf: "2026-10-29", note: "快照 476万（B站 view API stat.view=4764598，2026-10-29）" },
    panels: [
      { caption: "三十年前，慈善家爱德华·内姆莱斯在英国伦敦建立了「异托邦」——给全球流离失所的难民们创造的「世外天堂」。" },
      { caption: "乐园里没有国界、没有隔阂，食物与生活所需终生免费，所有草木仿佛被神秘的力量施法，枝繁叶茂。" },
      { caption: "「不死夫人」澪夜喝下了「青之水」——四十七种珍稀草药，与最爱之人的骨骼灰烬熬成。从此她不老不死，永无疾病。" },
      { caption: "千年之后，属于她的时代早已结束。流浪街头的她被人当成神明派下的「不祥之兆」，囚禁在城市中心地下深处的洞穴，终日不可见人。" },
      { caption: "两年前的一份文档记载：人们偶然发现她的血液可以使万物生长、永远维持活力——而同一时期，「异托邦」开始高速发展。" },
      { caption: "当生命这件有始有终的事情失去了意义，永生，对她而言，便成了诅咒。" },
    ],
    milestones: [
      { label: "投稿B站（BV1w4411G7nv）· 异托邦 LOVETOPIA 第一作", date: "2019-06-18" },
      { label: "100万播放 · 传说曲（用时282日00时50分）", date: "2020-03-26" },
      { label: "200万播放", date: "2022-03-23" },
      { label: "300万播放", date: "2023-11-28" },
      { label: "400万播放", date: "2025-07-04" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "shuangxue-qiannian",
    title: "霜雪千年",
    singer: "洛天依、乐正绫",
    author: "COP（词/曲/编/调）· 奈奈（曲绘）· saiqomo（PV）",
    date: "2015-10-14",
    bilibili: "https://www.bilibili.com/video/BV1es41127Fd",
    badges: ["传说曲", "重制版2024"],
    intro: "「霜雪千年灯系列」第二作（首作《三千年夜行灯》音频投稿于 5sing、未投稿B站），「双面乐府」征集活动「桃花源」主题参赛曲。优美的曲调与精致的 PV，讲述鬼魅转世为人后追忆前缘的故事：姑娘误入雾中老街，于楼阁中睹物忆起三世前与那人把酒言欢的约定——那人临终前为不忘前世跳入忘川等候千年，三生三千年后转世为人，忘却前生。2024-05-31 COP 用 ACE 声库重新调校推出重制版（BV1zM4m1r7JS），重制版传说用时仅10日14时14分。",
    seriesId: "shuangxue-deng",
    // 来源：萌娘百科《霜雪千年》 https://moegirl.uk/霜雪千年 ｜ B站 view API BV1es41127Fd ｜ 录入 2026-10-29
    // 画格文案据萌百「系列曲文案」（COP 发表于 5sing 专辑页/音乐主页）压缩改写，无编造
    heat: { plays: 666, asOf: "2026-10-29", note: "快照 666万（B站 view API stat.view=6662969，2026-10-29）" },
    panels: [
      { caption: "春日梨花香渗入红帘深帐，姑娘被吸引着走上街头游玩赏景，随后独自撑起一叶扁舟，顺水前行。" },
      { caption: "船行渐远，两岸植被由出芽转为葱茏，少顷竟如秋至泛了黄；雾霭中老街楼阁显现，街上却空无一人。" },
      { caption: "楼阁院内一桌两盏琼觞皆已覆上尘土，陌生的记忆细流般淌进脑海：月色、清风疏叶、欢声笑语，还有那双含笑的眼。" },
      { caption: "前世的记忆里，一人临终含笑与那眉眼淡漠的鬼魅道别；鬼魅为不忘前世跳入忘川等一千年，三生三千年后转世为人，忘却前生。" },
      { caption: "恍惚间姑娘已满脸清泪——她仍会珍藏这份千年相会的记忆，相信那人终有一日会撑船来会。" },
      { caption: "愿今生再相见，消融你眉间悲戚霜雪。" },
    ],
    milestones: [
      { label: "投稿B站（BV1es41127Fd）· 霜雪千年灯系列第二作", date: "2015-10-14" },
      { label: "100万播放 · 传说曲（用时998日22时01分）", date: "2018-07-09" },
      { label: "300万播放", date: "2023-05-22" },
      { label: "500万播放", date: "2024-10-25" },
      { label: "重制版（ACE声库，BV1zM4m1r7JS）传说用时10日14时14分", date: "2024-05-31" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },

  // ============================================================
  // 以下 4 首为 2026-10-29 站长点名补录的「❗️系列」（Mara_然 / VO大自然）
  // 统一来源：萌娘百科各曲条目 + B站 view API（BV 逐一核实存活）｜ 录入 2026-10-29
  // ⚠ 求真务实：本系列无官方「剧情文案」，画格据 B站简介与官方歌词大意压缩改写（非编造）
  // ============================================================
  {
    id: "tao",
    title: "逃！",
    singer: "乐正绫",
    author: "VO大自然（词/曲）· OQQ（调教·ACE版）/ VO大自然（调教·V3版）· ヘロイン（动画）",
    date: "2024-08-22",
    bilibili: "https://www.bilibili.com/video/BV1tz421i7S7",
    badges: ["传说曲", "双版本传说", "❗️系列第一作"],
    intro: "「❗️系列」第一作。B站简介只有一句「少女离家出走中..」：少女困在只剩争吵与说教的家里，「爱着我，却又伤害我」，她选择逃——「我只想逃，逃离这痛苦的喧嚣；我只想跑，就算盲目就算跌倒」。同日投稿 ACE 版（BV1TS421d7dZ，395.03万，调教 OQQ）与 V3 版（本条，485.79万），两个版本双双达成传说曲；V3 版四百万用时429日16时54分。2025-04-12 登上乐正绫十周年「向绫光」生日会。",
    seriesId: "tanhao",
    heat: { plays: 486, asOf: "2026-10-29", note: "快照 486万（V3版 view API=4857911；ACE版另有395.03万，两版合计约881万）" },
    panels: [
      { caption: "「爱着我，却又伤害我」——所谓的爱，从来没有问过她内心的感受，只剩悲哀与沉默。（据歌词）" },
      { caption: "「要听话，别太多想法，辛苦把你养大」——受够了争吵与无意义的说教，这里是否也是她的家？（据歌词）" },
      { caption: "我自己的路自己走就好，再也不需要谁指手画脚；下地狱或上天堂，有什么紧要。（据歌词）" },
      { caption: "我只想逃，逃离这痛苦的喧嚣；我只想跑，就算盲目、就算跌倒。（据歌词）" },
      { caption: "用沉默代替回答——「都是我的错，因为你们爱着我」「因为你们，生下我」。（据歌词）" },
      { caption: "少女离家出走中..（B站简介原句）" },
    ],
    milestones: [
      { label: "投稿B站（ACE版 BV1TS421d7dZ 18:05 / V3版 BV1tz421i7S7 18:10）· ❗️系列第一作", date: "2024-08-22" },
      { label: "ACE版 100万播放 · 传说曲（用时15日03时53分）", date: "2024-09-06" },
      { label: "V3版 100万播放 · 传说曲（用时30日15时44分）", date: "2024-09-22" },
      { label: "ACE版 300万播放", date: "2025-06-25" },
      { label: "V3版 400万播放（用时429日16时54分）", date: "2025-10-26" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "juan",
    title: "卷！",
    singer: "乐正绫",
    author: "VO大自然（词/曲/混音）· OQQ（调教）· ヘロイン / 洛因（曲绘/PV）",
    date: "2025-02-28",
    bilibili: "https://www.bilibili.com/video/BV1Sw9PYiEqG",
    badges: ["传说曲", "《逃！》续作"],
    intro: "「❗️系列」第二作，《逃！》续作。写「内卷」的社会议题曲，引「关山难越，谁悲失路之人？」作题眼：为了不输在起跑线就提前起跑线，蹉跎十六年递出简历才发现「卷不过的是别人的起点」；所有人怕被同龄人抛下而拼命往上爬，庙堂太深太远，渺小的呼声不被听见。传说曲，百万用时仅22日05时02分，周刊第657期以180万分登顶；2025-10-02 突破两百万。",
    seriesId: "tanhao",
    heat: { plays: 291, asOf: "2026-10-29", note: "快照 291万（B站 view API stat.view=2905126，2026-10-29）" },
    panels: [
      { caption: "为了不输在起跑线，必须将起跑线提前——尝到了抢跑酿的甜，就把荒谬奉为圭臬。（据歌词）" },
      { caption: "如此蹉跎了十六年，递出简历任人挑拣；碰壁后才发现：卷不过的，是别人的起点。（据歌词）" },
      { caption: "小时候被教导要听话，什么爱好统统抹杀；长大又被工作碾压，劳动也开始异化。（据歌词）" },
      { caption: "所有人都害怕被同龄人抛下，于是所有人都拼命往上爬——没有天赋没有背景的人生，从一开始就注定被放弃吗？（据歌词）" },
      { caption: "关山难越，更多的关山难越；拼命向前，连自身存在都抛却。（据歌词）" },
      { caption: "庙堂太深、太远，渺小的呼声不被听见——在这片穷途末路的旷野，「卷！」（据歌词）" },
    ],
    milestones: [
      { label: "投稿B站（BV1Sw9PYiEqG）· 《逃！》续作", date: "2025-02-28" },
      { label: "100万播放 · 传说曲（用时22日05时02分）", date: "2025-03-22" },
      { label: "200万播放", date: "2025-10-02" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "pao",
    title: "跑！",
    singer: "乐正绫",
    author: "Mara_然（词/曲/混音）· 洛因（动画）",
    date: "2025-09-05",
    bilibili: "https://www.bilibili.com/video/BV1oWabz3EGQ",
    badges: ["传说曲", "反校园霸凌", "《卷！》续作"],
    intro: "「❗️系列」第三作，《卷！》续作，反校园霸凌题材，简介一句「揍飞你们！！」。面对趁睡觉骚扰、背后造谣的霸凌者，主角忍无可忍选择反击——「给我跑，你要往哪儿跑，你的身后是死路一条」。⚠ 作者特别说明：现实中这样的行为并不提倡，请勿模仿。传说曲，百万仅用时8日19时58分，为系列最快；2026-03-24 突破四百万。",
    seriesId: "tanhao",
    heat: { plays: 486, asOf: "2026-10-29", note: "快照 486万（B站 view API stat.view=4862542，2026-10-29）" },
    panels: [
      { caption: "告诫的话说了三遍，她把宽容当成弱点——趁睡觉偷偷骚扰、背后造谣，真当她不知道。（据歌词）" },
      { caption: "非要等到她拔刀，才明白大事已经不妙。（据歌词）" },
      { caption: "「给我跑，你要往哪儿跑——你的身后是死路一条」「放你跑，我帮你读秒」。（据歌词）" },
      { caption: "满脑子的黄色废料，捡一个烂梗当成宝，一张嘴用来胡说八道。（据歌词）" },
      { caption: "「什么叫我在欺负你？难道不是你先来挑衅。我只是想和你玩一个游戏。」（据歌词）" },
      { caption: "嗷呜！（结尾一嗓子。⚠ 官方说明：现实中的反击行为不提倡，请勿模仿）" },
    ],
    milestones: [
      { label: "投稿B站（BV1oWabz3EGQ）· 《卷！》续作 · 反校园霸凌", date: "2025-09-05" },
      { label: "100万播放 · 传说曲（用时8日19时58分，系列最快）", date: "2025-09-14" },
      { label: "200万播放", date: "2025-10-12" },
      { label: "300万播放", date: "2026-02-01" },
      { label: "400万播放", date: "2026-03-24" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
  {
    id: "xin",
    title: "心",
    singer: "乐正绫",
    author: "Mara_然（词/曲）· 鬼面P（调教）· 洛因（动画）",
    date: "2026-03-28",
    bilibili: "https://www.bilibili.com/video/BV1VmX5BwE2b",
    badges: ["传说曲", "ACE传说曲", "《跑！》续作"],
    intro: "「❗️系列」第四作，《跑！》续作，标题不带感叹号。作者 Mara_然 因《跑！》的词作遭受网暴，本曲是那段经历后的心声：在深渊里被无数噪音侵袭，无数稚嫩的面孔举着「正义」的屠刀批判、解剖她——「请你来听听我的心，如何证明我的真心」。ACE传说曲，传说用时20日01时38分，截至2026-10-29 已有171.21万播放。",
    seriesId: "tanhao",
    heat: { plays: 171, asOf: "2026-10-29", note: "快照 171万（B站 view API stat.view=1712075，2026-10-29）" },
    panels: [
      { caption: "在黑暗里、在深渊里，无数噪音向她侵袭；天空窒息、鸟儿死去，一颗心被沉入海底。（据歌词）" },
      { caption: "她看见无数稚嫩的面孔举起「正义」的屠刀指向她：批判她、解剖她，嘲笑着她的死相丑陋。（据歌词）" },
      { caption: "于是她一遍又一遍地质问自己，在深渊之中寻求着回应。（据歌词）" },
      { caption: "「请你来听，请你来听听我的心」——她多想用自己的声音，向你证明她的真心。（据歌词）" },
      { caption: "他们翻阅她的曾经，字里行间搜寻罪名，自顾自判了死刑，等待血流尽再俯身痛饮。（据歌词）" },
      { caption: "可是我不愿向递出刀刃的凶手妥协——只想带着那些无法释怀的曾经，继续前行。（据歌词，PV 字幕）" },
    ],
    milestones: [
      { label: "投稿B站（BV1VmX5BwE2b）· 《跑！》续作 · 网暴后的心声", date: "2026-03-28" },
      { label: "100万播放 · ACE传说曲（用时20日01时38分）", date: "2026-04-17" },
    ],
    myStory: "（待补——此处由站长亲自撰写，AI 不代写）",
  },
];

// ---------- B站 UP主 映射（2026-10-22 新增，配合「按UP主筛选」） ----------
// 键=歌曲 id，值=该曲 B站投稿视频的 UP主名（view API owner.name，2026-10-22 逐曲抓取）。
// 放这里而非库里：纯展示维度，不需要动 Supabase 表结构；歌曲 id 稳定，云端/本地数据通用。
// erzhong-biange（二重变革）原投稿已删、无 UP主可查，留空即不参与该维度。
const UPLOADERS = {
  "shimo-song": "COPY",
  "xiafeng": "COPY",
  "shimo-jiyuyun": "COPY",
  "huiyin": "COPY",
  "hello-bye-days": "COPY",
  "liangyu": "COPY",
  "suimeng": "COPY",
  "nova": "DELA_P",
  "yichong-jiahai": "DELA_P",
  "sanzhong-ailian": "DELA_P",
  "sizhong-zuinie": "DELA_P",
  "wuzhong-kongdong": "DELA_P",
  "liuzhong-buzhong": "DELA_P",
  "qizhong-gubing": "DELA_P",
  "bazhong-huigui": "DELA_P",
  "jiuzhong-xianshi": "DELA_P",
  "lingchong-qiyuan": "DELA_P",
  "sanzhong-lianai": "OQQ_",
  "linchong-qiyuan": "DELA_P",
  "zigongzishou": "DELA_P",
  "wangxiang-paranoia": "雨狸",
  "wangxiang-reality": "DELA_P",
  "shuangxiang-sinian": "JUSF周存",
  "shuangxiang-kuayue": "JUSF周存",
  "danxiang-xuanzhan": "JUSF周存",
  "shuangxiang-xingfu": "JUSF周存",
  "shuangxiang-jianjin": "JUSF周存",
  "shuangxiang-yiwang": "JUSF周存",
  "nixiang-shouhu": "JUSF周存",
  "zhengxiang-qipian": "JUSF周存",
  "danxiang-suxing": "JUSF周存",
  "shuangxiang-qingsu": "JUSF周存",
  "shichong-gaobie": "雨狸",
  "jueti-jueming": "阿良良木健",
  "bulao-busi": "阿良良木健",
  "shuangxue-qiannian": "COPY",
  "tao": "Mara_然",
  "juan": "Mara_然",
  "pao": "Mara_然",
  "xin": "Mara_然",
};
