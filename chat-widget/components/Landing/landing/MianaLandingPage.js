"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import GlassmorphicNavbar from "./GlassmorphicNavbar";
import HeroSection from "./HeroSection";
import PricingSection from "./PricingSection";

const MianaLandingPage = () => {
  console.log('🎯 MianaLandingPage component is rendering');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for upgrade cancel message (success redirects to agent-builder)
    const upgrade = searchParams.get("upgrade");
    if (upgrade === "canceled") {
      alert("Upgrade canceled. You can try again anytime.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      {/* Glassmorphic Navbar */}
      <GlassmorphicNavbar />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Features Section - Coming Soon */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Build the Future of AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create intelligent agents that understand your business and serve
              your customers with precision.
            </p>
          </div>
        </section>
      </main>

      {/* Chatbot Widget */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.log('🔍 Environment Variables Debug:');
            console.log('NEXT_PUBLIC_BOT_API_URL:', '${process.env.NEXT_PUBLIC_BOT_API_URL}' || 'UNDEFINED');
            console.log('NEXT_PUBLIC_AGENT_ID:', '${process.env.NEXT_PUBLIC_AGENT_ID}' || 'UNDEFINED');
            console.log('NEXT_PUBLIC_COMPANY_API_KEY:', '${process.env.NEXT_PUBLIC_COMPANY_API_KEY}' || 'UNDEFINED');
            console.log('NEXT_PUBLIC_USER_ID:', '${process.env.NEXT_PUBLIC_USER_ID}' || 'UNDEFINED');
            console.log('NEXT_PUBLIC_EMBED_URL:', '${process.env.NEXT_PUBLIC_EMBED_URL}' || 'UNDEFINED');
            
            window.SupaChatbotConfig = {
              apiUrl: '${process.env.NEXT_PUBLIC_BOT_API_URL}',
              agentId: '${process.env.NEXT_PUBLIC_AGENT_ID}',
              companyApiKey: '${process.env.NEXT_PUBLIC_COMPANY_API_KEY}',
              userId: '${process.env.NEXT_PUBLIC_USER_ID}',
              name: 'Miana AI Assistant',
              description: 'AI Agent created with Miana Agent Builder',
              position: 'bottom-right',
              theme: 'default',
              showWelcomeMessage: true,
              autoOpen: false
            };
            
            console.log('window.SupaChatbotConfig:', window.SupaChatbotConfig);
          `,
        }}
      />
      <script
        src={`${process.env.NEXT_PUBLIC_EMBED_URL}/embed/embed-modular.js`}
        async={true}
      ></script>
    </div>
  );
};

export default MianaLandingPage;
