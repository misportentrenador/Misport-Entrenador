import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Tailwind max-width class for the dialog. Defaults to max-w-md. */
  maxWidthClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidthClassName = 'max-w-md' }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative bg-misportDark border border-gray-800 rounded-xl shadow-2xl w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h2 className="font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
