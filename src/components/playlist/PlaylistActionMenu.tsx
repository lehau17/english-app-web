import { Edit, Plus, Share2, Trash2 } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import type { Playlist } from '../../services/playlist.api'

interface PlaylistActionMenuProps {
  playlist: Playlist
  onAction: (action: string) => void
  onClose: () => void
}

const PlaylistActionMenu: React.FC<PlaylistActionMenuProps> = ({
  onAction,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItems = [
    {
      label: 'Chỉnh sửa',
      icon: Edit,
      action: 'edit',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Thêm podcast',
      icon: Plus,
      action: 'add-podcast',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Chia sẻ',
      icon: Share2,
      action: 'share',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Xóa',
      icon: Trash2,
      action: 'delete',
      className: 'text-red-600 hover:bg-red-50',
    },
  ]

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5"
    >
      {menuItems.map(({ label, icon: Icon, action, className }) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${className}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

export default PlaylistActionMenu
