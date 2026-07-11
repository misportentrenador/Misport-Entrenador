import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...rest }) => (
  <div className={`bg-misportDark rounded-xl border border-gray-800 ${className}`} {...rest}>
    {children}
  </div>
);
