// ---------- Konstanter og DOM-elementer ----------
const API_URL = "http://localhost:3000";
const MAX_CHARS = 280;
const WARNING_AT = 200;
const SUGGESTIONS = ["Hvad hedder du?", "Hvor bor du?", "Hvad er din hobby?"];

const messagesContainer = document.querySelector("#messages");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const sendButton = document.querySelector("#send-button");
const clearMessagesButton = document.querySelector("#clear-messages-button");
const charCounter = document.querySelector("#char-counter");
const charCount = document.querySelector("#char-count");

let isSending = false;

// ---------- Hjælpefunktioner ----------
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function botAvatarHtml() {
  return `<img class="mini-avatar" src="public/assets/malte.jpg" alt="" />`;
}

// ---------- Visning ----------
function displayMessage(message) {
  removeWelcome();

  const isQuestion = message.type === "question";
  const time = formatTime(message.createdAt);

  // message.text er allerede escapet af serveren (øvelse 9)
  const html = /*html*/ `
    <div class="row ${isQuestion ? "user" : "bot"}">
      ${isQuestion ? "" : botAvatarHtml()}
      <div class="bubble">
        ${message.text}
        ${time ? `<time class="time">${time}</time>` : ""}
      </div>
    </div>`;

  messagesContainer.insertAdjacentHTML("beforeend", html);
  scrollToBottom();
}

// Velkomst + forslag, vises når samtalen er tom
function showWelcome() {
  const chips = SUGGESTIONS
    .map((text) => `<button type="button" class="chip">${text}</button>`)
    .join("");

  messagesContainer.innerHTML = /*html*/ `
    <div class="welcome">
      <div class="row bot">
        ${botAvatarHtml()}
        <div class="bubble">Hej! Jeg er Malte Krog. Stil mig et spørgsmål, så svarer jeg så godt jeg kan.</div>
      </div>
      <div class="chips">${chips}</div>
    </div>`;
}

function removeWelcome() {
  const welcome = messagesContainer.querySelector(".welcome");
  if (welcome) welcome.remove();
}

function showTyping() {
  const html = /*html*/ `
    <div class="row bot typing" id="typing">
      ${botAvatarHtml()}
      <div class="bubble"><span></span><span></span><span></span></div>
    </div>`;

  messagesContainer.insertAdjacentHTML("beforeend", html);
  scrollToBottom();
}

function hideTyping() {
  const typing = document.querySelector("#typing");
  if (typing) typing.remove();
}

// ---------- Hent historikken ved load ----------
async function getMessages() {
  const response = await fetch(`${API_URL}/messages`);
  const messages = await response.json();

  if (messages.length === 0) {
    showWelcome();
    return;
  }

  for (const message of messages) {
    displayMessage(message);
  }
}

getMessages().catch(showWelcome);

// ---------- Send et spørgsmål ----------
async function sendQuestion(question) {
  if (!question || isSending) return;

  isSending = true;
  updateCounter();

  // Vis spørgsmålet med det samme, så chatten føles hurtig
  displayMessage({ type: "question", text: question, createdAt: new Date().toISOString() });
  questionInput.value = "";
  updateCounter();
  showTyping();

  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    hideTyping();
    displayMessage(data.answer);
  } catch (error) {
    hideTyping();
    displayMessage({ type: "answer", text: "Jeg kan ikke komme i kontakt med serveren lige nu." });
  } finally {
    isSending = false;
    updateCounter();
    questionInput.focus();
  }
}

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendQuestion(questionInput.value.trim());
});

// Klik på et forslag
messagesContainer.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (chip) sendQuestion(chip.textContent);
});

// ---------- Ryd beskeder ----------
clearMessagesButton.addEventListener("click", async () => {
  await fetch(`${API_URL}/messages`, { method: "DELETE" });
  showWelcome();
});

// ---------- Tegntæller ----------
function updateCounter() {
  const length = questionInput.value.length;
  const trimmedLength = questionInput.value.trim().length;

  charCount.textContent = length;
  charCounter.classList.toggle("warning", length >= WARNING_AT && length <= MAX_CHARS);
  charCounter.classList.toggle("danger", length > MAX_CHARS);

  // Send er slået fra, når feltet er tomt, over grænsen, eller mens der sendes
  sendButton.disabled = trimmedLength === 0 || length > MAX_CHARS || isSending;
}

questionInput.addEventListener("input", updateCounter);
updateCounter();
questionInput.focus();