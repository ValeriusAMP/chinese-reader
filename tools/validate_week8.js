const fs = require("fs");

const failures = [];
const report = [];
const comprehensionMc = [];
const answerPositions = [0, 0, 0, 0];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function optionMetrics(question, source) {
  assert(Array.isArray(question.options) && question.options.length === 4, `${source}: expected four options`);
  assert(Number.isInteger(question.answer_index), `${source}: missing answer_index`);
  if (!Array.isArray(question.options) || !Number.isInteger(question.answer_index)) return null;
  assert(question.answer_index >= 0 && question.answer_index < question.options.length, `${source}: invalid answer_index`);
  const lengths = question.options.map((option) => [...option].length);
  const max = Math.max(...lengths);
  const min = Math.min(...lengths);
  const answerLength = lengths[question.answer_index];
  return {
    source,
    answer: question.answer_index,
    lengths,
    spread: max - min,
    answerIsLongest: answerLength === max,
    answerIsUniqueLongest: answerLength === max && lengths.filter((length) => length === max).length === 1,
  };
}

for (let day = 1; day <= 6; day++) {
  const file = `weeks/week-08/w8d${day}.json`;
  const article = JSON.parse(fs.readFileSync(file, "utf8"));
  const meaningful = article.tokens.filter((token) => !token.punct);
  const tappable = meaningful.filter((token) => token.py && token.g);
  const chars = meaningful.reduce(
    (sum, token) => sum + [...token.t].filter((char) => /\p{Script=Han}/u.test(char)).length,
    0,
  );
  const coverage = tappable.length / meaningful.length;

  assert(article.id === `w8d${day}`, `${file}: wrong id`);
  assert(article.week === 8 && article.day === day, `${file}: wrong week/day`);
  assert(chars >= 290 && chars <= 330, `${file}: ${chars} Han chars outside 290–330 target`);
  assert(coverage >= 0.7, `${file}: tap coverage ${(coverage * 100).toFixed(1)}% below 70%`);
  assert(article.stretch_words.length === 3, `${file}: expected exactly three stretch words`);
  assert(article.review_words.length === 3, `${file}: expected exactly three review words`);
  assert(article.difficulty_design.target_unknown_rate === 0.1, `${file}: target unknown rate is not 10%`);
  for (const text of [...article.stretch_words, ...article.review_words]) {
    assert(
      article.tokens.some((token) => token.t === text && token.py && token.g),
      `${file}: ${text} is missing or not tappable`,
    );
  }
  assert(article.comprehension.length === 3, `${file}: expected three comprehension questions`);
  assert(article.comprehension[0].type === "true_false", `${file}: first question must be true/false`);
  assert(
    article.comprehension.slice(1).every((question) => question.type === "multiple_choice"),
    `${file}: questions two and three must be multiple choice`,
  );
  article.comprehension.forEach((question, index) => {
    if (question.type !== "multiple_choice") return;
    const metrics = optionMetrics(question, `${article.id}.q${index + 1}`);
    if (!metrics) return;
    comprehensionMc.push(metrics);
    answerPositions[metrics.answer] += 1;
    assert(metrics.spread <= 6, `${metrics.source}: option length spread ${metrics.spread} is too large`);
  });
  report.push({ id: article.id, chars, meaningful: meaningful.length, tappable: tappable.length, coverage: `${(coverage * 100).toFixed(1)}%` });
}

const uniqueLongest = comprehensionMc.filter((question) => question.answerIsUniqueLongest);
assert(comprehensionMc.length === 12, "expected 12 comprehension multiple-choice questions");
assert(uniqueLongest.length <= 3, `correct answer is uniquely longest in ${uniqueLongest.length}/12 questions (maximum 3)`);
assert(
  answerPositions.every((count) => count >= 2 && count <= 4),
  `answer positions are unbalanced: ${answerPositions.join(", ")}`,
);

const review = JSON.parse(fs.readFileSync("weeks/week-08/w8d7.json", "utf8"));
const reviewMc = [];
const formatCounts = review.items.reduce((counts, item) => {
  counts[item.format] = (counts[item.format] || 0) + 1;
  return counts;
}, {});
assert(review.items.length === 15, "review: expected 15 items");
assert(
  JSON.stringify(formatCounts) === JSON.stringify({ matching: 1, recognition_mc: 3, reverse_recall_mc: 3, cloze: 6, flashcard_selfrate: 2 }),
  `review: wrong format mix ${JSON.stringify(formatCounts)}`,
);
for (const [index, item] of review.items.entries()) {
  if (item.format === "matching") {
    assert(item.pairs.length === 5, "review matching item must contain five pairs");
  } else {
    assert(item.word && item.word.t && item.word.py && item.word.g, `review item ${index + 1}: incomplete word`);
  }
  if (item.options) {
    const metrics = optionMetrics(item, `review.item${index + 1}`);
    if (metrics) reviewMc.push(metrics);
  }
}
assert(
  reviewMc.filter((item) => item.answerIsUniqueLongest).length <= 3,
  "review: correct option is uniquely longest too often",
);

const index = JSON.parse(fs.readFileSync("weeks/week-08/index.json", "utf8"));
assert(index.articles.length === 7, "index: expected seven days");
assert(index.articles.filter((article) => article.type === "dialogue").length === 2, "index: expected two dialogues");
assert(index.articles.filter((article) => article.type === "story").length === 1, "index: expected one story");
assert(index.articles.filter((article) => ["philosophy", "history", "astrophysics"].includes(article.topic)).length >= 3, "index: intellectual minimum not met");
assert(index.articles.filter((article) => ["venture capital", "finance"].includes(article.topic)).length === 2, "index: finance/professional quota not met");

const memory = JSON.parse(fs.readFileSync("memory.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("weeks/manifest.json", "utf8"));
assert(memory.history.filter((entry) => entry.week === 8).length === 1, "memory: Week 8 missing or duplicated");
assert(memory.history.find((entry) => entry.week === 7).articles.every((article) => article.feedback), "memory: Week 7 feedback was not fully imported");
assert(memory.story.current.current_chapter === 3, "memory: story should advance to Chapter 3 next");
assert(memory.profile.last_updated === "2026-08-16", "memory: last_updated is stale");
assert(manifest.latest === 8 && manifest.weeks.includes(8), "manifest: Week 8 missing");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures, report, optionBias: { uniqueLongest: uniqueLongest.length, answerPositions, questions: comprehensionMc }, formatCounts }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, report, optionBias: { uniqueLongest: uniqueLongest.length, answerPositions }, review: { eligible: review.eligible_word_count, formatCounts } }, null, 2));
