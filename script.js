const API_KEY = "YOUR_API_KEY_HERE";

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// FIXED RESPONSE PARSING + BETTER ERROR HANDLING
async function generateResponse(prompt) {
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    console.error("API Error:", msg);
    throw new Error("API Request Failed");
  }

  const data = await response.json();

  // SAFE parsing (Gemini sometimes changes structure)
  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.output ||
    "No response received.";

  return reply;
}

// CLEAN MARKDOWN
function cleanMarkdown(text) {
  return text
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function addMessage(message, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", isUser ? "user-message" : "bot-message");

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

async function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, true);

  userInput.value = "";
  sendButton.disabled = true;
  userInput.disabled = true;

  try {
    const botMessage = await generateResponse(userMessage);
    addMessage(cleanMarkdown(botMessage), false);
  } catch (error) {
    addMessage("Error connecting to AI. Check your API key.", false);
  } finally {
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

sendButton.addEventListener("click", handleUserInput);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleUserInput();
  }
});
