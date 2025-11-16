import type { ReactNode } from "react"
import { useRouter } from "next/navigation"

export default function MenuItem({
  icon,
  label,
  href = "#",
  onClick,
}: {
  icon: ReactNode
  label: string
  href?: string
  onClick?: () => void
}) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // First close the dropdown
    if (onClick) {
      onClick()
    }
    
    // Then navigate after a short delay to allow animation
    setTimeout(() => {
      if (href !== "#") {
        router.push(href)
      }
    }, 150)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex min-h-10 items-center gap-3 bg-[#fdfcfa] px-4 hover:bg-gray-100 transition-colors text-left"
    >
      <div className="size-8 shrink-0 rounded-lg bg-[#f0f3f4] flex items-center justify-center text-[#111518]">
        {icon}
      </div>
      <p className="flex-1 truncate text-sm font-normal text-[#111518]">{label}</p>
    </button>
  )
}
