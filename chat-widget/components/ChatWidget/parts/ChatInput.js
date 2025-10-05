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
          className="flex-1 input-base"
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={!inputMessage.trim() || isLoading}
          className="btn-primary"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


