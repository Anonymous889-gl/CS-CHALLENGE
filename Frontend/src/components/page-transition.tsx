"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import React, { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
}

import type { Transition } from "framer-motion"

const pageTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.15,
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function AdvancedPageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Simplified list - no stagger animation
export function StaggeredList({ 
  children, 
  className = "",
  staggerDelay = 0 
}: { 
  children: ReactNode[] | ReactNode
  className?: string
  staggerDelay?: number 
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Simplified section - no parallax
export function ParallaxSection({ 
  children, 
  offset = 0,
  className = "" 
}: { 
  children: ReactNode
  offset?: number
  className?: string 
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Simplified element - no floating
export function FloatingElement({ 
  children, 
  duration = 0,
  className = "" 
}: { 
  children: ReactNode
  duration?: number
  className?: string 
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
