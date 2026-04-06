"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', label, className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`}
        style={{
          borderTopColor: 'var(--primary, #6366f1)',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
        }}
      />
      {label && (
        <p className="text-sm font-medium text-slate-400">
          {label}
        </p>
      )}
    </div>
  );
}
