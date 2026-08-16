const fs = require("fs");
const path = require("path");

const week = 8;
const today = "2026-08-16";
const outputDir = "weeks/week-08";
const memory = JSON.parse(fs.readFileSync("memory.json", "utf8"));
const punct = new Set(["，", "。", "：", "；", "？", "！", "“", "”", "《", "》", "、", "（", "）", "—", "…"]);

// Reuse every annotation the learner has already seen. This lets Week 8 use familiar
// language while keeping broad tap coverage and a trustworthy unknown-rate denominator.
const lex = new Map();
for (let priorWeek = 1; priorWeek <= 7; priorWeek++) {
  const dir = `weeks/week-${String(priorWeek).padStart(2, "0")}`;
  const index = JSON.parse(fs.readFileSync(`${dir}/index.json`, "utf8"));
  for (const meta of index.articles) {
    const file = `${dir}/${meta.id}.json`;
    if (!fs.existsSync(file)) continue;
    const article = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const token of article.tokens || []) {
      if (!token.punct && token.py && token.g && !lex.has(token.t)) {
        lex.set(token.t, { py: token.py, g: token.g });
      }
    }
  }
}
for (const word of memory.words) {
  if (word.py && word.g && !lex.has(word.t)) lex.set(word.t, { py: word.py, g: word.g });
}

const additions = {
  改口: ["gǎikǒu", "change what one says"], 固执: ["gùzhí", "stubborn"], 修正: ["xiūzhèng", "revise/correct"],
  立场: ["lìchǎng", "position/stance"], 丢脸: ["diūliǎn", "lose face"], 有限: ["yǒuxiàn", "limited"],
  预售: ["yùshòu", "presale"], 定金: ["dìngjīn", "deposit"], 退款: ["tuìkuǎn", "refund"],
  面包店: ["miànbāodiàn", "bakery"], 柜台: ["guìtái", "counter"], 口味: ["kǒuwèi", "flavor"],
  面包: ["miànbāo", "bread"], 顾客: ["gùkè", "customer"], 预订: ["yùdìng", "reserve/preorder"],
  朋友: ["péngyou", "friend"], 店: ["diàn", "shop"],
  更夫: ["gēngfū", "night watchman"], 打更: ["dǎgēng", "sound the night watch"], 时辰: ["shíchen", "traditional time period"],
  铜锣: ["tóngluó", "gong"], 木梆: ["mùbāng", "wooden clapper"], 巡夜: ["xúnyè", "patrol at night"],
  失火: ["shīhuǒ", "catch fire"], 小偷: ["xiǎotōu", "thief"], 城门: ["chéngmén", "city gate"],
  钟表: ["zhōngbiǎo", "clock/watch"], 城里: ["chénglǐ", "in the city"], 街道: ["jiēdào", "street"],
  居民: ["jūmín", "resident"], 报时: ["bàoshí", "announce the time"], 休息: ["xiūxi", "rest"],
  行星: ["xíngxīng", "planet"], 凌日: ["língrì", "transit across a star"], 轨道: ["guǐdào", "orbit"],
  周期: ["zhōuqī", "cycle/period"], 恒星: ["héngxīng", "star"], 亮度: ["liàngdù", "brightness"],
  挡住: ["dǎngzhù", "block"], 重复出现: ["chóngfù chūxiàn", "appear repeatedly"],
  固定支出: ["gùdìng zhīchū", "fixed expense"], 自动转账: ["zìdòng zhuǎnzhàng", "automatic transfer"], 余地: ["yúdì", "room/margin"],
  工资单: ["gōngzīdān", "payslip"], 房租: ["fángzū", "rent"], 预算: ["yùsuàn", "budget"],
  剩下: ["shèngxia", "remain"], 奖励: ["jiǎnglì", "reward"], 惩罚: ["chéngfá", "punishment"],
  试探: ["shìtàn", "probe/test"], 遗憾: ["yíhàn", "regret"], 资格: ["zīgé", "qualification"],
  手腕: ["shǒuwàn", "wrist"], 医院: ["yīyuàn", "hospital"], 教训: ["jiàoxun", "lesson"],
  保护: ["bǎohù", "protect"], 反应: ["fǎnyìng", "reaction"], 计时器: ["jìshíqì", "timer"],
  合格: ["hégé", "qualified"], 对手: ["duìshǒu", "opponent"], 挨打: ["áidǎ", "take a beating"],
  周岚: ["Zhōu Lán", "Zhou Lan, the coach"], 林野: ["Lín Yě", "Lin Ye, the gym assistant"],
  小雨: ["Xiǎo Yǔ", "Xiao Yu"], 阿哲: ["Ā Zhé", "A-Zhe"], 陈叔: ["Chén shū", "Uncle Chen"],
};
for (const [text, [py, g]] of Object.entries(additions)) lex.set(text, { py, g });

