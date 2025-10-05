'use client';

import { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useCreateAgentMutation, useChatWithAgentMutation, useGetConversationQuery } from '@/store/botApi';

const ChatInterface = ({ currentChat, setCurrentChat, currentAgent, agentData }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('agentChatSessionId');
    if (stored) return stored;
    const newSessionId = `session-${Date.now()}`;
    localStorage.setItem('agentChatSessionId', newSessionId);
    return newSessionId;
  });

  const [createAgent] = useCreateAgentMutation();
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

    const newChat = [...currentChat, { type: 'customer', message: message.trim() }];
    setCurrentChat(newChat);
    setMessage('');
    setIsLoading(true);
    
    try {
      let agentToUse = currentAgent;
      if (!agentToUse && agentData.name) {
        const result = await createAgent(agentData).unwrap();
        if (result.success) agentToUse = result.data;
      }

      const data = await chatWithAgent({
        message: message.trim(),
        sessionId,
        agentId: agentToUse?.id,
        personality: agentToUse?.personality || agentData.personality,
        conversationHistory: currentChat.slice(-5)
      }).unwrap();
      
      if (data.success) {
        setCurrentChat(prev => [...prev, { type: 'agent', message: data.response }]);
      }
    } catch (error) {
      setCurrentChat(prev => [...prev, { type: 'agent', message: 'Sorry, I had trouble responding. Please try again.' }]);
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

  const agentName = currentAgent?.name || agentData.name || 'Your Agent';

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