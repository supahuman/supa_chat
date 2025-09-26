'use client';
import { X, MessageCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function ChatAuthPrompt({ onClose }) {
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Sign In Required</h3>
        <p className="text-[var(--color-text-secondary)] mb-6 text-sm">Please sign in to your African Vibes account to chat with Viber.</p>
        <Link href="/auth/login" onClick={onClose} className="inline-flex items-center space-x-2 px-6 py-3 bg-[var(--color-primary)] text-black rounded-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300 ease-out hover:scale-105 font-medium">
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </Link>
        <p className="text-xs text-[var(--color-text-secondary)] mt-4">
          Don't have an account?{' '}
          <Link href="/auth/signup" onClick={onClose} className="text-[var(--color-primary)] hover:underline transition-colors duration-200">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}


