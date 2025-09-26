'use client';
import { X, MessageCircle } from 'lucide-react';

export default function ChatHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white sm:rounded-t-lg rounded-t-none">
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">Vibes Support</h3>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}


