'use client';
import { Send } from 'lucide-react';

export default function ChatInput({ inputRef, inputMessage, setInputMessage, isLoading, onSend, onKeyPress }) {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


