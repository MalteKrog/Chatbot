// ---------- Konstanter og DOM-elementer ----------
const API_URL = "http://localhost:3000";

const messagesContainer = document.querySelector("#messages");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const clearMessagesButton = document.querySelector("#clear-messages-button");

// ---------- Vis en besked ----------
// Bruger din egen markup fra øvelse 3 (.message.user / .message.bot),
// så din eksisterende CSS stadig virker.
function displayMessage(message) {
  const isQuestion = message.type === "question";
  const html = /*html*/ `
    <div class="message ${isQuestion ? "user" : "bot"}">
      <span class="label">${isQuestion ? "" : "MalteBot"}</span>
      ${message.text}
    </div>`;

  messagesContainer.insertAdjacentHTML("beforeend", html);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ---------- Del 2: hent historikken ved load ----------
async function getMessages() {
  const response = await fetch(`${API_URL}/messages`);
  const messages = await response.json();

  for (const message of messages) {
    displayMessage(message);
  }
}

getMessages();

// ---------- Del 3: send et nyt spørgsmål ----------
questionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();

  // Lille ekstra sikring, så et tomt felt ikke crasher displayMessage()
  // (rigtig fejlhåndtering kommer i DOB 7)
  if (!question) return;

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  const data = await response.json();

  displayMessage(data.question);
  displayMessage(data.answer);

  questionInput.value = "";
  updateCounter();
});

// ---------- Del 4: ryd beskeder ----------
clearMessagesButton.addEventListener("click", async () => {
  await fetch(`${API_URL}/messages`, { method: "DELETE" });
  messagesContainer.innerHTML = "";
});

// ---------- Character counter (fra tidligere opgave) ----------
const maxChars = 280;
const warning = 200;

const charCounter = document.getElementById("char-counter");
const charCount = document.getElementById("char-count");
const sendButton = document.getElementById("send-button");

function updateCounter() {
  if (!charCounter || !charCount || !sendButton) return;

  const length = questionInput.value.length;

  charCount.textContent = length;
  charCounter.classList.toggle("warning", length >= warning && length <= maxChars);
  charCounter.classList.toggle("danger", length > maxChars);
  sendButton.disabled = length > maxChars;
}

questionInput.addEventListener("input", updateCounter);
updateCounter();
