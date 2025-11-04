import { Filter, Search, SortAsc, SortDesc } from 'lucide-react'
import type { JSX } from 'react'

interface ClassroomToolbarProps {
  query: string
  setQuery: (query: string) => void
  status: 'all' | 'active' | 'inactive'
  setStatus: (status: 'all' | 'active' | 'inactive') => void
  sortKey: 'recent' | 'students' | 'assignments'
  setSortKey: (sortKey: 'recent' | 'students' | 'assignments') => void
  asc: boolean
  setAsc: (asc: boolean) => void
}

export default function ClassroomToolbar({
  query,
  setQuery,
  status,
  setStatus,
  sortKey,
  setSortKey,
  asc,
  setAsc,
}: ClassroomToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên lớp, giáo viên..."
          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="bg-transparent outline-none text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Kết thúc</option>
          </select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm">
          <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">
            Sắp xếp:
          </span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
            className="bg-transparent outline-none text-xs sm:text-sm"
          >
            <option value="recent">Mới nhất</option>
            <option value="students">Học sinh</option>
            <option value="assignments">Bài tập</option>
          </select>
          <button
            onClick={() => setAsc(!asc)}
            className="rounded p-1 hover:bg-gray-50 ml-1"
            aria-label="Đảo chiều sắp xếp"
            title="Đảo chiều sắp xếp"
          >
            {asc ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
