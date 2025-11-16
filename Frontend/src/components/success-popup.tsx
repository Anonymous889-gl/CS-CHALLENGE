"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface SuccessPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessPopup({ isOpen, onClose }: SuccessPopupProps) {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            setTimeout(() => {
              onClose()
              router.push("/dashboard")
            }, 200)
            return 100
          }
          return prev + 100 / 30 // 3 seconds = 30 intervals of 100ms
        })
      }, 100)

      return () => clearInterval(timer)
    }
  }, [isOpen, onClose, router])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md rounded-xl bg-white shadow-lg border border-indigo-600/20"
          >
            <div className="flex flex-col items-center p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/10"
              >
                <span className="material-symbols-outlined text-4xl text-indigo-600">check_circle</span>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-2 text-2xl font-bold text-[#1f2937] font-[Manrope]"
              >
                Skills Updated!
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 text-[#4b5563] font-[Manrope]"
              >
                Your skills have been successfully updated. You will be redirected to the homepage shortly.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <div className="mb-2 flex justify-between text-sm font-medium text-[#4b5563] font-[Manrope]">
                  <span>Redirecting...</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <motion.div
                    className="h-2 rounded-full bg-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%`  }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
