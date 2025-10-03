'use client';
import { useState } from 'react';
import { Copy, Check, Code, Palette, Settings } from 'lucide-react';

export default function WidgetCodeGenerator({ client }) {
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    showBranding: true,
    autoOpen: false,
    greetingMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...'
  });

  const generateCode = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BOT_API_URL || 'https://your-api-domain.com';
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://your-cdn-domain.com';
    
    return `<!-- Supa Chatbot Widget -->
<script>
  window.SupaChatbotConfig = {
    clientId: '${client?.clientId || 'your-client-id'}',
    apiUrl: '${baseUrl}',
    theme: '${config.theme}',
    position: '${config.position}',
    primaryColor: '${config.primaryColor}',
    secondaryColor: '${config.secondaryColor}',
    borderRadius: '${config.borderRadius}',
    fontFamily: '${config.fontFamily}',
    showBranding: ${config.showBranding},
    autoOpen: ${config.autoOpen},
    greetingMessage: '${config.greetingMessage}',
    placeholder: '${config.placeholder}'
  };
</script>
<script src="${cdnUrl}/supa-chatbot.js" async></script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!client) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Select a client to generate widget code</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Widget Code Generator
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate embeddable code for {client.name}
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Configuration Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Basic Settings</span>
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme
            </label>
            <select
              value={config.theme}
              onChange={(e) => setConfig({...config, theme: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Position
            </label>
            <select
              value={config.position}
              onChange={(e) => setConfig({...config, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Radius
            </label>
            <select
              value={config.borderRadius}
              onChange={(e) => setConfig({...config, borderRadius: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="4px">Small (4px)</option>
              <option value="8px">Medium (8px)</option>
              <option value="12px">Large (12px)</option>
              <option value="16px">Extra Large (16px)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showBranding"
              checked={config.showBranding}
              onChange={(e) => setConfig({...config, showBranding: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showBranding" className="text-sm text-gray-700 dark:text-gray-300">
              Show Supa Chatbot branding
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoOpen"
              checked={config.autoOpen}
              onChange={(e) => setConfig({...config, autoOpen: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoOpen" className="text-sm text-gray-700 dark:text-gray-300">
              Auto-open widget on page load
            </label>
          </div>
        </div>

        {/* Color Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Colors & Styling</span>
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Secondary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#1E40AF"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Family
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="system-ui, sans-serif">System UI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Greeting Message
            </label>
            <input
              type="text"
              value={config.greetingMessage}
              onChange={(e) => setConfig({...config, greetingMessage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Hi! How can I help you today?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Input Placeholder
            </label>
            <input
              type="text"
              value={config.placeholder}
              onChange={(e) => setConfig({...config, placeholder: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Type your message..."
            />
          </div>
        </div>
      </div>

      {/* Generated Code */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Generated Code</h4>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm whitespace-pre-wrap">{generateCode()}</pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to Use</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Copy the generated code above</li>
          <li>Paste it before the closing <code>&lt;/body&gt;</code> tag on your website</li>
          <li>Replace the API URL with your actual domain</li>
          <li>Test the widget on your website</li>
        </ol>
      </div>
    </div>
  );
}
