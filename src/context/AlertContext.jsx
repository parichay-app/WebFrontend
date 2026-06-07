import React, { createContext, useState, useContext } from 'react';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [config, setConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' | 'confirm' | 'choice'
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
    buttons: [] // custom choice buttons: [{ label, onClick, className }]
  });

  const showAlert = (message, title = 'Alert') => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        title,
        message,
        type: 'alert',
        confirmText: 'OK',
        cancelText: '',
        onConfirm: () => {
          closeAlert();
          resolve(true);
        },
        onCancel: null,
        buttons: []
      });
    });
  };

  const showConfirm = (message, title = 'Confirm', confirmText = 'OK', cancelText = 'Cancel') => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        onConfirm: () => {
          closeAlert();
          resolve(true);
        },
        onCancel: () => {
          closeAlert();
          resolve(false);
        },
        buttons: []
      });
    });
  };

  const showChoice = (message, buttons = [], title = 'Choose Option') => {
    setConfig({
      isOpen: true,
      title,
      message,
      type: 'choice',
      buttons: buttons.map(btn => ({
        ...btn,
        onClick: (...args) => {
          closeAlert();
          if (btn.onClick) btn.onClick(...args);
        }
      }))
    });
  };

  const closeAlert = () => {
    setConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showChoice, closeAlert }}>
      {children}

      {config.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 bg-opacity-70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-black border border-gray-800 rounded-2xl p-6 text-white shadow-2xl relative transform transition-all scale-100 duration-200 animate-scaleUp">
            
            {/* Header */}
            {config.title && (
              <h4 className="text-lg font-bold mb-2 tracking-tight text-white">
                {config.title}
              </h4>
            )}

            {/* Message Body */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {config.message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2.5">
              {config.type === 'alert' && (
                <button
                  onClick={config.onConfirm}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-full transition text-sm outline-none"
                >
                  {config.confirmText}
                </button>
              )}

              {config.type === 'confirm' && (
                <div className="flex space-x-3">
                  <button
                    onClick={config.onCancel}
                    className="flex-1 bg-transparent hover:bg-gray-900 border border-gray-800 text-white font-bold py-2.5 rounded-full transition text-sm outline-none"
                  >
                    {config.cancelText}
                  </button>
                  <button
                    onClick={config.onConfirm}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-full transition text-sm outline-none"
                  >
                    {config.confirmText}
                  </button>
                </div>
              )}

              {config.type === 'choice' && (
                <div className="flex flex-col space-y-2">
                  {config.buttons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={btn.onClick}
                      className={`w-full py-2.5 rounded-full font-bold text-sm transition outline-none ${
                        btn.className || 'bg-white hover:bg-gray-200 text-black'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                  <button
                    onClick={closeAlert}
                    className="w-full bg-transparent hover:bg-gray-900 border border-gray-800 text-white font-bold py-2.5 rounded-full transition text-sm outline-none mt-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useCustomAlert = () => useContext(AlertContext);
