"use client"

import React from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-gray-400 text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-[Manrope]">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm font-[Manrope]">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm font-[Manrope]"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm font-[Manrope]"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

// Specific empty state components for common scenarios
export function NoActivitiesEmpty({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon="timeline"
      title="No Recent Activity"
      description="Start using our tools to see your activity here. Try reviewing your resume or taking a practice interview."
      action={{
        label: "Get Started",
        href: "/resume-reviewer"
      }}
      className={className}
    />
  )
}

export function NoJobsEmpty({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon="work_outline"
      title="No Job Matches Yet"
      description="Complete your profile and skills to get personalized job recommendations."
      action={{
        label: "Complete Profile",
        href: "/profile"
      }}
      className={className}
    />
  )
}

export function NoNotificationsEmpty({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon="notifications_none"
      title="No Notifications"
      description="You're all caught up! We'll notify you when there's something new."
      className={className}
    />
  )
}

export function NoResultsEmpty({ 
  searchTerm, 
  onClear, 
  className = '' 
}: { 
  searchTerm?: string
  onClear?: () => void
  className?: string 
}) {
  return (
    <EmptyState
      icon="search_off"
      title="No Results Found"
      description={searchTerm ? `No results found for "${searchTerm}". Try adjusting your search terms.` : "No results found. Try different search criteria."}
      action={onClear ? {
        label: "Clear Search",
        onClick: onClear
      } : undefined}
      className={className}
    />
  )
}

export function NoConnectionEmpty({ 
  onRetry, 
  className = '' 
}: { 
  onRetry?: () => void
  className?: string 
}) {
  return (
    <EmptyState
      icon="wifi_off"
      title="Connection Error"
      description="Unable to load data. Check your internet connection and try again."
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry
      } : undefined}
      className={className}
    />
  )
}

export function ProfileIncompleteEmpty({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon="person_outline"
      title="Complete Your Profile"
      description="Fill out your profile to unlock all features and get better job matches."
      action={{
        label: "Complete Profile",
        href: "/profile"
      }}
      className={className}
    />
  )
}

export function MaintenanceEmpty({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon="build"
      title="Under Maintenance"
      description="This feature is temporarily unavailable while we make improvements. Please check back later."
      className={className}
    />
  )
}