const articles = [
  {
    day: 1, type: "dialogue", topic: "philosophy", register: "informal", target_level: "HSK5",
    title: "改变想法，是不是输了？",
    stretch_words: ["改口", "固执", "修正"], review_words: ["成熟", "代价", "原则"],
    names: { 小雨: "Xiao Yu", 阿哲: "A-Zhe" },
    paragraphs: [
      "小雨 跟 阿哲 说 ： “ 我 昨天 还 支持 那个 计划 ， 今天 却 觉得 它 不 合适 。 如果 我 现在 改口 ， 别人 会不会 觉得 我 没有 立场 ？ ”",
      "阿哲 问 ： “ 你 是 因为 怕 别人 反对 ， 还是 因为 看到 了 新的 证据 ？ ” 小雨 说 ， 新的 数字 说明 计划 的 代价 比 原来 高 很多 。",
      "“ 那么 改变 想法 不一定 是 丢脸 ， 也 可能 是 修正 判断 。 真正 的 原则 不是 永远 说 同一句 话 ， 而是 发现 自己 错了 以后 愿意 承认 。 ”",
      "小雨 还是 有点 担心 ： “ 可是 别人 会 说 我 前后 不一样 。 ” 阿哲 笑了 ： “ 人 的 了解 本来 就 有限 。 如果 证据 变了 ， 判断 当然 也 可以 变 。 ”",
      "“ 那 什么 才 叫 固执 ？ ” “ 明明 知道 原来的 理由 已经 不成立 ， 却 只 为了 面子 拒绝 重新 判断 。 成熟 不是 从不 改口 ， 而是 能 说明 自己 为什么 改 。 ”",
      "小雨 想了想 ， 决定 在 明天 的 讨论 中 先 讲 原来的 理由 ， 再 讲 新 数字 改变 了 什么 。 她 不需要 假装 自己 从来 没有 判断 错 ， 也 不需要 把 每次 改变 都 看成 失败 。",
    ],
    comprehension: [
      { type: "true_false", q: "小雨改变想法，是因为朋友要求她反对计划。", answer: false },
      { type: "multiple_choice", q: "小雨为什么觉得原来的计划不合适？", options: ["她已经完全忘记原来的讨论", "朋友要求她立刻换一个立场", "新数字说明计划的代价比原来高", "她希望所有人都马上接受她的新想法"], answer_index: 2 },
      { type: "multiple_choice", q: "按照阿哲的说法，哪种情况更像固执？", options: ["证据变了却为了面子拒绝重新判断", "说明改变想法的真实原因", "承认自己的了解可能有限", "先听完不同意见再作判断"], answer_index: 0 },
    ],
  },
  {
    day: 2, type: "article", topic: "venture capital", register: "formal", target_level: "HSK5",
    title: "先卖十份，再决定开店",
    stretch_words: ["预售", "定金", "退款"], review_words: ["需求", "验证", "承诺"],
    paragraphs: [
      "一位 年轻人 想 开 一家 面包店 。 他 做 了 很 漂亮 的 计划 ， 还 问 了 很多 朋友 。 大家 都 说 喜欢 ， 可是 投资人 仍然 问 ： “ 有 多少 人 真的 愿意 付钱 ？ ”",
      "于是 他 没有 马上 租 店 ， 而是 先 做 了 十份 周末 面包 。 顾客 可以 付 一点 定金 预订 ， 如果 不 满意 ， 随时 可以 退款 。 这个 方法 很 小 ， 却 能 验证 真实 的 需求 。",
      "第一周 ， 有 三十 人 表示 有 兴趣 ， 但 只有 八人 付 了 定金 。 年轻人 没有 难过 。 他 发现 ， 大家 最 喜欢 的 不是 他 原来 准备 的 口味 ， 而是 一种 更 普通 的 面包 。",
      "第二周 ， 他 改了 口味 和 价格 ， 十份 全部 卖完 。 这 还 不能 证明 一家 大店 一定 会 成功 ， 但 比 客气 的 称赞 更 有用 。 付钱 是 一个 小小 的 承诺 ， 也 给 计划 带来 可以 比较 的 结果 。",
      "如果 一开始 就 租 店 ， 他 可能 要 花 很多 钱 才 发现 口味 不对 。 小规模 的 预售 让 他 能 较早 改正 ， 即使 需要 退款 ， 花掉 的 钱 也 不会 太多 。",
      "对 刚 开始 的 生意 来说 ， 先 完成 一次 小 买卖 ， 往往 比 先 做 一个 很 大 的 梦 更 安全 。",
    ],
    comprehension: [
      { type: "true_false", q: "年轻人一开始就租下了一家很大的店。", answer: false },
      { type: "multiple_choice", q: "年轻人怎样先验证真实需求？", options: ["先接受十份可以退款的预订", "请所有朋友继续称赞他的计划", "直接借钱租下更大的店面", "把每一种面包都免费送给路人品尝"], answer_index: 0 },
      { type: "multiple_choice", q: "为什么付款比口头称赞更有用？", options: ["因为付款以后就肯定能让大店成功", "因为朋友从来不会说真实想法", "因为价格越高就代表口味越好", "因为顾客愿意承担一点真实成本"], answer_index: 3 },
    ],
  },
  {
    day: 3, type: "article", topic: "history", register: "formal", target_level: "HSK5",
    title: "没有钟表的夜里，人们怎么知道时间？",
    stretch_words: ["更夫", "打更", "时辰"], review_words: ["紧急", "携带", "防止"],
    paragraphs: [
      "在 没有 手机 和 家用 钟表 的 时代 ， 城里 的 人 到了 夜间 ， 怎么 知道 大概 的 时辰 ？ 很多 地方 靠 更夫 巡夜 和 打更 。",
      "更夫 常常 携带 铜锣 或 木梆 ， 一边 走过 街道 ， 一边 按 不同 的 次数 发出 声音 。 居民 听到 声音 ， 就 知道 夜 已经 到了 哪个 时辰 。 这 像 一个 大家 都 能 听见 的 钟 。",
      "不过 ， 报时 只是 更夫 的 一项 工作 。 过去 的 房屋 多 用 木头 建造 ， 夜里 失火 特别 危险 。 更夫 要 注意 烟 和 火光 ， 也 要 防止 小偷 进入 安静 的 街道 。",
      "遇到 紧急 情况 时 ， 他 会 改变 敲击 的 方式 ， 让 居民 开门 帮忙 。 有些 城门 是否 关闭 ， 也 会 参考 打更 的 时间 。 因此 ， 人们 听到 的 不只是 时间 ， 还是 城市 夜间 的 安排 。",
      "不同 地方 的 打更 方法 不完全 一样 ， 但 作用 很 接近 ： 当 大多数 人 看不到 准确 时间 时 ， 由 一个 不断 走动 的 人 把 时间 送到 每条 街 。",
      "更夫 的 声音 可能 打扰 休息 ， 却 让 很多 家庭 共享 同一个 时间 ， 也 让 黑暗 的 街道 多 一层 安全 。",
    ],
    comprehension: [
      { type: "true_false", q: "更夫的工作只有告诉居民时间。", answer: false },
      { type: "multiple_choice", q: "居民怎样判断大概的时辰？", options: ["观察每家门口灯光亮起和熄灭的时间", "听更夫敲击铜锣或木梆的次数", "等待城门每天自动打开", "阅读更夫写下的详细记录"], answer_index: 1 },
      { type: "multiple_choice", q: "文章为什么把更夫比作移动的公共时钟？", options: ["因为他负责修理每户人家的钟", "因为他总是住在城市的中心", "因为他沿街用声音向很多人报时", "因为他的工具可以自己计算准确时间"], answer_index: 2 },
    ],
  },
  {
    day: 4, type: "article", topic: "astrophysics", register: "formal", target_level: "HSK5",
    title: "看不见那颗行星，怎么知道它在那里？",
    stretch_words: ["凌日", "轨道", "周期"], review_words: ["预测", "证据", "观察"],
    paragraphs: [
      "离 地球 很 远 的 行星 本身 不会 发光 ， 又 常常 被 恒星 的 强光 挡住 。 天文学家 很难 亲眼 看见 它们 ， 但 可以 观察 恒星 亮度 的 小 变化 。",
      "如果 一颗 行星 从 恒星 前面 经过 ， 它 会 挡住 一小部分 光 。 这种 现象 叫 凌日 。 对 我们 来说 ， 恒星 只是 稍微 暗了 一点 ， 过 一段 时间 又 变回 原来的 亮度 。",
      "一次 变暗 还 不能 说明 太多 。 可能 是 仪器 出错 ， 也 可能 是 其他 原因 。 只有 相似 的 变化 按 固定 周期 重复出现 ， 天文学家 才 会 判断 那里 可能 有 一颗 行星 。",
      "变暗 的 程度 可以 帮助 研究者 估计 行星 的 大小 ， 两次 变化 之间 的 时间 则 可以 说明 它 的 轨道 周期 。 多次 观察 放在 一起 ， 就 成了 更 可靠 的 证据 。",
      "为了 排除 偶然 情况 ， 不同 的 研究者 还 会 比较 多次 记录 。 如果 变化 出现 的 时间 总是 接近 ， 而且 大小 相似 ， 判断 才 会 慢慢 变得 稳定 。",
      "科学 有时 不是 亲眼 看见 答案 ， 而是 先 预测 某种 变化 ， 再 用 重复 的 记录 看看 这个 判断 。 看不见 的 行星 ， 就 这样 留下 了 自己 的 影子 。",
    ],
    comprehension: [
      { type: "true_false", q: "一次亮度变化就足以证明一定存在行星。", answer: false },
      { type: "multiple_choice", q: "什么是文章所说的凌日？", options: ["恒星突然停止向周围发出任何光", "仪器因为太热而失去作用", "行星离开原来的运行方向", "行星经过恒星前面并挡住少量光"], answer_index: 3 },
      { type: "multiple_choice", q: "怎样的证据会让判断更可靠？", options: ["只记录一次特别明显的变化", "相似的亮度变化按固定周期出现", "先相信结论再忽略不同记录", "直接用肉眼寻找很远的小行星"], answer_index: 1 },
    ],
  },
  {
    day: 5, type: "dialogue", topic: "finance", register: "informal", target_level: "HSK5",
    title: "工资涨了，为什么还是存不下钱？",
    stretch_words: ["固定支出", "自动转账", "余地"], review_words: ["储备", "支撑", "调整"],
    paragraphs: [
      "阿哲 看着 工资单 说 ： “ 我 的 工资 比 去年 高了 ， 可 到 月底 还是 没有 剩下 多少 钱 。 是不是 我 根本 不 会 做 预算 ？ ”",
      "小雨 问 他 ： “ 工资 到账 后 ， 你 先 存钱 ， 还是 花完 再 看 剩下 多少 ？ ” 阿哲 想了想 ： “ 我 总 觉得 下个月 再 开始 也 不晚 。 ”",
      "“ 那 就 把 顺序 调整 一下 。 工资 到账 的 第二天 ， 用 自动转账 把 一小部分 放进 储备 账户 。 数字 不必 很 大 ， 重点 是 先 完成 。 ”",
      "阿哲 担心 这样 会让 生活 没有 余地 。 小雨 让 他 先 写下 房租 、 交通 和 吃饭 等 固定支出 ， 再 留 一笔 可以 自由 使用 的 钱 。 “ 预算 不是 惩罚 ， 它 是 告诉 你 哪些 选择 能 被 收入 支撑 。 ”",
      "“ 如果 突然 要 看 医生 呢 ？ ” “ 所以 才 需要 储备 。 它 不是 为了 让 账户 看起来 漂亮 ， 而是 避免 一次 意外 打乱 几个月 的 计划 。 ”",
      "小雨 还 建议 他 每个月 只 检查 一两次 ， 不要 每天 因为 一个 小 支出 就 责怪 自己 。 只要 总的 方向 没有 变化 ， 预算 也 可以 根据 生活 慢慢 调整 。",
      "阿哲 点头 ： “ 原来 存钱 不是 等 月底 出现 奇迹 ， 而是 工资 到账 时 就 给 它 一个 位置 。 ”",
    ],
    comprehension: [
      { type: "true_false", q: "小雨建议阿哲把所有可以自由使用的钱都取消。", answer: false },
      { type: "multiple_choice", q: "小雨建议阿哲怎样改变存钱顺序？", options: ["等月底有钱剩下时再考虑存钱", "把房租和交通费用全部取消", "工资到账后先自动转出一小部分", "每个月都换一个完全不同的新计划"], answer_index: 2 },
      { type: "multiple_choice", q: "储备的主要作用是什么？", options: ["让所有朋友觉得账户里的数字更加漂亮", "保证工资以后一定会继续上涨", "把每个月可以使用的钱全部锁住", "减少意外对以后几个月计划的影响"], answer_index: 3 },
    ],
  },
  {
    day: 6, type: "story", topic: "fighter/martial-artist", register: "narrative", target_level: "HSK5",
    title: "《逆风拳馆》第二章：照片背后的约定",
    stretch_words: ["试探", "遗憾", "资格"], review_words: ["报名表", "器材", "倔强"],
    names: { 林野: "Lin Ye, the gym assistant", 周岚: "Zhou Lan, the coach", 陈叔: "Uncle Chen" },
    paragraphs: [
      "第二天 早上 ， 林野 发现 报名表 已经 放在 柜台 上 ， 教练 签名 的 地方 仍然 空着 。 周岚 没有 提 那张 旧 照片 ， 只 让 他 戴好 护具 。",
      "“ 想 比赛 ， 先 证明 你 有 资格 。 ” 她 把 计时器 设成 三分钟 ， 让 林野 连续 完成 基本 动作 。 林野 的 速度 很 稳 ， 可 到 最后 半分钟 ， 手腕 开始 发抖 。",
      "周岚 突然 向前 试探 。 林野 急着 反击 ， 立刻 失去 了 保护 。 “ 你 看 ， ” 周岚 关掉 计时器 ， “ 你 不是 没有 本领 ， 是 太 想 证明 自己 。 真正 的 对手 会 等 你 着急 。 ”",
      "林野 沉默 一会儿 ， 问 ： “ 你 认识 我 父亲 ， 对不对 ？ ” 周岚 的 眼神 变了 。 她 说 ， 很多年 前 ， 林野 的 父亲 在 一场 比赛 中 受伤 ， 后来 要求 她 别 让 儿子 走 同一条 路 。",
      "“ 他 后悔 比赛 吗 ？ ” “ 他 遗憾 的 不是 上台 ， 是 把 倔强 当成 勇敢 ， 受伤 后 也 不肯 到 医院 。 ” 周岚 把 报名表 推回 ： “ 我 可以 给 你 一次 机会 ， 但 你 要 学会 停下 。 ”",
      "下午 ， 两人 正在 收拾 器材 ， 门外 来了 一个 叫 陈叔 的 男人 。 他 看见 林野 ， 轻声 说 ： “ 你的 反应 跟 你 父亲 一样 。 可 他 留下 的 教训 ， 周岚 只 告诉 了 你 一半 。 ”",
    ],
    comprehension: [
      { type: "true_false", q: "周岚已经在报名表上签了名。", answer: false },
      { type: "multiple_choice", q: "周岚发现林野训练时的主要问题是什么？", options: ["他完全不记得任何基本动作", "他因为害怕所以拒绝继续训练", "他太想证明自己，着急时失去保护", "他的手腕受伤后仍然拒绝前往医院检查"], answer_index: 2 },
      { type: "multiple_choice", q: "章节结尾出现了什么新的疑问？", options: ["拳馆的所有器材为什么突然不见了", "比赛为什么决定取消这个量级", "林野为什么不愿意填写报名表", "周岚是否隐瞒了林野父亲的另一半故事"], answer_index: 3 },
    ],
  },
];

