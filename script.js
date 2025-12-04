// const API_KEY = "AIzaSyDtznJkz3rWTiKR7coPPoRda2R1ik_yyz8";

// ---- CONFIG ----
const API_KEY = "AIzaSyDtznJkz3rWTiKR7coPPoRda2R1ik_yyz8";  
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// ---- ELEMENTS ----
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// ---- GENERATE AI RESPONSE ----
async function generateResponse(prompt) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return "⚠️ API request failed. Check your key or CORS issue.";
    }

    const data = await response.json();

    // SAFER RESPONSE PARSING
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      "⚠️ No response received from AI.";

    return reply.trim();
  } catch (error) {
    console.log(error);
    return "⚠️ Network error or blocked by browser.";
  }
}

// ---- CLEAN MARKDOWN ----
function cleanMarkdown(text) {
  return text
    .replace(/#{1,6}\s?/g, "")     // remove headings
    .replace(/\*\*/g, "")          // remove bold
    .replace(/\n{3,}/g, "\n\n")    // fix spacing
    .trim();
}

// ---- DISPLAY MESSAGE ----
function addMessage(message, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "message",
    isUser ? "user-message" : "bot-message"
  );

  const profileImage = document.createElement("img");
  profileImage.classList.add("profile-image");
  profileImage.src = isUser ? "user.png" : "ro.avif";

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.textContent = message;

  messageElement.appendChild(profileImage);
  messageElement.appendChild(messageContent);

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ---- HANDLE USER INPUT ----
async function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, true);

  userInput.value = "";
  sendButton.disabled = true;
  userInput.disabled = true;

  const botMessage = await generateResponse(userMessage);
  addMessage(cleanMarkdown(botMessage), false);

  sendButton.disabled = false;
  userInput.disabled = false;
  userInput.focus();
}

// ---- EVENTS ----
sendButton.addEventListener("click", handleUserInput);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleUserInput();
  }
});
