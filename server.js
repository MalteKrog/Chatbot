import express from "express";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const messages = [];

const answers = [
  {
    category: "navn",
    keywords: ["navn", "hedder", "hvem er du"],
    answer: "Jeg hedder Malte Krog. Hvad vil du ellers vide om mig?"
  },
  {
    category: "bosted",
    keywords: ["bor", "by", "fra"],
    answer: "Jeg bor i Danmark."
  },
  {
    category: "fritid",
    keywords: ["fritid", "hobby", "kan lide"],
    answer: "I min fritid kan jeg godt lide at kode og lave sjove projekter som denne bot."
  }
];

const topicStats = {
  navn: 0,
  bosted: 0,
  fritid: 0
};

/* function findAnswer(question) {
  const normalizedQuestion = question.toLowerCase();

   const hasMatch = answerGroup.keywords.some(keyword) => {
    normalizedQuestion.includes(keyword)
  };

  for (const answerGroup of answers) {
    const hasMatch = answerGroup.keywords.some((keyword) =>
      normalizedQuestion.includes(keyword)
    );

    if (hasMatch) {
      return answerGroup.answer;
    }
  }

  return "Det kender jeg ikke svaret på endnu.";
} */

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword)
  );

  return matches.length;
}
function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase();
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

app.get("/", (request, response) => {
  response.render("index", { messages, error: "" });
});

app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats });
});

app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question ?? "";
  const question = sanitizeQuestion(rawQuestion).trim();
  let error = "";

  if (!question) {
    error = "Skriv et spørgsmål, før du sender.";
  } else if (question.length > 280) {
    error = "Spørgsmålet må højst være 280 tegn.";
  } else {
    messages.push({ type: "question", text: question });

    const result = findBestAnswer(question);
    messages.push({ type: "answer", text: result.answer });

    if (result.category) {
      topicStats[result.category] = topicStats[result.category] + 1;
    }
  }

  response.render("index", { messages, error, topicStats });
});

app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  response.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
