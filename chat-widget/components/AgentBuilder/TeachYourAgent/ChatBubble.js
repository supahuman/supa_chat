'use client';

import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/ui';

const ChatBubble = ({ message, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.message);

  const handleSaveEdit = () => {
    onEdit(editValue);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(message.message);
    setIsEditing(false);
  };

  const isCustomer = message.type === 'customer';
  const isEditable = message.isEditable && !isCustomer;
  const isPending = message.isPending;

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isCustomer ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start space-x-2 ${isCustomer ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCustomer 
              ? 'bg-blue-600' 
              : 'bg-gray-600'
          }`}>
            <span className="text-white text-sm font-medium">
              {isCustomer ? 'C' : 'A'}
            </span>
          </div>

          {/* Message Bubble */}
          <div className={`rounded-lg px-3 py-2 ${
            isCustomer 
              ? 'bg-blue-600 text-white' 
              : isPending
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-700'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows="2"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveEdit}
                    variant="success"
                    size="xs"
                    icon={Check}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    size="xs"
                    icon={X}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between space-x-2">
                <p className="text-sm">{message.message}</p>
                {isEditable && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="xs"
                    icon={Edit2}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Label */}
        <div className={`text-xs text-muted mt-1 ${isCustomer ? 'text-right' : 'text-left'}`}>
          {isCustomer ? 'Customer' : isPending ? 'Agent (Pending Review)' : 'Agent'}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
