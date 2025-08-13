import React from 'react';

export const Progress = ({ value = 0, className = '', ...props }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div 
        className="h-full bg-blue-600 transition-all duration-500 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};