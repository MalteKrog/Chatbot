// Hent elementer
const loginOverlay = document.getElementById("loginOverlay");
const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");

let currentUser = null;

window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("amabot_user");
  if (savedName) {
    currentUser = savedName;
    loginOverlay.classList.add("hidden");
  }

  console.log("Current user:", currentUser);
});

if (nameForm) {
  nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const name = nameInput.value.trim();
    if (!name) return;

    currentUser = name;
    localStorage.setItem("amabot_user", name);
    loginOverlay.classList.add("hidden");

    return false;
  });
}

/* // Besked-formular: send spørgsmål
composer.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage("user", text, currentUser || "Bruger");
  messageInput.value = "";

  // Få et svar, ingen logik endnu, bare et placeholder-svar
  setTimeout(() => {
    addMessage("bot", "Godt spørgsmål! Det vender jeg tilbage på.", "MalteBot");
  }, 500);
});

function addMessage(role, text, label) {
  const div = document.createElement("div");
  div.classList.add("message", role);

  const span = document.createElement("span");
  span.classList.add("label");
  span.textContent = label;

  div.appendChild(span);
  div.appendChild(document.createTextNode(text));

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
} */