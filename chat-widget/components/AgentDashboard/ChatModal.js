'use client';

import { Modal, Input, Button } from '@/ui';

const ChatModal = ({ 
  selectedEscalation, 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onClose 
}) => {
  return (
    <Modal
      isOpen={!!selectedEscalation}
      onClose={onClose}
      title={`Chat with ${selectedEscalation?.sessionId || ''}`}
      size="md"
      className="h-96"
    >
      <div className="space-y-4">
        {selectedEscalation?.messages.map((message, index) => (
          <div key={index} className={`flex ${message.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              message.senderType === 'agent' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            className="flex-1"
          />
          <Button onClick={onSendMessage}>
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChatModal;