function tokenize(article) {
  const tokens = [];
  const firstNames = new Set();
  for (let p = 0; p < article.paragraphs.length; p++) {
    if (p > 0) tokens.push({ t: "\n", punct: true });
    for (const piece of article.paragraphs[p].trim().split(/\s+/)) {
      if ([...piece].every((char) => punct.has(char))) {
        for (const char of piece) tokens.push({ t: char, punct: true });
        continue;
      }
      const entry = lex.get(piece);
      const token = entry ? { t: piece, py: entry.py, g: entry.g } : { t: piece };
      if (article.names && article.names[piece]) {
        token.name = true;
        token.g = article.names[piece];
        if (!firstNames.has(piece)) { token.first = true; firstNames.add(piece); }
      }
      tokens.push(token);
    }
  }
  return tokens;
}

function word(text) {
  const item = memory.words.find((candidate) => candidate.t === text);
  if (!item) throw new Error(`Review word missing from memory: ${text}`);
  return { t: item.t, py: item.py, g: item.g };
}

function buildReviewDay() {
  const eligible = memory.words.filter((item) => item.first_seen < today);
  const items = [
    { format: "matching", pairs: ["将", "估值", "超额", "机构", "摄入"].map(word) },
    { format: "recognition_mc", word: word("话语权"), prompt: "话语权的意思是：", options: ["method for delaying payment", "power to shape public debate", "signal used by a night watch", "habit of changing one's mind"], answer_index: 1 },
    { format: "recognition_mc", word: word("注定"), prompt: "注定的意思是：", options: ["be carefully repaired", "be openly discussed", "be destined to happen", "be divided into parts"], answer_index: 2 },
    { format: "recognition_mc", word: word("坐标"), prompt: "坐标的意思是：", options: ["positioning coordinates", "temporary payment record", "public speaking rights", "personal sleep schedule"], answer_index: 0 },
    { format: "reverse_recall_mc", word: word("假动作"), prompt: "“feint / fake move”用中文怎么说？", options: ["真本领", "旧姿势", "慢节奏", "假动作"], answer_index: 3 },
    { format: "reverse_recall_mc", word: word("预测"), prompt: "“predict / forecast”用中文怎么说？", options: ["拒绝", "调整", "预测", "观察"], answer_index: 2 },
    { format: "reverse_recall_mc", word: word("格局"), prompt: "“overall pattern / landscape”用中文怎么说？", options: ["格局", "机构", "证据", "冲击"], answer_index: 0 },
    { format: "cloze", word: word("预言"), sentence: "古人把突然出现的星看成王朝变化的___。", options: ["估值", "预言", "坐标", "摄入"], answer_index: 1 },
    { format: "cloze", word: word("延迟"), sentence: "道路被暴雨冲坏，公文的送达出现了___。", options: ["边界", "和解", "延迟", "估值"], answer_index: 2 },
    { format: "cloze", word: word("博弈"), sentence: "谈判桌上的条件，是双方长期___的一部分。", options: ["失眠", "博弈", "留存", "道歉"], answer_index: 1 },
    { format: "cloze", word: word("暗物质"), sentence: "天文学家看不见___，却能研究它的引力影响。", options: ["现金流", "供应链", "驿站", "暗物质"], answer_index: 3 },
    { format: "cloze", word: word("机构"), sentence: "这家研究___准备公布新的睡眠报告。", options: ["机构", "坐标", "宵禁", "冲击"], answer_index: 0 },
    { format: "cloze", word: word("重塑"), sentence: "新的航线可能___整个地区的贸易格局。", options: ["延迟", "重塑", "摄入", "注定"], answer_index: 1 },
    { format: "flashcard_selfrate", word: word("话语权"), prompt: "话语权", back: `${word("话语权").py} — ${word("话语权").g}` },
    { format: "flashcard_selfrate", word: word("注定"), prompt: "注定", back: `${word("注定").py} — ${word("注定").g}` },
  ];
  return { id: "w8d7", week, day: 7, type: "review", title: "复习", eligible_word_count: eligible.length, items };
}

