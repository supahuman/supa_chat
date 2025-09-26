'use client';
import { useState } from 'react';
import ChatWidget from './ChatWidget';

const ChatWidgetContainer = ({ isOpen, onToggle }) => {
  // If isOpen and onToggle are provided, use them (controlled mode)
  // Otherwise, use internal state (uncontrolled mode)
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const chatIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  return <ChatWidget isOpen={chatIsOpen} onToggle={handleToggle} />;
};

export default ChatWidgetContainer;
