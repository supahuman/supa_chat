/**
 * SupaChatbot Widget Core
 * Main widget functionality and state management
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    apiUrl: null, // Will be set from config
    widgetId: "supachatbot-widget",
    version: "1.0.0",
  };

  // Widget state
  let isOpen = false;
  let isInitialized = false;
  let currentAgent = null;
  let sessionId = null;

  // Session management
  function generateSessionId() {
    return (
      "embed_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  function initSession() {
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem("supachatbot_session", sessionId);
    }
  }

  // Widget control functions
  function toggleChat() {
    const window = document.getElementById("supachatbot-window");
    const badge = document.getElementById("supachatbot-badge");

    isOpen = !isOpen;
    window.classList.toggle("open", isOpen);

    if (isOpen) {
      badge.style.display = "none";
      document.getElementById("supachatbot-input").focus();
    }
  }

  function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Initialize widget
  function initWidget(config) {
    if (isInitialized) return;

    // Set configuration
    if (config.apiUrl) CONFIG.apiUrl = config.apiUrl;
    if (config.agentId) currentAgent = config;

    // Initialize session
    initSession();

    // Initialize UI components
    if (window.SupaChatbotUI) {
      window.SupaChatbotUI.init(CONFIG, currentAgent);
    }

    // Initialize API service
    if (window.SupaChatbotAPI) {
      window.SupaChatbotAPI.init(CONFIG);
    }

    isInitialized = true;
    console.log("SupaChatbot widget initialized");
  }

  // Export for global access
  window.SupaChatbotCore = {
    CONFIG,
    isOpen: () => isOpen,
    isInitialized: () => isInitialized,
    currentAgent: () => currentAgent,
    sessionId: () => sessionId,
    initWidget,
    toggleChat,
    handleKeyPress,
    sendMessage: () => {
      if (window.SupaChatbotAPI) {
        return window.SupaChatbotAPI.sendMessage();
      }
    },
  };

  // Make functions globally available
  window.toggleChat = toggleChat;
  window.handleKeyPress = handleKeyPress;
  window.sendMessage = () => {
    if (window.SupaChatbotAPI) {
      return window.SupaChatbotAPI.sendMessage();
    }
  };
})();