function chineseCharCount(tokens) {
  return tokens.reduce((sum, token) => sum + [...token.t].filter((char) => /\p{Script=Han}/u.test(char)).length, 0);
}

function enforceQuestionBalance(sourceArticles) {
  const questions = sourceArticles.flatMap((article) =>
    article.comprehension.filter((question) => question.type === "multiple_choice"),
  );
  const positions = [0, 0, 0, 0];
  let uniquelyLongest = 0;
  for (const question of questions) {
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error("Every multiple-choice question must have four options.");
    }
    if (!Number.isInteger(question.answer_index) || question.answer_index < 0 || question.answer_index > 3) {
      throw new Error("Every multiple-choice question must have a valid answer_index.");
    }
    positions[question.answer_index] += 1;
    const lengths = question.options.map((option) => [...option].length);
    const longest = Math.max(...lengths);
    if (longest - Math.min(...lengths) > 6) {
      throw new Error(`Multiple-choice option lengths are too uneven: ${lengths.join(", ")}`);
    }
    if (
      lengths[question.answer_index] === longest &&
      lengths.filter((length) => length === longest).length === 1
    ) uniquelyLongest += 1;
  }
  if (uniquelyLongest > Math.floor(questions.length * 0.25)) {
    throw new Error(`Correct answer is uniquely longest in ${uniquelyLongest}/${questions.length} questions.`);
  }
  if (positions.some((count) => count < 2 || count > 4)) {
    throw new Error(`Correct-answer positions are unbalanced: ${positions.join(", ")}`);
  }
}

