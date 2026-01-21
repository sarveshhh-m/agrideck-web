'use client';

import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  disabled?: boolean;
  defaultOptionLabel: string;
  className?: string;
}

export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
  disabled = false,
  defaultOptionLabel,
  className = '',
}: FilterDropdownProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-600 whitespace-nowrap">{label}:</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px] disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{defaultOptionLabel}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
