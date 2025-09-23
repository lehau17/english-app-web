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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên lớp, giáo viên, mã lớp…"
            className="rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="bg-transparent outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã kết thúc</option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <span className="text-gray-600">Sắp xếp</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="bg-transparent outline-none"
            >
              <option value="recent">Mới cập nhật</option>
              <option value="students">Số học sinh</option>
              <option value="assignments">Số bài tập</option>
            </select>
            <button
              onClick={() => setAsc(!asc)}
              className="rounded p-1 hover:bg-gray-50"
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
    </div>
  )
}
