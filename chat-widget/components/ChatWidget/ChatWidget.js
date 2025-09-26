'use client';
import React from 'react';
// Auth temporarily removed; will re-enable later
import { useChatSession } from './hooks/useChatSession';
import ChatHeader from './parts/ChatHeader';
import ChatMessages from './parts/ChatMessages';
import ChatInput from './parts/ChatInput';

const ChatWidget = ({ isOpen, onClose }) => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sendMessage,
    handleKeyPress,
    messagesEndRef,
    inputRef,
  } = useChatSession(isOpen);

  const handleSend = () => {
    sendMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto sm:w-80 sm:h-96 md:w-96 md:h-[500px] lg:w-[400px] lg:h-[600px] xl:w-[450px] xl:h-[650px] bg-white dark:bg-gray-900 sm:rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-[9999] animate-in slide-in-from-bottom-4 duration-300 ease-out data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:duration-300">
      {/* Header */}
      <ChatHeader onClose={onClose} />

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />

      {/* Input */}
      <ChatInput inputRef={inputRef} inputMessage={inputMessage} setInputMessage={setInputMessage} isLoading={isLoading} onSend={handleSend} onKeyPress={handleKeyPress} />
    </div>
  );
};

export default ChatWidget;
