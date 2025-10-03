import LandingHero from './LandingHero';
import FeaturesSection from './FeaturesSection';
import ChatWidgetContainer from '../ChatWidget/ChatWidgetContainer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <main className="max-w-6xl mx-auto px-6 py-20">
        <LandingHero />
        <FeaturesSection />
      </main>
      <ChatWidgetContainer />
    </div>
  );
}


