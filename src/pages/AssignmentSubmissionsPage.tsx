import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Search,
  Trophy,
  User2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAssignmentSubmissions,
  type AssignmentSubmission,
} from '../services/assignment.api'

export default function AssignmentSubmissionsPage() {
  const { id: classroomId, assignmentId } = useParams<{
    id: string
    assignmentId: string
  }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: [
      'assignment-submissions',
      classroomId,
      assignmentId,
      page,
      limit,
      search,
    ],
    queryFn: () =>
      getAssignmentSubmissions(classroomId!, assignmentId!, {
        page,
        limit,
        search,
      }),
    enabled: !!(classroomId && assignmentId),
    select: (res) => res?.data,
  })

  const submissions = query.data?.data ?? []
  const totalPages = query.data?.totalPages ?? 1

  const statusColor: Record<AssignmentSubmission['status'], string> = {
    submitted: 'bg-blue-100 text-blue-700',
    graded: 'bg-green-100 text-green-700',
    late: 'bg-orange-100 text-orange-700',
    missing: 'bg-red-100 text-red-700',
  }

  const filtered = useMemo(() => submissions, [submissions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bài nộp</h1>
            <p className="text-sm text-gray-500">
              Lớp: {classroomId} • Bài tập: {assignmentId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh..."
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        {query.isLoading ? (
          <div className="text-gray-600">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Học sinh
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Lần nộp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Điểm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 grid place-items-center">
                          {s.student?.avatarUrl ? (
                            <img
                              src={s.student.avatarUrl}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User2 className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {s.student?.displayName ||
                              `${s.student?.firstName} ${s.student?.lastName}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{s.student?.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusColor[s.status]}`}
                      >
                        {s.status === 'graded' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : null}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{s.attempt}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">
                        <Trophy className="h-3.5 w-3.5" /> {s.score ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {s.submittedAt ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(s.submittedAt).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-gray-500"
                      colSpan={5}
                    >
                      Chưa có bài nộp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="text-sm text-gray-600">
            {page}/{totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  )
}
