import LandingHero from './LandingHero';
import FeaturesSection from './FeaturesSection';
import ChatWidgetContainer from '../ChatWidget/ChatWidgetContainer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <LandingHero />
        <FeaturesSection />
      </main>
      {/* <ChatWidgetContainer /> */}
      
      {/* SupaChatbot Widget */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.SupaChatbotConfig = {
              apiUrl: 'http://localhost:4000',
              agentId: 'agent_1759879385307_asr04fuhc',
              companyApiKey: 'sk_e60d12d3196055498e2ec4e076ec947e',
              userId: 'embed_user_1759881276252',
              name: 'Test AI',
              description: 'AI Agent created with Agent Builder',
              position: 'bottom-right',
              theme: 'default',
              showWelcomeMessage: true,
              autoOpen: false
            };
          `
        }}
      />
      <script src="http://localhost:3000/embed.js" async></script>
    </div>
  );
}


