'use client';

import GlassmorphicNavbar from './GlassmorphicNavbar';
import HeroSection from './HeroSection';

const MianaLandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Glassmorphic Navbar */}
      <GlassmorphicNavbar />
      
      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section - Coming Soon */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Build the Future of AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create intelligent agents that understand your business and serve your customers with precision.
            </p>
          </div>
        </section>
      </main>

      {/* Chatbot Widget */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.SupaChatbotConfig = {
              apiUrl: 'https://supa-chat.onrender.com',
              agentId: 'agent_1759879385307_asr04fuhc',
              companyApiKey: 'sk_e60d12d3196055498e2ec4e076ec947e',
              userId: 'embed_user_1759881276252',
              name: 'Miana AI Assistant',
              description: 'AI Agent created with Miana Agent Builder',
              position: 'bottom-right',
              theme: 'default',
              showWelcomeMessage: true,
              autoOpen: false
            };
          `
        }}
      />
      <script src="https://miana-ai.vercel.app/embed.js" async></script>
    </div>
  );
};

export default MianaLandingPage;
