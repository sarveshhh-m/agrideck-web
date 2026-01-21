import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: 'p-0',
};

export default function Card({
  children,
  className = '',
  title,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}
