"use client";

import { Suspense } from "react";

function DocsContent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Miana AI Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about creating, deploying, and managing
            AI agents with Miana
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Getting Started
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  •{" "}
                  <a href="#what-is-miana" className="hover:text-blue-600">
                    What is Miana AI?
                  </a>
                </li>
                <li>
                  •{" "}
                  <a href="#creating-agents" className="hover:text-blue-600">
                    Creating Your First Agent
                  </a>
                </li>
                <li>
                  •{" "}
                  <a
                    href="#agent-configuration"
                    className="hover:text-blue-600"
                  >
                    Agent Configuration
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Integration</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  •{" "}
                  <a href="#widget-embedding" className="hover:text-blue-600">
                    Widget Embedding
                  </a>
                </li>
                <li>
                  •{" "}
                  <a href="#api-integration" className="hover:text-blue-600">
                    API Integration
                  </a>
                </li>
                <li>
                  •{" "}
                  <a href="#customization" className="hover:text-blue-600">
                    Customization Options
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* What is Miana AI */}
          <section
            id="what-is-miana"
            className="bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What is Miana AI?
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                Miana AI is a comprehensive platform for creating, deploying,
                and managing intelligent AI agents. Our platform allows you to
                build custom chatbots that can understand your business, answer
                customer questions, and provide personalized assistance 24/7.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Key Features:</strong> Natural conversation flow,
                  knowledge base integration, customizable responses,
                  multi-platform deployment, and real-time analytics.
                </p>
              </div>
            </div>
          </section>

          {/* Creating Agents */}
          <section
            id="creating-agents"
            className="bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Creating Your First Agent
            </h2>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Step-by-Step Guide
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>
                  <strong>Sign Up:</strong> Create your Miana AI account and
                  verify your email address
                </li>
                <li>
                  <strong>Choose a Plan:</strong> Start with our Free plan (50
                  credits/month), or upgrade to Starter ($29/month),
                  Professional ($99/month), or Enterprise ($299/month)
                </li>
                <li>
                  <strong>Create Agent:</strong> Use our Agent Builder to define
                  your agent&apos;s personality and capabilities
                </li>
                <li>
                  <strong>Add Knowledge:</strong> Upload documents, FAQs, or
                  manually input information for your agent to learn from
                </li>
                <li>
                  <strong>Test & Deploy:</strong> Test your agent in the preview
                  mode, then deploy to your website
                </li>
              </ol>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
                <p className="text-green-800">
                  <strong>Pro Tip:</strong> Start with a simple agent focused on
                  your most common customer questions, then gradually add more
                  complex capabilities as you learn the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Agent Configuration */}
          <section
            id="agent-configuration"
            className="bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Agent Configuration
            </h2>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Essential Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Agent Personality
                  </h4>
                  <p className="text-gray-700 mb-2">
                    Define how your agent communicates:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Tone: Professional, friendly, casual, or technical</li>
                    <li>
                      Response style: Concise, detailed, or conversational
                    </li>
                    <li>
                      Specialization: Customer support, sales, technical help,
                      etc.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Knowledge Base
                  </h4>
                  <p className="text-gray-700 mb-2">
                    Upload and organize your content:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>PDF documents, Word files, and text files</li>
                    <li>FAQ sections and knowledge articles</li>
                    <li>Product catalogs and service descriptions</li>
                    <li>Company policies and procedures</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Conversation Flow
                  </h4>
                  <p className="text-gray-700 mb-2">
                    Configure how your agent handles conversations:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Welcome messages and greetings</li>
                    <li>Escalation to human agents when needed</li>
                    <li>Conversation timeouts and session management</li>
                    <li>Follow-up questions and clarification requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Widget Embedding */}
          <section
            id="widget-embedding"
            className="bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Widget Embedding
            </h2>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Easy Integration
              </h3>
              <p className="text-gray-700 mb-4">
                Add your AI agent to any website with just a few lines of code:
              </p>

              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  {`<!-- Add this code before </body> tag -->
<script>
  window.SupaChatbotConfig = {
    apiUrl: 'https://your-api-domain.com',
    agentId: 'agent_1234567890_abcdef123',
    companyApiKey: 'sk_your_company_api_key',
    userId: 'user_1234567890',
    name: 'Your AI Assistant',
    description: 'AI Agent created with Miana Agent Builder',
    position: 'bottom-right',
    theme: 'default',
    showWelcomeMessage: true,
    autoOpen: false
  };
</script>
<script src="https://your-cdn-domain.com/embed/embed-modular.js" async></script>`}
                </pre>
              </div>

              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Customization Options
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>
                  <strong>Position:</strong> bottom-right, bottom-left,
                  top-right, top-left
                </li>
                <li>
                  <strong>Theme:</strong> default, light, dark, or custom colors
                </li>
                <li>
                  <strong>Behavior:</strong> auto-open, welcome messages,
                  conversation history
                </li>
                <li>
                  <strong>Styling:</strong> custom CSS, fonts, colors, and
                  branding
                </li>
              </ul>
            </div>
          </section>

          {/* API Integration */}
          <section
            id="api-integration"
            className="bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              API Integration
            </h2>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                RESTful API
              </h3>
              <p className="text-gray-700 mb-4">
                Integrate Miana AI into your existing applications using our
                comprehensive REST API:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-900">Chat Endpoint</h4>
                  <code className="text-blue-800">POST /api/agent/chat</code>
                  <p className="text-blue-700 text-sm mt-1">
                    Send messages to your agent and receive responses
                  </p>
                </div>

                <div className="border-l-4 border-green-400 bg-green-50 p-4">
                  <h4 className="font-medium text-green-900">
                    Agent Management
                  </h4>
                  <code className="text-green-800">
                    GET/POST/PUT /api/agent
                  </code>
                  <p className="text-green-700 text-sm mt-1">
                    Create, update, and manage your agents
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
                  <h4 className="font-medium text-purple-900">
                    Knowledge Base
                  </h4>
                  <code className="text-purple-800">
                    POST /api/agent/knowledge
                  </code>
                  <p className="text-purple-700 text-sm mt-1">
                    Upload and manage agent knowledge
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Plans */}
          <section id="pricing" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Pricing & Plans
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-8">
                Miana AI uses a credit-based system for flexible, cost-effective
                usage. Start with our free plan to test the platform, then
                upgrade as your needs grow. Credits reset monthly and can be
                topped up anytime.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Free
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mb-4">
                    $0<span className="text-lg text-gray-500">/month</span>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 1 AI Agent</li>
                    <li>• 50 credits/month</li>
                    <li>• Basic knowledge base</li>
                    <li>• Community support</li>
                    <li>• Perfect for testing</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Starter
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    $29<span className="text-lg text-gray-500">/month</span>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 1 AI Agent</li>
                    <li>• 500 credits/month</li>
                    <li>• Basic knowledge base</li>
                    <li>• Email support</li>
                  </ul>
                </div>

                <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                      Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Professional
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    $99<span className="text-lg text-gray-500">/month</span>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 5 AI Agents</li>
                    <li>• 2,000 credits/month</li>
                    <li>• Advanced knowledge base</li>
                    <li>• Priority support</li>
                    <li>• Analytics dashboard</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Enterprise
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    $299<span className="text-lg text-gray-500">/month</span>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Unlimited AI Agents</li>
                    <li>• 10,000+ credits/month</li>
                    <li>• Custom integrations</li>
                    <li>• 24/7 phone support</li>
                    <li>• Custom training</li>
                    <li>• Priority credit top-ups</li>
                  </ul>
                </div>
              </div>

              {/* Credit System Explanation */}
              <div className="mt-12 bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  How Credits Work
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      Credit Usage
                    </h4>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• Simple conversation: 1-2 credits</li>
                      <li>• Complex conversation: 5-10 credits</li>
                      <li>• File upload/processing: 10-20 credits</li>
                      <li>• Custom training: 50+ credits</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      Credit Benefits
                    </h4>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• Fresh credits every month</li>
                      <li>• Buy additional credits anytime</li>
                      <li>• Use credits however you want</li>
                      <li>• No surprise overage charges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section
            id="troubleshooting"
            className="bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Troubleshooting
            </h2>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Common Issues
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Widget Not Loading
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      Check that all required environment variables are set
                    </li>
                    <li>Verify the agent ID and API key are correct</li>
                    <li>Ensure the embed script URL is accessible</li>
                    <li>Check browser console for JavaScript errors</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Agent Not Responding
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Verify the agent is properly trained with knowledge</li>
                    <li>Check that the agent is active and deployed</li>
                    <li>Review conversation logs for error messages</li>
                    <li>Test the agent in the preview mode first</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Knowledge Base Issues
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Ensure uploaded documents are in supported formats</li>
                    <li>Check that documents are properly processed</li>
                    <li>Verify knowledge base is linked to the agent</li>
                    <li>Test with simple questions first</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section id="support" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Support & Contact
            </h2>
            <div className="prose prose-lg max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Get Help
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>
                      <strong>Email Support:</strong>
                      <br />
                      <a
                        href="mailto:support@miana-ai.com"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        support@miana-ai.com
                      </a>
                    </li>
                    <li>
                      <strong>Documentation:</strong>
                      <br />
                      <a
                        href="/docs"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Complete API Documentation
                      </a>
                    </li>
                    <li>
                      <strong>Community:</strong>
                      <br />
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        Join our Discord community
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Business Hours
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST
                    </li>
                    <li>
                      <strong>Saturday:</strong> 10:00 AM - 4:00 PM EST
                    </li>
                    <li>
                      <strong>Sunday:</strong> Closed
                    </li>
                    <li>
                      <strong>Emergency:</strong> 24/7 for Enterprise customers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">
            Need more help?{" "}
            <a
              href="mailto:support@miana-ai.com"
              className="text-blue-600 hover:text-blue-800"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading documentation...
        </div>
      }
    >
      <DocsContent />
    </Suspense>
  );
}
