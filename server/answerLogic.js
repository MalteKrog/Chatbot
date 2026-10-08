
function normalizeQuestion(question) {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesKeyword(normalizedQuestion, keyword) {
  const pattern = new RegExp("\\b" + escapeRegExp(keyword.toLowerCase()) + "\\b");
  return normalizedQuestion.search(pattern) !== -1;
}

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    matchesKeyword(normalizedQuestion, keyword)
  );

  return matches.length;
}

export function findBestAnswer(question, answers) {
  const normalizedQuestion = normalizeQuestion(question);
  let bestScore = 0;
  let bestAnswer = "Det kender jeg ikke svaret på endnu.";
  let bestCategory = "";

  for (const answerGroup of answers) {
    const score = countMatches(answerGroup.keywords, normalizedQuestion);

    if (score > bestScore) {
      bestScore = score;
      bestAnswer = answerGroup.answer;
      bestCategory = answerGroup.category;
    }
  }

  return {
    answer: bestAnswer,
    category: bestCategory
  };
}