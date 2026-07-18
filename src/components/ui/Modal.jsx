import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in"
      >
        {title && (
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-2xl leading-none"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;