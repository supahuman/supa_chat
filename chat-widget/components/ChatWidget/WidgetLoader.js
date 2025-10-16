"use client";

import { useEffect } from "react";

const WidgetLoader = () => {
  useEffect(() => {
    // Load widget script after component mounts
    const loadWidgetScript = () => {
      // Set the config first
      window.SupaChatbotConfig = {
        apiUrl: process.env.NEXT_PUBLIC_BOT_API_URL,
        agentId: process.env.NEXT_PUBLIC_AGENT_ID,
        companyApiKey: process.env.NEXT_PUBLIC_COMPANY_API_KEY,
        userId: process.env.NEXT_PUBLIC_USER_ID,
        name: "Miana AI Assistant",
        description: "AI Agent created with Miana Agent Builder",
        position: "bottom-right",
        theme: "default",
        showWelcomeMessage: true,
        autoOpen: false,
      };

      console.log("✅ window.SupaChatbotConfig set:", window.SupaChatbotConfig);

      // Load the widget script
      const script = document.createElement("script");
      script.src = `${process.env.NEXT_PUBLIC_EMBED_URL}/embed/embed-modular.js`;
      script.async = true;
      document.head.appendChild(script);
    };

    loadWidgetScript();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default WidgetLoader;