enforceQuestionBalance(articles);
fs.mkdirSync(outputDir, { recursive: true });
const summaries = [];
for (const article of articles) {
  const tokens = tokenize(article);
  const file = {
    id: `w8d${article.day}`, week, day: article.day, type: article.type, topic: article.topic,
    register: article.register, target_level: article.target_level, title: article.title, tokens,
    stretch_words: article.stretch_words, review_words: article.review_words,
    difficulty_design: { target_unknown_rate: 0.1, new_stretch_word_budget: 3, review_word_budget: 3 },
    comprehension: article.comprehension,
  };
  fs.writeFileSync(path.join(outputDir, `${file.id}.json`), `${JSON.stringify(file, null, 2)}\n`, "utf8");
  const meaningful = tokens.filter((token) => !token.punct);
  const tappable = meaningful.filter((token) => token.py && token.g);
  const priorUnknown = new Set(memory.words.filter((item) => item.status !== "known").map((item) => item.t));
  summaries.push({
    id: file.id, title: file.title, chars: chineseCharCount(tokens), meaningful: meaningful.length,
    tappable: tappable.length, coverage: +(tappable.length / meaningful.length).toFixed(3),
    plain: [...new Set(meaningful.filter((token) => !token.py).map((token) => token.t))],
    priorUnknownUsed: [...new Set(meaningful.filter((token) => priorUnknown.has(token.t)).map((token) => token.t))],
  });
}

