import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-misportBlue hover:bg-blue-600 text-white shadow-lg',
  secondary: 'bg-misportOrange hover:bg-orange-600 text-white shadow-lg',
  danger: 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50',
  ghost: 'text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...rest }) => (
  <button
    className={`flex items-center justify-center gap-2 font-bold px-5 py-2.5 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
