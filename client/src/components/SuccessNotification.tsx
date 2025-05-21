import React from 'react';
import { Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from '@/components/ui/toast';

interface SuccessNotificationProps {
  count: number;
  onUndo: () => void;
  onClose: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  count,
  onUndo,
  onClose
}) => {
  return (
    <Toast>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="w-5 h-5 text-[#34A853]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="ml-3">
          <ToastTitle className="text-sm font-medium text-gray-900">Success!</ToastTitle>
          <ToastDescription className="mt-1 text-sm text-gray-600">
            {count} emails have been moved to trash.
          </ToastDescription>
          <div className="mt-2">
            <button 
              className="text-xs text-[#4285F4] hover:underline"
              onClick={onUndo}
            >
              Undo
            </button>
          </div>
        </div>
      </div>
      <ToastClose onClick={onClose} />
    </Toast>
  );
};

export default SuccessNotification;
