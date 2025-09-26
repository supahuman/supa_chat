'use client';
import { MessageCircle } from 'lucide-react';

const ChatToggle = ({ onToggle, isOpen }) => {
  return (
    <button
      onClick={onToggle}
      data-chat-toggle="true"
      className={`fixed bottom-4 right-4 z-[10000] p-4 rounded-full shadow-lg transition-all duration-300 ${
        isOpen
          ? 'bg-gray-700 hover:bg-gray-800 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-110'
      }`}
      title={isOpen ? 'Close chat' : 'Start chat with AI assistant'}
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default ChatToggle;
