'use client';

import { useState } from 'react';
import { Send, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Button, Card } from '@/ui';
import { Input } from '@/ui';
import ChatBubble from './ChatBubble';

const ChatInterface = ({ 
  currentChat, 
  setCurrentChat, 
  onSaveExample 
}) => {
  const [customerMessage, setCustomerMessage] = useState('');
  const [pendingResponse, setPendingResponse] = useState(null);

  const handleSendCustomerMessage = () => {
    if (!customerMessage.trim()) return;

    const newChat = [
      ...currentChat,
      { type: 'customer', message: customerMessage.trim() }
    ];
    setCurrentChat(newChat);
    setCustomerMessage('');
    
    // Simulate AI response (placeholder)
    setTimeout(() => {
      const aiResponse = {
        type: 'agent',
        message: 'This is how your agent would respond. Click to edit or rate this response.',
        isPending: true,
        id: Date.now()
      };
      setPendingResponse(aiResponse);
    }, 1000);
  };

  const handleApproveResponse = () => {
    if (pendingResponse) {
      const newChat = [...currentChat, { ...pendingResponse, isPending: false, rating: 'good' }];
      setCurrentChat(newChat);
      setPendingResponse(null);
      
      // Auto-save as training example
      const customerMsg = currentChat[currentChat.length - 1]?.message;
      if (customerMsg) {
        onSaveExample({
          customerMessage: customerMsg,
          agentResponse: pendingResponse.message
        });
      }
    }
  };

  const handleRejectResponse = () => {
    if (pendingResponse) {
      setPendingResponse({ ...pendingResponse, isPending: false, rating: 'bad' });
    }
  };

  const handleEditPendingResponse = (newMessage) => {
    setPendingResponse({ ...pendingResponse, message: newMessage });
  };

  const handleReset = () => {
    setCurrentChat([]);
    setCustomerMessage('');
    setPendingResponse(null);
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="heading-lg">
            Test Your Agent
          </h4>
          <Button
            onClick={handleReset}
            variant="secondary"
            size="sm"
            icon={RotateCcw}
          >
            New Chat
          </Button>
        </div>

        {/* Chat Messages - Customer Facing Style */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          {currentChat.length === 0 && !pendingResponse ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-secondary">Start a conversation to test your agent</p>
              <p className="text-sm text-muted mt-1">Type a message below to see how your agent responds</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentChat.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                  onEdit={() => {}}
                />
              ))}
              
              {/* Pending Response */}
              {pendingResponse && (
                <div className="space-y-3">
                  <ChatBubble
                    message={pendingResponse}
                    onEdit={handleEditPendingResponse}
                  />
                  
                  {/* Response Actions */}
                  <div className="flex items-center justify-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      How should your agent respond?
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleApproveResponse}
                        variant="success"
                        size="sm"
                        icon={ThumbsUp}
                      >
                        Good Response
                      </Button>
                      <Button
                        onClick={handleRejectResponse}
                        variant="danger"
                        size="sm"
                        icon={ThumbsDown}
                      >
                        Needs Improvement
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Input - Bottom of Chat */}
        <div className="flex space-x-2">
          <Input
            type="text"
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            placeholder="Type a message to test your agent..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendCustomerMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendCustomerMessage}
            icon={Send}
            disabled={!customerMessage.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
