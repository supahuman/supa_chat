'use client';

import { useEffect, useRef, useState } from 'react';
import { useSendMessageMutation } from '../../../store/botApi';

export function useChatSession(isOpen, clientId = 'supa-chat') {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sendMessageReq, { isLoading }] = useSendMessageMutation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate a unique session ID when chat is opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [isOpen, sessionId]);

  // Reset session and messages when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setSessionId(null);
      setMessages([]);
      setInputMessage('');
    }
  }, [isOpen]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await sendMessageReq({ message: userMessage, sessionId, clientId }).unwrap();
      if (response?.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again later." },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        name: error?.name
      });
      
      let errorMessage = 'Connection failed. Make sure the backend is running on http://localhost:4000';
      
      if (error?.status) {
        errorMessage = `HTTP ${error.status}: ${error.data?.message || error.message || 'Server error'}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${errorMessage}` },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sendMessage,
    handleKeyPress,
    messagesEndRef,
    inputRef,
  };
}


