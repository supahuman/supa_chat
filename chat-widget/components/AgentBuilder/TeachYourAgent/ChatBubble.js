'use client';

const ChatBubble = ({ message }) => {
  const isCustomer = message.type === 'customer';

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isCustomer ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-end space-x-2 ${isCustomer ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCustomer 
              ? 'bg-blue-500' 
              : 'bg-gray-500'
          }`}>
            <span className="text-white text-sm font-medium">
              {isCustomer ? 'You' : 'AI'}
            </span>
          </div>
          
          {/* Message Bubble */}
          <div className={`px-4 py-3 rounded-2xl ${
            isCustomer
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;