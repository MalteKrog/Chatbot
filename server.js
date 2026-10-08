import express from "express";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const messages = [];

// Hver regel har ét regex med alternation (|).
// \b = ordgrænse, i = ignorer store/små bogstaver.
const answers = [
  {
    category: "navn",
    pattern: /\b(navn|hedder|hvem er du|præsenter)/i,
    answer: "Jeg hedder Malte Krog. Hvad vil du ellers vide om mig?"
  },
  {
    category: "bosted",
    pattern: /\b(bor|by|fra)\b/i,
    answer: "Jeg bor i Danmark."
  },
  {
    category: "fritid",
    pattern: /\b(fritid|hobby|kan lide)\b/i,
    answer: "I min fritid kan jeg godt lide at kode og lave sjove projekter som denne bot."
  },
  {
    // ^ = kun hvis beskeden BEGYNDER med en hilsen.
    // Står sidst, så "Hej, hvad hedder du?" rammer navne-reglen først.
    category: "hilsen",
    pattern: /^(hej|goddag|hallo)\b/i,
    answer: "Hej med dig! Hvad vil du vide om mig?"
  }
];

const topicStats = {
  navn: 0,
  bosted: 0,
  fritid: 0,
  hilsen: 0
};

function findBestAnswer(question) {
  const text = question.trim();

  // match() med capture group: "jeg hedder Anna" -> nameMatch[1] = "Anna"
  // Ligger FØR løkken, ellers vinder navne-reglen på ordet "hedder".
  const nameMatch = text.match(/jeg hedder ([a-zæøå]+)/i);

  if (nameMatch) {
    // null-tjek: nameMatch er null, hvis intet matcher
    return {
      answer: `Hej ${nameMatch[1]}! Hyggeligt at møde dig.`,
      category: "hilsen"
    };
  }

  // search() returnerer positionen, eller -1 hvis intet matcher
  for (const answerGroup of answers) {
    if (text.search(answerGroup.pattern) !== -1) {
      return {
        answer: answerGroup.answer,
        category: answerGroup.category
      };
    }
  }

  return {
    answer: "Det kender jeg ikke svaret på endnu.",
    category: ""
  };
}

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

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