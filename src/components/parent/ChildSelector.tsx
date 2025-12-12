import type { JSX } from 'react'

interface Child {
  id: string
  name: string
  displayName?: string
  firstName?: string
}

interface ChildSelectorProps {
  children: Child[]
  selectedChildId: string | null
  onSelect: (childId: string) => void
  variant?: 'dropdown' | 'tabs'
}

export default function ChildSelector({
  children,
  selectedChildId,
  onSelect,
  variant = 'dropdown',
}: ChildSelectorProps): JSX.Element {
  if (children.length <= 1) {
    return <></>
  }

  if (variant === 'tabs') {
    return (
      <div className="flex items-center gap-2 border-b border-gray-200">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              selectedChildId === child.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {child.displayName || child.name || child.firstName}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Chọn con
      </label>
      <select
        value={selectedChildId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.displayName || child.name || child.firstName}
          </option>
        ))}
      </select>
    </div>
  )
}
