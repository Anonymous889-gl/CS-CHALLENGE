"use client"

import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animation?: boolean
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height, 
  animation = true 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded'
  const animationClass = animation ? 'animate-pulse' : ''
  
  const variantClasses = {
    text: 'rounded-md',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
    />
  )
}

// Specific skeleton components for common use cases
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton className="h-5 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-4 mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export function SkeletonStats({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function SkeletonActivity({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border-b border-gray-100 last:border-b-0 ${className}`}>
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" className="w-8 h-8 mt-1" />
        <div className="flex-1">
          <Skeleton className="h-4 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}
