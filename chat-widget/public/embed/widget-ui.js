/**
 * SupaChatbot Widget UI Components
 * HTML templates, icons, and UI management
 */

(function () {
  "use strict";

  let config = null;
  let currentAgent = null;

  // Icons
  const ICONS = {
    toggle: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V9h2v4zm4 4h-2v-2h2v2zm0-4h-2V9h2v4z" fill="currentColor"/>
        <circle cx="18" cy="6" r="3" fill="#4CAF50"/>
        <path d="M16.5 5.5l1.5 1.5 3-3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    close: `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
      </svg>
    `,
    send: `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
      </svg>
    `,
    aiAvatar: (size = 20) => `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="8" width="18" height="10" rx="2" fill="white"/>
        <circle cx="9" cy="13" r="1.5" fill="#3B82F6"/>
        <circle cx="15" cy="13" r="1.5" fill="#3B82F6"/>
        <path d="M9 16h6" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 2v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="2" r="1" fill="white"/>
      </svg>
    `,
    aiAvatarMessage: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="8" width="18" height="10" rx="2" fill="#3B82F6"/>
        <circle cx="9" cy="13" r="1.5" fill="white"/>
        <circle cx="15" cy="13" r="1.5" fill="white"/>
        <path d="M9 16h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 2v6" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="2" r="1" fill="#3B82F6"/>
      </svg>
    `,
    userAvatar: `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
      </svg>
    `,
  };

  // Create widget HTML
  function createWidgetHTML() {
    return `
      <div id="${config.widgetId}" class="supachatbot-widget">
        <!-- Chat Toggle Button -->
        <div class="supachatbot-toggle" onclick="toggleChat()">
          ${ICONS.toggle}
          <span class="supachatbot-badge" id="supachatbot-badge" style="display: none;">1</span>
        </div>

        <!-- Chat Window -->
        <div class="supachatbot-window" id="supachatbot-window">
          <!-- Header -->
          <div class="supachatbot-header">
            <div class="supachatbot-header-info">
              <div class="supachatbot-avatar">
                ${ICONS.aiAvatar(32)}
              </div>
              <div class="supachatbot-header-text">
                <div class="supachatbot-title" id="supachatbot-title">AI Assistant</div>
                <div class="supachatbot-subtitle" id="supachatbot-subtitle">Online now</div>
              </div>
            </div>
            <button class="supachatbot-close" onclick="toggleChat()">
              ${ICONS.close}
            </button>
          </div>

          <!-- Messages Container -->
          <div class="supachatbot-messages" id="supachatbot-messages">
            <div class="supachatbot-welcome">
              <div class="supachatbot-welcome-avatar">
                ${ICONS.aiAvatar(24)}
              </div>
              <div class="supachatbot-welcome-text">
                <div class="supachatbot-welcome-title">Hello! 👋</div>
                <div class="supachatbot-welcome-message" id="supachatbot-welcome-message">How can I help you today?</div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="supachatbot-input-area">
            <div class="supachatbot-typing" id="supachatbot-typing" style="display: none;">
              <div class="supachatbot-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="supachatbot-typing-text">AI is typing...</span>
            </div>
            <div class="supachatbot-input-container">
              <input 
                type="text" 
                class="supachatbot-input" 
                id="supachatbot-input" 
                placeholder="Type your message..."
                onkeypress="handleKeyPress(event)"
              />
              <button class="supachatbot-send" onclick="sendMessage()" id="supachatbot-send">
                ${ICONS.send}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Add message to chat
  function addMessage(content, type = "assistant") {
    const messagesContainer = document.getElementById("supachatbot-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `supachatbot-message ${type}`;

    const avatar = document.createElement("div");
    avatar.className = "supachatbot-message-avatar";
    avatar.innerHTML =
      type === "user" ? ICONS.userAvatar : ICONS.aiAvatarMessage;

    const contentDiv = document.createElement("div");
    contentDiv.className = "supachatbot-message-content";
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show/hide typing indicator
  function showTyping() {
    document.getElementById("supachatbot-typing").style.display = "flex";
  }

  function hideTyping() {
    document.getElementById("supachatbot-typing").style.display = "none";
  }

  // Update agent info
  function updateAgentInfo(agent) {
    if (agent) {
      document.getElementById("supachatbot-title").textContent =
        agent.name || "AI Assistant";
      document.getElementById("supachatbot-welcome-message").textContent =
        agent.description || "How can I help you today?";
    }
  }

  // Initialize UI
  function init(conf, agent) {
    config = conf;
    currentAgent = agent;

    // Add widget to body
    const widget = document.createElement("div");
    widget.innerHTML = createWidgetHTML();
    document.body.appendChild(widget.firstElementChild);

    // Update agent info
    updateAgentInfo(currentAgent);
  }

  // Export for global access
  window.SupaChatbotUI = {
    init,
    addMessage,
    showTyping,
    hideTyping,
    updateAgentInfo,
    ICONS,
  };
})();
