// Hent elementer
const maxChars = 280;
const warning = 200;

const questionInput = document.getElementById("question");
const charCounter = document.getElementById("char-counter");
const charCount = document.getElementById("char-count");
const sendButton = document.getElementById("send-button");

function updateCounter() {
  const length = questionInput.value.length;

  charCount.textContent = length;
  charCounter.classList.toggle("warning", length >= warning && length <= maxChars);
  charCounter.classList.toggle("danger", length > maxChars);
  sendButton.disabled = length > maxChars;
}

if (questionInput && charCounter && charCount && sendButton) {
  questionInput.addEventListener("input", updateCounter);
  updateCounter();
}
