const fs = require("fs");

const today = "2026-08-16";
const week = 7;
const memoryPath = "memory.json";
const feedbackPath = "weeks/week-07/week-7-feedback.json";
const memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
const feedback = JSON.parse(fs.readFileSync(feedbackPath, "utf8"));
const intervals = memory.srs_config.intervals_days;
const historyWeek = memory.history.find((entry) => entry.week === week);

if (!historyWeek) throw new Error("Week 7 is missing from memory history.");
if (feedback.week !== week) throw new Error(`Expected Week 7 feedback, got Week ${feedback.week}.`);
if (historyWeek.articles.some((article) => article.feedback)) {
  throw new Error("Week 7 feedback has already been imported; refusing to apply SRS changes twice.");
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function findWord(text) {
  return memory.words.find((word) => word.t === text);
}

function advance(word, countSeen = true) {
  if (!word) return;
  word.interval_index = Math.min((word.interval_index || 0) + 1, intervals.length - 1);
  if (countSeen) word.times_seen = (word.times_seen || 0) + 1;
  word.last_seen = today;
  word.due = addDays(today, intervals[word.interval_index]);
  if (word.interval_index === intervals.length - 1) word.status = "known";
}

function lapse(word, countSeen = true) {
  if (!word) return;
  word.interval_index = 0;
  word.lapses = (word.lapses || 0) + 1;
  if (countSeen) word.times_seen = (word.times_seen || 0) + 1;
  word.last_seen = today;
  word.due = addDays(today, intervals[0]);
  word.status = "learning";
}

const newlyAdded = [];
const readingLapses = new Set();

for (const item of feedback.articles) {
  const article = JSON.parse(fs.readFileSync(`weeks/week-07/${item.id}.json`, "utf8"));
  const tapped = [...new Map((item.words_tapped || []).map((word) => [word.t, word])).values()];
  const tappedSet = new Set(tapped.map((word) => word.t));

  for (const tappedWord of tapped) {
    const token = article.tokens.find((candidate) => candidate.t === tappedWord.t && !candidate.punct);
    if (token && token.name) {
      let name = memory.names_seen.find((candidate) => candidate.t === tappedWord.t);
      if (!name) {
        name = {
          t: tappedWord.t,
          py: tappedWord.py,
          g: tappedWord.g,
          status: "learning",
          times_seen: 1,
          lapses: 0,
          interval_index: 0,
          first_seen: today,
          last_seen: today,
          due: addDays(today, intervals[0]),
          vocab_type: "name",
          topic_domain: "proper_noun",
        };
        memory.names_seen.push(name);
      } else {
        lapse(name);
      }
      continue;
    }

    let word = findWord(tappedWord.t);
    if (!word) {
      const isDomain = !!(token && token.domain);
      const domain = isDomain ? item.topic : null;
      word = {
        t: tappedWord.t,
        py: tappedWord.py,
        g: tappedWord.g,
        status: "learning",
        times_seen: 1,
        lapses: 0,
        interval_index: 0,
        first_seen: today,
        last_seen: today,
        due: addDays(today, intervals[0]),
        vocab_type: isDomain ? "domain" : "general",
        topic_domain: domain,
      };
      memory.words.push(word);
      newlyAdded.push(word.t);
      if (isDomain) {
        memory.domain_vocab[domain] ||= { learning: 0, known: 0 };
        memory.domain_vocab[domain].learning += 1;
      }
    } else {
      lapse(word);
    }
    readingLapses.add(word.t);
  }

  for (const reviewText of article.review_words || []) {
    if (!tappedSet.has(reviewText)) advance(findWord(reviewText));
  }

  const topic = memory.topics.find((candidate) => candidate.name === item.topic);
  if (topic && item.topic_rating === "liked") {
    topic.liked += 1;
    topic.preference += 1;
  } else if (topic && item.topic_rating === "disliked") {
    topic.preference -= 1;
  }

  const historyArticle = historyWeek.articles.find((candidate) => candidate.id === item.id);
  historyArticle.feedback = {
    difficulty_rating: item.difficulty_rating,
    topic_rating: item.topic_rating,
    unknown_rate: item.unknown_rate,
    tapped_count: tapped.length,
    completed: item.completed,
    comment: item.comment || "",
    comprehension_accuracy:
      item.comprehension.filter((answer) => answer.correct === true).length /
      item.comprehension.length,
  };
}

let reviewCorrect = 0;
let reviewMissed = 0;
for (const result of feedback.review_results || []) {
  const word = findWord(result.word);
  if (!word) continue;
  const success =
    result.format === "flashcard_selfrate"
      ? result.self_rating === "got_it"
      : result.correct === true;
  if (success) {
    if (readingLapses.has(result.word)) {
      word.lapses = Math.max(0, (word.lapses || 0) - 1);
      readingLapses.delete(result.word);
    }
    advance(word);
    reviewCorrect += 1;
  } else {
    lapse(word, false);
    reviewMissed += 1;
  }
}

historyWeek.articles.find((article) => article.day === 7).feedback = {
  exported_at: feedback.exported_at,
  review_accuracy: reviewCorrect / (reviewCorrect + reviewMissed),
  item_count: reviewCorrect + reviewMissed,
};

const readingFeedback = feedback.articles;
const tooHard = readingFeedback.filter((item) => item.difficulty_rating === "too_hard");
const unfinished = readingFeedback.filter((item) =>
  /没(有)?读完/.test(item.comment || ""),
);
const avgUnknownRate =
  readingFeedback.reduce((sum, item) => sum + item.unknown_rate, 0) / readingFeedback.length;
const comprehensionCorrect = readingFeedback.reduce(
  (sum, item) => sum + item.comprehension.filter((answer) => answer.correct).length,
  0,
);
const comprehensionTotal = readingFeedback.reduce(
  (sum, item) => sum + item.comprehension.length,
  0,
);

memory.profile.level_estimate = "HSK5";
memory.profile.level_confidence = 0.78;
memory.profile.status = "calibrating";
memory.profile.last_updated = today;
memory.calibration_notes.week7_update = {
  processed_at: today,
  difficulty: `${tooHard.length}/6 too_hard; ${unfinished.length}/6 explicitly unfinished`,
  average_displayed_unknown_rate: +avgUnknownRate.toFixed(4),
  unknown_rate_caution:
    "The two unfinished readings undercount later unknown words, so 8.7% and 13.6% are lower bounds rather than successful targets.",
  comprehension_accuracy: +(comprehensionCorrect / comprehensionTotal).toFixed(4),
  topic_signal: "All six topics were rated meh; difficulty likely suppressed topic enjoyment.",
  next_week_target:
    "Keep controlled HSK5 grammar but shorten readings to about 300–340 Han characters, use concrete framing and shorter sentences, cap each reading at three new stretch words plus three spaced-review words, and target about 10% taps with broad annotation coverage.",
};

fs.writeFileSync(memoryPath, `${JSON.stringify(memory, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ newlyAdded: newlyAdded.length, reviewCorrect, reviewMissed, profile: memory.profile }, null, 2));
