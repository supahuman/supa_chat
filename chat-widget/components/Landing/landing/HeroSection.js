'use client';

import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Build the Future of
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Agents
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create intelligent AI agents that understand your business, 
          engage with customers, and scale your operations effortlessly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Start Building Free
          </Link>
          <Link
            href="#demo"
            className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Watch Demo
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="text-sm text-gray-500">
          <p>No credit card required • 5-minute setup • Free forever plan</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
