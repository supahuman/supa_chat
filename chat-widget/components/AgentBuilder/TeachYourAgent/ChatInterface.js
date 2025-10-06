'use client';

import { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChatWithAgentMutation, useGetConversationQuery } from '@/store/botApi';

const ChatInterface = ({ currentChat, setCurrentChat, currentAgent }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('agentChatSessionId');
    if (stored) return stored;
    const newSessionId = `session-${Date.now()}`;
    localStorage.setItem('agentChatSessionId', newSessionId);
    return newSessionId;
  });

  const [chatWithAgent] = useChatWithAgentMutation();
  const { data: conversationData } = useGetConversationQuery(sessionId);

  useEffect(() => {
    if (conversationData?.success && conversationData.data?.messages) {
      const messages = conversationData.data.messages.map(msg => ({
        type: msg.role === 'user' ? 'customer' : 'agent',
        message: msg.content
      }));
      setCurrentChat(messages);
    }
  }, [conversationData, setCurrentChat]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Check if we have an agent to chat with
    if (!currentAgent) {
      setCurrentChat(prev => [...prev, { 
        type: 'agent', 
        message: 'Please save your agent first in the Build tab before chatting.' 
      }]);
      return;
    }

    const userMessage = message.trim();
    const newChat = [...currentChat, { type: 'customer', message: userMessage }];
    setCurrentChat(newChat);
    setMessage(''); // Clear input but keep focus
    setIsLoading(true);
    
    try {
      console.log('💬 Chatting with agent:', currentAgent);
      
      const data = await chatWithAgent({
        message: userMessage,
        sessionId,
        agentId: currentAgent.agentId || currentAgent.id,
        personality: currentAgent.personality,
        conversationHistory: currentChat.slice(-5)
      }).unwrap();
      
      if (data.success) {
        setCurrentChat(prev => [...prev, { type: 'agent', message: data.response }]);
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      setCurrentChat(prev => [...prev, { 
        type: 'agent', 
        message: 'Sorry, I had trouble responding. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentChat([]);
    setMessage('');
    localStorage.removeItem('agentChatSessionId');
    window.location.reload();
  };

  const agentName = currentAgent?.name || 'Your Agent';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <ChatHeader agentName={agentName} onClose={handleClose} />
      <ChatMessages 
        messages={currentChat} 
        isLoading={isLoading} 
        agentName={agentName} 
      />
      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatInterface;