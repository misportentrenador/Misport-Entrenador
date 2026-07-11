import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', id, children, ...rest }) => {
  const selectId = id ?? rest.name;
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all text-sm ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
};
