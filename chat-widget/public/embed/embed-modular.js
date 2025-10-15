/**
 * SupaChatbot Embeddable Widget - Modular Version
 * A lightweight, embeddable chat widget for websites
 *
 * This is the modular version that loads separate components:
 * - widget-core.js: Core functionality and state management
 * - widget-ui.js: UI components and templates
 * - widget-api.js: API communication
 * - widget-styles.js: CSS styling
 */

(function () {
  "use strict";

  // Load required modules
  function loadModule(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Initialize widget with modules
  async function initWidget(config) {
    try {
      // Load all modules
      await Promise.all([
        loadModule("./embed/widget-core.js"),
        loadModule("./embed/widget-ui.js"),
        loadModule("./embed/widget-api.js"),
        loadModule("./embed/widget-styles.js"),
      ]);

      // Initialize styles first
      if (window.SupaChatbotStyles) {
        window.SupaChatbotStyles.init();
      }

      // Initialize core widget
      if (window.SupaChatbotCore) {
        window.SupaChatbotCore.initWidget(config);
      }

      console.log("SupaChatbot modular widget initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SupaChatbot widget:", error);
    }
  }

  // Auto-initialize if config is provided
  if (window.SupaChatbotConfig) {
    initWidget(window.SupaChatbotConfig);
  }

  // Export for manual initialization
  window.SupaChatbot = {
    init: initWidget,
    version: "1.0.0-modular",
  };
})();
