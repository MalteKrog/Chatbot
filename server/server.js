import express from "express";
import fs from "node:fs/promises";

const app = express();
const port = 3000;

app.use(express.json());

const topicStats = {
  navn: 0,
  bosted: 0,
  fritid: 0
};



async function loadMessages() {
  const data = await fs.readFile("./data/messages.json", "utf8");
  return JSON.parse(data);
}
 
async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}
 
async function loadAnswers() {
  const data = await fs.readFile("./data/answers.json", "utf8");
  return JSON.parse(data);
}
 
async function saveAnswers(answers) {
  const json = JSON.stringify(answers, null, 2);
  await fs.writeFile("./data/answers.json", json);
}

function matchesKeyword(normalizedQuestion, keyword) {
  return normalizedQuestion.search(new RegExp("\\b" + keyword + "\\b")) !== -1;
}

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    matchesKeyword(normalizedQuestion, keyword)
  );

  return matches.length;
}

function normalizeQuestion(question) {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

function findBestAnswer(question, answers) {
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

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}


app.get("/messages", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

app.post("/messages", async (request, response) => {
  const messages = await loadMessages();
  const answers = await loadAnswers();                    // NYT
  const question = request.body.question.trim();

  if (!question) {
    response.json({ error: "Skriv et spørgsmål, før du sender." });
    return;
  }

  const message = { type: "question", text: question, createdAt: new Date().toISOString() };
  messages.push(message);

  const result = findBestAnswer(question, answers);       // RETTET: answers med
  const answerMessage = { type: "answer", text: result.answer, createdAt: new Date().toISOString() };
  messages.push(answerMessage);

  await saveMessages(messages);

  response.json({ question: message, answer: answerMessage });
});

app.delete("/messages", async (request, response) => {
  await saveMessages([]);

  response.send();
});

app.get("/answers", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

app.get("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  response.json(answerRule);
});

app.post("/answers", async (request, response) => {
  const answers = await loadAnswers();
  const newAnswerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answer: request.body.answer
  };

  answers.push(newAnswerRule);
  await saveAnswers(answers);

  response.json(newAnswerRule);
});

app.put("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  answerRule.keywords = request.body.keywords;
  answerRule.answer = request.body.answer;
  await saveAnswers(answers);

  response.json(answerRule);
});

app.delete("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const updatedAnswers = answers.filter((a) => a.category !== request.params.category);

  await saveAnswers(updatedAnswers);

  response.send();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