const review = buildReviewDay();
fs.writeFileSync(path.join(outputDir, "w8d7.json"), `${JSON.stringify(review, null, 2)}\n`, "utf8");
const index = {
  week,
  articles: [
    ...articles.map((article) => ({ id: `w8d${article.day}`, day: article.day, type: article.type, topic: article.topic, title: article.title, target_level: article.target_level })),
    { id: "w8d7", day: 7, type: "review", title: "复习" },
  ],
};
fs.writeFileSync(path.join(outputDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");

const alreadyRecorded = memory.history.some((entry) => entry.week === week);
if (!alreadyRecorded) {
  for (const article of articles) {
    const topic = memory.topics.find((candidate) => candidate.name === article.topic);
    if (topic) topic.shown += 1;
  }
}
memory.story.current = {
  title: "《逆风拳馆》", genre: "fighter/martial-artist", total_chapters: 4, current_chapter: 3,
  target_level: "HSK5",
  synopsis: "逆风拳馆即将关门，林野想靠业余比赛奖金救下拳馆。第二章中，周岚用训练考验他，并承认林野父亲曾要求她阻止儿子参赛；新出现的陈叔却说，周岚只讲了一半真相。",
};
memory.profile.last_updated = today;
memory.history = memory.history.filter((entry) => entry.week !== week);
memory.history.push({
  week, generated_at: today, mode: memory.profile.status,
  difficulty_policy: "Controlled HSK5: 290–330 Han-character target, short concrete sentences, three new stretch words and three review words per reading, broad annotation, target tap rate 10%.",
  question_policy: "Correct-option positions vary; option lengths are balanced and the correct answer is not systematically the longest.",
  articles: [
    ...articles.map((article) => ({ day: article.day, id: `w8d${article.day}`, type: article.type, topic: article.topic, register: article.register, target_level: article.target_level, feedback: null })),
    { day: 7, id: "w8d7", type: "review", topic: null, feedback: null },
  ],
});
memory.calibration_notes.week8_generation = {
  generated_at: today, target_unknown_rate: 0.1, han_character_target: "290–330 per reading",
  vocabulary_budget: "3 new stretch words + 3 Week 7 review words per reading; avoid dense clusters of abstract or domain terms.",
  syntax_policy: "HSK5 ideas with shorter sentences, explicit links, and concrete examples.",
};
fs.writeFileSync("memory.json", `${JSON.stringify(memory, null, 2)}\n`, "utf8");

const manifest = JSON.parse(fs.readFileSync("weeks/manifest.json", "utf8"));
if (!manifest.weeks.includes(week)) manifest.weeks.push(week);
manifest.weeks.sort((a, b) => a - b);
manifest.latest = week;
fs.writeFileSync("weeks/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ summaries, reviewItems: review.items.length }, null, 2));
