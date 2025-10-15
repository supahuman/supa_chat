/**
 * SupaChatbot Widget Styles
 * CSS styling for the widget
 */

(function () {
  "use strict";

  function addStyles() {
    const styleId = "supachatbot-styles";
    if (document.getElementById(styleId)) return;

    const styles = `
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
    `;

    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Initialize styles
  function init() {
    addStyles();
  }

  // Export for global access
  window.SupaChatbotStyles = {
    init,
    addStyles,
  };
})();
