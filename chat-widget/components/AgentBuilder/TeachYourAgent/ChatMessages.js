'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import TypingBubbles from './TypingBubbles';

const ChatMessages = ({ messages, isLoading, agentName }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
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
    <div ref={containerRef} className="flex-1 p-4 space-y-3 overflow-y-auto">
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
            <TypingBubbles />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
