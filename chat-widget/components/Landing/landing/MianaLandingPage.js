"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import GlassmorphicNavbar from "./GlassmorphicNavbar";
import HeroSection from "./HeroSection";
import PricingSection from "./PricingSection";
import WidgetLoader from "../../ChatWidget/WidgetLoader";

const MianaLandingPage = () => {
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
      <WidgetLoader />
    </div>
  );
};

export default MianaLandingPage;
