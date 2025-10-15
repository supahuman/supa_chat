/**
 * SupaChatbot Widget API Service
 * Handles communication with the backend API
 */

(function () {
  "use strict";

  let config = null;

  // Send message to API
  async function sendMessageToAPI(message) {
    try {
      const response = await fetch(`${config.apiUrl}/api/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-Key": window.SupaChatbotCore.currentAgent().companyApiKey,
          "X-User-ID": window.SupaChatbotCore.currentAgent().userId,
        },
        body: JSON.stringify({
          message: message,
          sessionId: window.SupaChatbotCore.sessionId(),
          conversationHistory: window.SupaChatbotCore.getConversationHistory(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }
  }

  // Send message function
  async function sendMessage() {
    const input = document.getElementById("supachatbot-input");
    const message = input.value.trim();

    if (!message || !window.SupaChatbotCore.currentAgent()) return;

    // Add user message
    if (window.SupaChatbotUI) {
      window.SupaChatbotUI.addMessage(message, "user");
    }
    // Add to conversation history
    if (window.SupaChatbotCore) {
      window.SupaChatbotCore.addToHistory("user", message);
    }
    input.value = "";

    // Show typing indicator
    if (window.SupaChatbotUI) {
      window.SupaChatbotUI.showTyping();
    }

    // Send to API
    const response = await sendMessageToAPI(message);

    // Hide typing indicator
    if (window.SupaChatbotUI) {
      window.SupaChatbotUI.hideTyping();
    }

    // Add AI response
    if (response.success) {
      if (window.SupaChatbotUI) {
        window.SupaChatbotUI.addMessage(response.data.message, "assistant");
      }
      // Add to conversation history
      if (window.SupaChatbotCore) {
        window.SupaChatbotCore.addToHistory("assistant", response.data.message);
      }
    } else {
      if (window.SupaChatbotUI) {
        window.SupaChatbotUI.addMessage(
          "Sorry, I encountered an error. Please try again.",
          "assistant"
        );
      }
    }
  }

  // Initialize API service
  function init(conf) {
    config = conf;
  }

  // Export for global access
  window.SupaChatbotAPI = {
    init,
    sendMessage,
    sendMessageToAPI,
  };
})();
