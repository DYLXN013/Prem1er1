import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'video';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  variant = 'card' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-700 rounded';
  
  const variantClasses = {
    card: 'aspect-video',
    text: 'h-4',
    avatar: 'w-10 h-10 rounded-full',
    video: 'aspect-video w-full'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};