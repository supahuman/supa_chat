'use client';

import { Loader2 } from 'lucide-react';

const ChatMessages = ({ messages, isLoading, agentName }) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Start a conversation with {agentName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.type === 'customer' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
            message.type === 'customer' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}>
            {message.message}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
