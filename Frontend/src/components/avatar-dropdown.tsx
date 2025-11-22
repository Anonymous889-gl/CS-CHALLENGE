"use client"

import { useState, useRef, useEffect } from "react"
import { User, Settings, LogOut, Bookmark, Link2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MenuItem from "./MenuItem"
import { useRouter } from "next/navigation"

interface AvatarDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function AvatarDropdown({ isOpen, onClose }: AvatarDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)

  // Fetch user data when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('authToken')
          if (token) {
            const response = await fetch('http://localhost:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
            if (response.ok) {
              const data = await response.json()
              setUserData(data.user)
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      fetchUserData()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const avatarButton = document.getElementById('avatar-button')
      const avatarContainer = document.getElementById('avatar-container')
      
      // Don't close if clicking the avatar button or container
      if (avatarButton?.contains(target) || avatarContainer?.contains(target)) {
        return
      }
      
      // Close if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        onClose()
      }
    }

    if (isOpen) {
      // Use a small delay to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  const handleLogout = () => {
    // Remove auth token and any user-specific cached data
    ;['authToken','connectedProfiles','recentProfileAnalysis','savedJobs','savedJobsData','applicationsCount'].forEach(k => localStorage.removeItem(k))
    onClose()
    router.push("/")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute right-0 top-full mt-2 w-48 bg-[#fdfcfa] rounded-lg shadow-xl border-2 border-gray-300 py-1 z-50 backdrop-blur-sm"
        >
      {/* User Info Header - More Compact */}
      <div className="px-3 py-1.5 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm truncate">
          {userData ? `${userData.name} ${userData.surname}` : "User"}
        </p>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <MenuItem icon={<User className="w-4 h-4" />} label="Profile" href="/profile" onClick={onClose} />
        <MenuItem icon={<Bookmark className="w-4 h-4" />} label="Saved Jobs" href="/saved-jobs" onClick={onClose} />
        <MenuItem icon={<Link2 className="w-4 h-4" />} label="Linked Profiles" href="/settings" onClick={onClose} />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex min-h-10 items-center gap-3 bg-[#fdfcfa] px-4 hover:bg-gray-100 transition-colors"
        >
          <div className="size-8 shrink-0 rounded-lg bg-[#f0f3f4] flex items-center justify-center text-[#111518]">
            <LogOut className="w-4 h-4" />
          </div>
          <p className="flex-1 truncate text-sm font-normal text-[#111518] text-left">Sign out</p>
        </button>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
