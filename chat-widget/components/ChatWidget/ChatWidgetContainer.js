'use client';

import { useState } from 'react';
import ChatWidget from './ChatWidget.js';
import ChatToggle from './ChatToggle.js';

const ChatWidgetContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      // Delay the actual closing to allow for exit animation
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300); // Match the duration of the exit animation
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Delay the actual closing to allow for exit animation
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match the duration of the exit animation
  };

  return (
    <>
      {!isOpen && <ChatToggle onToggle={handleToggle} isOpen={isOpen} />}
      {(isOpen || isClosing) && (
        <ChatWidget isOpen={isOpen && !isClosing} onClose={handleClose} />
      )}
    </>
  );
};

export default ChatWidgetContainer;
