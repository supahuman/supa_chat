'use client';

export default function ChatMessages({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Hi! I'm Viber, your AI assistant. How can I help you today?</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}


