import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

interface DropdownMenuProps {
  label: string
  children: React.ReactNode
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-black/5 bg-white/95 shadow-lg backdrop-blur">
          <div className="flex flex-col py-1">{children}</div>
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  to: string
  children: React.ReactNode
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  to,
  children,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 text-sm ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`
      }
    >
      {children}
    </NavLink>
  )
}
