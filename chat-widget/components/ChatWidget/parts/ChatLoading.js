'use client';
import { X, MessageCircle, Loader2 } from 'lucide-react';

export default function ChatLoading({ onClose }) {
  return (
    <div className="fixed inset-0 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto sm:w-80 sm:h-96 md:w-96 md:h-[500px] lg:w-[400px] lg:h-[600px] xl:w-[450px] xl:h-[650px] bg-[var(--color-card-bg)] sm:rounded-lg shadow-xl border border-[var(--color-card-border)] flex flex-col z-[9999] animate-in slide-in-from-bottom-4 duration-300 ease-out data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:duration-300">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-card-border)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-black sm:rounded-t-lg rounded-t-none">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Vibes Support</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-all duration-200 hover:scale-110">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">Loading...</span>
        </div>
      </div>
    </div>
  );
}


