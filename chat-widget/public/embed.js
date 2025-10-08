/**
 * SupaChatbot Embeddable Widget
 * A lightweight, embeddable chat widget for websites
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: 'http://localhost:4000', // Will be configurable per deployment
    widgetId: 'supachatbot-widget',
    version: '1.0.0'
  };

  // Widget state
  let isOpen = false;
  let isInitialized = false;
  let currentAgent = null;
  let sessionId = null;

  // Create unique session ID
  function generateSessionId() {
    return 'embed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize session
  function initSession() {
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('supachatbot_session', sessionId);
    }
  }

  // Create widget HTML
  function createWidgetHTML() {
    return `
      <div id="${CONFIG.widgetId}" class="supachatbot-widget">
        <!-- Chat Toggle Button -->
        <div class="supachatbot-toggle" onclick="toggleChat()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V9h2v4zm4 4h-2v-2h2v2zm0-4h-2V9h2v4z" fill="currentColor"/>
          </svg>
          <span class="supachatbot-badge" id="supachatbot-badge" style="display: none;">1</span>
        </div>

        <!-- Chat Window -->
        <div class="supachatbot-window" id="supachatbot-window">
          <!-- Header -->
          <div class="supachatbot-header">
            <div class="supachatbot-header-info">
              <div class="supachatbot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="supachatbot-header-text">
                <div class="supachatbot-title" id="supachatbot-title">AI Assistant</div>
                <div class="supachatbot-subtitle" id="supachatbot-subtitle">Online now</div>
              </div>
            </div>
            <button class="supachatbot-close" onclick="toggleChat()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <!-- Messages Container -->
          <div class="supachatbot-messages" id="supachatbot-messages">
            <div class="supachatbot-welcome">
              <div class="supachatbot-welcome-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                </svg>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Create widget CSS
  function createWidgetCSS() {
    return `
      <style>
        .supachatbot-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          font-weight: 400 !important;
          color: #333 !important;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .supachatbot-toggle {
          width: 60px;
          height: 60px;
          background: #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          transition: all 0.3s ease;
          color: white;
          position: relative;
        }

        .supachatbot-toggle:hover {
          background: #0056b3;
          transform: scale(1.05);
        }

        .supachatbot-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .supachatbot-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }

        .supachatbot-window.open {
          display: flex;
        }

        .supachatbot-header {
          background: #007bff;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .supachatbot-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .supachatbot-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .supachatbot-title {
          font-weight: 600 !important;
          font-size: 16px !important;
          color: white !important;
        }

        .supachatbot-subtitle {
          font-size: 12px !important;
          opacity: 0.9 !important;
          color: white !important;
        }

        .supachatbot-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .supachatbot-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .supachatbot-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .supachatbot-welcome {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .supachatbot-welcome-avatar {
          width: 32px;
          height: 32px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          flex-shrink: 0;
        }

        .supachatbot-welcome-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .supachatbot-welcome-message {
          color: #6c757d;
        }

        .supachatbot-message {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .supachatbot-message.user {
          flex-direction: row-reverse;
        }

        .supachatbot-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .supachatbot-message.user .supachatbot-message-avatar {
          background: #007bff;
          color: white;
        }

        .supachatbot-message.assistant .supachatbot-message-avatar {
          background: #f8f9fa;
          color: #6c757d;
        }

        .supachatbot-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        .supachatbot-message.user .supachatbot-message-content {
          background: #007bff !important;
          color: white !important;
          font-weight: 400 !important;
        }

        .supachatbot-message.assistant .supachatbot-message-content {
          background: #f8f9fa !important;
          color: #333 !important;
          font-weight: 400 !important;
          border: 1px solid #e9ecef;
        }

        .supachatbot-typing {
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 12px;
        }

        .supachatbot-typing-dots {
          display: flex;
          gap: 4px;
        }

        .supachatbot-typing-dots span {
          width: 6px;
          height: 6px;
          background: #6c757d;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .supachatbot-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .supachatbot-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .supachatbot-input-area {
          border-top: 1px solid #e9ecef;
          padding: 16px;
        }

        .supachatbot-input-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .supachatbot-input {
          flex: 1;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          padding: 12px 16px;
          font-size: 14px !important;
          font-family: inherit !important;
          color: #333 !important;
          background: white !important;
          outline: none;
          transition: border-color 0.2s;
        }

        .supachatbot-input:focus {
          border-color: #007bff;
        }

        .supachatbot-send {
          width: 40px;
          height: 40px;
          background: #007bff;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .supachatbot-send:hover {
          background: #0056b3;
        }

        .supachatbot-send:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .supachatbot-widget {
            bottom: 10px;
            right: 10px;
          }

          .supachatbot-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            bottom: 90px;
            right: 10px;
          }
        }
      </style>
    `;
  }

  // Add message to chat
  function addMessage(content, type = 'assistant') {
    const messagesContainer = document.getElementById('supachatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `supachatbot-message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'supachatbot-message-avatar';
    avatar.innerHTML = type === 'user' ? 
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>' :
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/></svg>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'supachatbot-message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    document.getElementById('supachatbot-typing').style.display = 'flex';
  }

  // Hide typing indicator
  function hideTyping() {
    document.getElementById('supachatbot-typing').style.display = 'none';
  }

  // Send message to API
  async function sendMessageToAPI(message) {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-Key': currentAgent.companyApiKey, // This is actually the agent API key
          'X-User-ID': currentAgent.userId
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId,
          conversationHistory: []
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // Global functions (attached to window)
  window.toggleChat = function() {
    const window = document.getElementById('supachatbot-window');
    const badge = document.getElementById('supachatbot-badge');
    
    isOpen = !isOpen;
    window.classList.toggle('open', isOpen);
    
    if (isOpen) {
      badge.style.display = 'none';
      document.getElementById('supachatbot-input').focus();
    }
  };

  window.handleKeyPress = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  window.sendMessage = async function() {
    const input = document.getElementById('supachatbot-input');
    const message = input.value.trim();
    
    if (!message || !currentAgent) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTyping();
    
    // Send to API
    const response = await sendMessageToAPI(message);
    
    // Hide typing indicator
    hideTyping();
    
    // Add AI response
    if (response.success) {
      addMessage(response.data.message, 'assistant');
    } else {
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
  };

  // Initialize widget
  function initWidget(config) {
    if (isInitialized) return;
    
    // Set configuration
    if (config.apiUrl) CONFIG.apiUrl = config.apiUrl;
    if (config.agentId) currentAgent = config;
    
    // Initialize session
    initSession();
    
    // Add CSS to head
    const style = document.createElement('div');
    style.innerHTML = createWidgetCSS();
    document.head.appendChild(style.firstElementChild);
    
    // Add widget to body
    const widget = document.createElement('div');
    widget.innerHTML = createWidgetHTML();
    document.body.appendChild(widget.firstElementChild);
    
    // Update agent info
    if (currentAgent) {
      document.getElementById('supachatbot-title').textContent = currentAgent.name || 'AI Assistant';
      document.getElementById('supachatbot-welcome-message').textContent = currentAgent.description || 'How can I help you today?';
    }
    
    isInitialized = true;
    console.log('SupaChatbot widget initialized');
  }

  // Auto-initialize if config is provided
  if (window.SupaChatbotConfig) {
    initWidget(window.SupaChatbotConfig);
  }

  // Export for manual initialization
  window.SupaChatbot = {
    init: initWidget,
    version: CONFIG.version
  };

})();
