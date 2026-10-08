// Hent elementer
const MAX_CHARS = 280;
const WARNING_AT = 200;

const questionInput = document.getElementById("question");
const charCounter = document.getElementById("char-counter");
const charCount = document.getElementById("char-count");
const sendButton = document.getElementById("send-button");

function updateCounter() {
  const length = questionInput.value.length;

  charCount.textContent = length;
  charCounter.classList.toggle("warning", length >= WARNING_AT && length <= MAX_CHARS);
  charCounter.classList.toggle("danger", length > MAX_CHARS);
  sendButton.disabled = length > MAX_CHARS;
}

if (questionInput && charCounter && charCount && sendButton) {
  questionInput.addEventListener("input", updateCounter);
  updateCounter();
}
