/**
 * Supa Chatbot Widget
 * Embeddable chat widget for websites
 */

(function() {
  'use strict';

  // Configuration defaults
  const DEFAULT_CONFIG = {
    clientId: null,
    apiUrl: null,
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    borderRadius: '8px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    showBranding: true,
    customCSS: '',
    autoOpen: false,
    greetingMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    debug: false
  };

  // Widget state
  let config = { ...DEFAULT_CONFIG };
  let isOpen = false;
  let isInitialized = false;
  let widgetContainer = null;
  let chatContainer = null;
  let messages = [];
  let sessionId = null;

  // Utility functions
  function log(...args) {
    if (config.debug) {
      console.log('[SupaChatbot]', ...args);
    }
  }

  function createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  function addStyles() {
    const styleId = 'supa-chatbot-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
      .supa-chatbot-widget {
        position: fixed;
        z-index: 9999;
        font-family: ${config.fontFamily};
        font-size: 14px;
        line-height: 1.5;
        color: #1f2937;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: ${config.borderRadius};
        overflow: hidden;
        transition: all 0.3s ease;
        max-width: 400px;
        width: 100%;
        height: 500px;
        background: white;
        border: 1px solid #e5e7eb;
      }

      .supa-chatbot-widget.dark {
        background: #1f2937;
        color: #f9fafb;
        border-color: #374151;
      }

      .supa-chatbot-widget.bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .supa-chatbot-widget.bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .supa-chatbot-widget.top-right {
        top: 20px;
        right: 20px;
      }

      .supa-chatbot-widget.top-left {
        top: 20px;
        left: 20px;
      }

      .supa-chatbot-toggle {
        position: fixed;
        z-index: 10000;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${config.primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
      }

      .supa-chatbot-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .supa-chatbot-toggle.bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .supa-chatbot-toggle.bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .supa-chatbot-toggle.top-right {
        top: 20px;
        right: 20px;
      }

      .supa-chatbot-toggle.top-left {
        top: 20px;
        left: 20px;
      }

      .supa-chatbot-header {
        background: ${config.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .supa-chatbot-title {
        font-weight: 600;
        font-size: 16px;
      }

      .supa-chatbot-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .supa-chatbot-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .supa-chatbot-messages {
        height: 350px;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .supa-chatbot-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        word-wrap: break-word;
      }

      .supa-chatbot-message.user {
        background: ${config.primaryColor};
        color: white;
        align-self: flex-end;
        margin-left: auto;
      }

      .supa-chatbot-message.bot {
        background: #f3f4f6;
        color: #1f2937;
        align-self: flex-start;
      }

      .supa-chatbot-message.bot.dark {
        background: #374151;
        color: #f9fafb;
      }

      .supa-chatbot-input-container {
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }

      .supa-chatbot-input-container.dark {
        border-color: #374151;
      }

      .supa-chatbot-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .supa-chatbot-input:focus {
        border-color: ${config.primaryColor};
      }

      .supa-chatbot-input.dark {
        background: #374151;
        border-color: #4b5563;
        color: #f9fafb;
      }

      .supa-chatbot-send {
        background: ${config.primaryColor};
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .supa-chatbot-send:hover {
        background: ${config.secondaryColor};
      }

      .supa-chatbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .supa-chatbot-loading {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #6b7280;
        font-size: 12px;
      }

      .supa-chatbot-loading.dark {
        color: #9ca3af;
      }

      .supa-chatbot-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        animation: supa-chatbot-bounce 1.4s infinite ease-in-out both;
      }

      .supa-chatbot-dot:nth-child(1) { animation-delay: -0.32s; }
      .supa-chatbot-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes supa-chatbot-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      .supa-chatbot-branding {
        text-align: center;
        padding: 8px;
        font-size: 11px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }

      .supa-chatbot-branding.dark {
        color: #6b7280;
        border-color: #374151;
      }

      .supa-chatbot-branding a {
        color: ${config.primaryColor};
        text-decoration: none;
      }

      .supa-chatbot-branding a:hover {
        text-decoration: underline;
      }

      ${config.customCSS}
    `;

    const styleElement = createElement('style', null, styles);
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function handleEscalation(escalation) {
    // Add escalation indicator to the chat
    const escalationElement = createElement('div', 'supa-chatbot-message bot supa-chatbot-escalation');
    escalationElement.innerHTML = `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 8px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 8px;">
            HUMAN AGENT
          </span>
          <span style="font-size: 12px; color: #92400e;">
            ${escalation.status === 'assigned' ? 'Connected' : 'In Queue'}
          </span>
        </div>
        <div style="font-size: 14px; color: #92400e;">
          ${escalation.status === 'assigned' 
            ? `You've been connected with ${escalation.agent.name}. They'll be with you shortly.`
            : 'A human agent will be with you shortly. You\'re currently in the queue.'
          }
        </div>
        ${escalation.estimatedWaitTime ? `
          <div style="font-size: 12px; color: #a16207; margin-top: 4px;">
            Estimated wait time: ${escalation.estimatedWaitTime}
          </div>
        ` : ''}
      </div>
    `;
    
    chatContainer.appendChild(escalationElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Update widget header to show human agent status
    const header = widgetContainer.querySelector('.supa-chatbot-header');
    if (header) {
      const title = header.querySelector('.supa-chatbot-title');
      if (title) {
        title.innerHTML = escalation.status === 'assigned' 
          ? `👤 ${escalation.agent.name}` 
          : '⏳ Agent Queue';
      }
    }
    
    // Disable input while waiting for agent
    const input = widgetContainer.querySelector('.supa-chatbot-input');
    const sendButton = widgetContainer.querySelector('.supa-chatbot-send');
    
    if (input) {
      input.disabled = true;
      input.placeholder = escalation.status === 'assigned' 
        ? 'Agent will respond shortly...' 
        : 'Waiting for agent...';
    }
    
    if (sendButton) {
      sendButton.disabled = true;
    }
    
    log('Escalation handled:', escalation);
  }

  function addMessage(content, role = 'bot') {
    messages.push({ content, role, timestamp: Date.now() });
    renderMessages();
  }

  function renderMessages() {
    if (!chatContainer) return;

    chatContainer.innerHTML = '';

    if (messages.length === 0) {
      addMessage(config.greetingMessage, 'bot');
      return;
    }

    messages.forEach(message => {
      const messageElement = createElement('div', `supa-chatbot-message ${message.role}`);
      messageElement.textContent = message.content;
      chatContainer.appendChild(messageElement);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function sendMessage(content) {
    if (!content.trim()) return;

    addMessage(content, 'user');

    const loadingElement = createElement('div', 'supa-chatbot-message bot supa-chatbot-loading');
    loadingElement.innerHTML = `
      <div class="supa-chatbot-dot"></div>
      <div class="supa-chatbot-dot"></div>
      <div class="supa-chatbot-dot"></div>
    `;
    chatContainer.appendChild(loadingElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
      const response = await fetch(`${config.apiUrl}/api/client/${config.clientId}/bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Remove loading element
      chatContainer.removeChild(loadingElement);
      
      if (data.success && data.response) {
        addMessage(data.response, 'bot');
        
        // Handle escalation
        if (data.escalation) {
          handleEscalation(data.escalation);
        }
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      }
    } catch (error) {
      log('Error sending message:', error);
      
      // Remove loading element
      if (chatContainer.contains(loadingElement)) {
        chatContainer.removeChild(loadingElement);
      }
      
      addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
    }
  }

  function createWidget() {
    if (widgetContainer) return;

    widgetContainer = createElement('div', `supa-chatbot-widget ${config.theme} ${config.position}`);
    widgetContainer.style.display = 'none';

    const header = createElement('div', 'supa-chatbot-header');
    header.innerHTML = `
      <div class="supa-chatbot-title">Chat Support</div>
      <button class="supa-chatbot-close" onclick="window.SupaChatbot.close()">×</button>
    `;

    chatContainer = createElement('div', 'supa-chatbot-messages');

    const inputContainer = createElement('div', `supa-chatbot-input-container ${config.theme}`);
    const input = createElement('input', `supa-chatbot-input ${config.theme}`);
    input.type = 'text';
    input.placeholder = config.placeholder;
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage(input.value);
        input.value = '';
      }
    });

    const sendButton = createElement('button', 'supa-chatbot-send');
    sendButton.innerHTML = '→';
    sendButton.onclick = () => {
      sendMessage(input.value);
      input.value = '';
    };

    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);

    let branding = '';
    if (config.showBranding) {
      branding = createElement('div', `supa-chatbot-branding ${config.theme}`);
      branding.innerHTML = 'Powered by <a href="https://supachatbot.com" target="_blank">Supa Chatbot</a>';
    }

    widgetContainer.appendChild(header);
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(inputContainer);
    if (branding) widgetContainer.appendChild(branding);

    document.body.appendChild(widgetContainer);
  }

  function createToggle() {
    const toggle = createElement('button', `supa-chatbot-toggle ${config.position}`);
    toggle.innerHTML = '💬';
    toggle.onclick = () => window.SupaChatbot.toggle();
    document.body.appendChild(toggle);
  }

  function init() {
    if (isInitialized) return;

    // Merge configuration
    if (window.SupaChatbotConfig) {
      config = { ...config, ...window.SupaChatbotConfig };
    }

    // Validate required config
    if (!config.clientId || !config.apiUrl) {
      console.error('[SupaChatbot] clientId and apiUrl are required');
      return;
    }

    sessionId = generateSessionId();
    addStyles();
    createWidget();
    createToggle();

    if (config.autoOpen) {
      setTimeout(() => window.SupaChatbot.open(), 1000);
    }

    isInitialized = true;
    log('SupaChatbot initialized', config);
  }

  // Public API
  window.SupaChatbot = {
    init,
    open() {
      if (!widgetContainer) return;
      widgetContainer.style.display = 'block';
      isOpen = true;
      log('Widget opened');
    },
    close() {
      if (!widgetContainer) return;
      widgetContainer.style.display = 'none';
      isOpen = false;
      log('Widget closed');
    },
    toggle() {
      isOpen ? this.close() : this.open();
    },
    sendMessage,
    addMessage,
    getConfig() {
      return { ...config };
    },
    updateConfig(newConfig) {
      config = { ...config, ...newConfig };
      log('Config updated', config);
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
