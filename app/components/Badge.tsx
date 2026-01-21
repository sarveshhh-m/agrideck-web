'use client';
import React from 'react';

// Interfaces for badge props and styles
interface BadgeProps {
  type: 'role' | 'status';
  value: string | null;
}

interface StyleMap {
  [key: string]: string;
}

// Style definitions for different badge types
const roleStyles: StyleMap = {
  admin: 'bg-purple-100 text-purple-800',
  farmer: 'bg-green-100 text-green-800',
  trader: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const statusStyles: StyleMap = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800',
};

const baseBadgeClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";

// Reusable Badge Component
export default function Badge({ type, value }: BadgeProps) {
  if (!value) return null;

  const styles = type === 'role' ? roleStyles : statusStyles;
  const styleClass = styles[value] || styles.default;

  return <span className={`${baseBadgeClass} ${styleClass}`}>{value}</span>;
}
