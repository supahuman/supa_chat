'use client';

const Backdrop = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-10 z-40 md:hidden"
      onClick={onClose}
    />
  );
};

export default Backdrop;
