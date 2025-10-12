import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion' // <-- NEW
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Gamepad2,
  Headphones,
  MessageSquare,
  Mic,
  MoreVertical,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Trophy,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type JSX } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import CreateAssignmentModal from '../components/classroom/CreateAssignmentModal'
import ConversationWidget from '../components/conversation/ConversationWidget'
import UserDetailModal from '../components/user/UserDetailModel'
import { useAuth } from '../context/AuthContext'
import { useConversation } from '../context/useConversation'
import { useClassroomAnnouncements } from '../hooks/useClassroomAnnouncements'
import { useClassroomDetail } from '../hooks/useClassroomDetail'
import { useNextLesson } from '../hooks/useNextLesson'
import { useStudentDetail, useTeacherDetail } from '../hooks/useUserDetail'
import {
  deleteAssignment,
  downloadAssignmentPdf,
  downloadPdfFromBlob,
  setAssignmentPublish,
} from '../services/assignment.api'
import { createClassroomAnnouncement } from '../services/classroom-detail.api'
import { createClassroomConversation } from '../services/conversation.api'
import type {
  ClassroomAnnouncement,
  ClassroomDetailResponse,
} from '../types/classroom-detail.type'

interface StudentRecord {
  joinedAt: string // ISO
  isActive: boolean
  notes?: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  displayName: string
  avatarUrl: string
  studentRecord: StudentRecord
}

interface Assignment {
  id: string
  title: string
  description?: string | null
  instructions?: string | null
  dueDate?: string | null // ISO
  status?: string
  isPublished: boolean
  totalPoints: number
  timeLimit?: number | null // minutes
  maxAttempts: number
  createdAt: string // ISO
  _count: { submissions: number }
  activities?: any[]
}

type AnnouncementPriority = 'high' | 'normal' | 'low'
type Announcement = ClassroomAnnouncement

type ActivityType =
  | 'vocab'
  | 'pronunciation'
  | 'listening'
  | 'speaking'
  | 'mini_game'
  | 'reading'
  | 'writing'
  | 'grammar'
  | 'quiz'
  | 'flashcard'
  | 'conversation'
  | 'fill_blank'
  | 'dictation'
  | 'matching'

interface ActivityUI {
  id: string
  lessonId: string
  orderNo: number
  type: ActivityType
  title: string
  duration?: number // minutes (optional)
  passingScore?: number // optional
  // progress fields (optional mock)
  state?: 'not_started' | 'in_progress' | 'done' | 'mastered'
}

interface LessonUI {
  id: string
  title: string
  orderNo: number
  estimatedTime?: number
  difficulty?: 'beginner' | 'elementary' | 'intermediate'
  activities: ActivityUI[]
}

/**
 * =========================
 * UI Sub-components (typed)
 * =========================
 */

type AssignmentCardProps = {
  assignment: Assignment
  detail: ClassroomDetailResponse
  onViewSubmissions?: (id: string) => void
  onTogglePublish?: (a: Assignment) => void
  onEdit?: (a: Assignment) => void
  onDelete?: (a: Assignment) => void
  onDownloadPdf?: (a: Assignment) => void
}

type StudentAssignmentCardProps = {
  assignment: Assignment
  submission?: {
    id: string
    score: number | null
    status: 'submitted' | 'graded' | 'late' | 'missing'
    attempt: number
    submittedAt: string | null
  } | null
  onStartAssignment?: (id: string) => void
  onViewResult?: (id: string) => void
  onDownloadPdf?: (a: Assignment) => void
}

function StudentAssignmentCard({
  assignment,
  submission,
  onStartAssignment,
  onViewResult,
  onDownloadPdf,
}: StudentAssignmentCardProps): JSX.Element {
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isOverdue = !!dueDate && dueDate < new Date()

  // Use real submission data instead of mock data
  const hasSubmitted = !!submission
  const score = submission?.score || null
  const attempts = submission?.attempt || 0 // này là attemptCount từ backend

  const getStatusColor = () => {
    if (hasSubmitted && score !== null) {
      if (score >= 80) return 'bg-green-100 text-green-700'
      if (score >= 60) return 'bg-yellow-100 text-yellow-700'
      return 'bg-red-100 text-red-700'
    }
    if (isOverdue) return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
  }

  const getStatusText = () => {
    if (hasSubmitted && score !== null) {
      return `Đã nộp - ${score} điểm`
    }
    if (isOverdue) return 'Quá hạn'
    return 'Chưa làm'
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor()}`}
            >
              {hasSubmitted && score !== null ? (
                <CheckCircle className="h-3 w-3" />
              ) : isOverdue ? (
                <XCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {getStatusText()}
            </div>
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-600 mb-2">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {dueDate ? (
                <>
                  Hạn nộp: {dueDate.toLocaleDateString('vi-VN')} lúc{' '}
                  {dueDate.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              ) : (
                <span>Không hạn</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {assignment.totalPoints} điểm
            </div>
            {assignment.timeLimit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {assignment.timeLimit} phút
              </div>
            )}
          </div>

          {assignment.instructions && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-2">
              <strong>Hướng dẫn:</strong> {assignment.instructions}
            </p>
          )}

          {hasSubmitted && score !== null && (
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <strong>Kết quả:</strong> Lần {attempts}/{assignment.maxAttempts}{' '}
              - Điểm: {score}/100 -
              {score >= 80 ? 'Xuất sắc' : score >= 60 ? 'Khá' : 'Cần cải thiện'}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {assignment.maxAttempts > 1 && (
              <>Cho phép làm tối đa {assignment.maxAttempts} lần</>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadPdf?.(assignment)}
              className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm text-green-700 hover:bg-green-100"
            >
              <Download className="h-4 w-4" />
              Tải PDF
            </button>

            {hasSubmitted ? (
              <>
                <button
                  onClick={() => onViewResult?.(assignment.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  Xem kết quả
                </button>

                {attempts < assignment.maxAttempts && !isOverdue && (
                  <button
                    onClick={() => onStartAssignment?.(assignment.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                  >
                    <Play className="h-4 w-4" />
                    Làm lại ({attempts}/{assignment.maxAttempts})
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onStartAssignment?.(assignment.id)}
                disabled={isOverdue && !assignment.isPublished}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  isOverdue && !assignment.isPublished
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Play className="h-4 w-4" />
                Bắt đầu làm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AssignmentCard({
  assignment,
  detail,
  onViewSubmissions,
  onTogglePublish,
  onEdit,
  onDelete,
  onDownloadPdf,
}: AssignmentCardProps): JSX.Element {
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isOverdue = !!dueDate && dueDate < new Date()
  const completionRate =
    (assignment._count.submissions / detail._count.students) * 100

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{assignment.title}</h4>
          {assignment.description && (
            <p className="text-sm text-gray-600 mb-2">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {dueDate ? (
                <>
                  {dueDate.toLocaleDateString('vi-VN')} lúc{' '}
                  {dueDate.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              ) : (
                <span>Không hạn</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {assignment.totalPoints} điểm
            </div>
            {assignment.timeLimit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {assignment.timeLimit} phút
              </div>
            )}
          </div>

          {assignment.instructions && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Hướng dẫn:</strong> {assignment.instructions}
            </p>
          )}
        </div>

        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {isOverdue ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <CheckCircle className="h-3 w-3" />
            )}
            {isOverdue ? 'Quá hạn' : 'Đang mở'}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {assignment._count.submissions}/{detail._count.students} học sinh đã
            nộp
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(completionRate)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
          <button
            onClick={() => onViewSubmissions?.(assignment.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50"
          >
            <Trophy className="h-4 w-4" /> Bài nộp (
            {assignment._count.submissions})
          </button>
          <button
            onClick={() => onDownloadPdf?.(assignment)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100"
          >
            <Download className="h-4 w-4" />
            Tải PDF
          </button>
          <button
            onClick={() => onTogglePublish?.(assignment)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${assignment.isPublished ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800 text-white hover:bg-black'}`}
          >
            {assignment.isPublished ? 'Đang xuất bản' : 'Nháp'}
          </button>
          <button
            onClick={() => onEdit?.(assignment)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete?.(assignment)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>

      {/* Modals */}
    </div>
  )
}

type AnnouncementCardProps = { announcement: Announcement }

function AnnouncementCard({
  announcement,
}: AnnouncementCardProps): JSX.Element {
  const priorityColors: Record<AnnouncementPriority, string> = {
    high: 'border-red-200 bg-red-50 text-red-800',
    normal: 'border-blue-200 bg-blue-50 text-blue-800',
    low: 'border-gray-200 bg-gray-50 text-gray-800',
  }

  const priorityIcons: Record<AnnouncementPriority, LucideIcon> = {
    high: AlertCircle,
    normal: Bell,
    low: MessageSquare,
  }

  const Icon =
    priorityIcons[announcement.priority as AnnouncementPriority] ?? Bell

  return (
    <div
      className={`rounded-xl border p-4 ${priorityColors[announcement.priority as AnnouncementPriority] ?? priorityColors.normal}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium mb-2">{announcement.title}</h4>
          <p className="text-sm mb-3 leading-relaxed">{announcement.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs opacity-75">
              <span>
                {new Date(announcement.createdAt).toLocaleDateString('vi-VN')}{' '}
                lúc{' '}
                {new Date(announcement.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {announcement.targetAll && (
                <>
                  <span>•</span>
                  <span>Gửi tất cả học sinh</span>
                </>
              )}
            </div>
            {announcement.priority === 'high' && (
              <span className="text-xs font-medium">Ưu tiên cao</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dropdown component cho student actions
function StudentActionDropdown({
  onViewInfo,
  onSendMessage,
  isOpen,
  onToggle,
  onClose,
  showSendMessage = true,
}: {
  onViewInfo: () => void
  onSendMessage: () => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  showSendMessage?: boolean
}): JSX.Element {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="p-1 rounded-lg hover:bg-gray-100 transition"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-10 min-w-[140px]">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onViewInfo()
                onClose()
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Eye className="h-4 w-4" />
              Xem thông tin
            </button>
            {showSendMessage && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSendMessage()
                  onClose()
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <MessageSquare className="h-4 w-4" />
                Nhắn tin riêng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type StudentCardProps = {
  student: Student
  onViewInfo?: (id: string) => void
  onSendMessage?: (student: Student) => void
  currentUserId?: string
}

function StudentCard({
  student,
  onViewInfo,
  onSendMessage,
  currentUserId,
}: StudentCardProps): JSX.Element {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const showSendMessage = currentUserId ? student.id !== currentUserId : true

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
      <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
        <img
          src={student.avatarUrl}
          alt={student.displayName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">
          {student.displayName}
        </p>
        <p className="text-xs text-gray-500">
          Tham gia:{' '}
          {new Date(student.studentRecord.joinedAt).toLocaleDateString('vi-VN')}
        </p>
        {student.studentRecord.notes && (
          <p className="text-xs text-blue-600 mt-1">
            {student.studentRecord.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            student.studentRecord.isActive ? 'bg-green-400' : 'bg-gray-300'
          }`}
        />
        <span className="text-xs text-gray-500">
          {student.studentRecord.isActive ? 'Hoạt động' : 'Không hoạt động'}
        </span>

        {/* Dropdown menu */}
        <StudentActionDropdown
          onViewInfo={() => onViewInfo?.(student.id)}
          onSendMessage={() => onSendMessage?.(student)}
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          onClose={() => setDropdownOpen(false)}
          showSendMessage={showSendMessage}
        />
      </div>
    </div>
  )
}

/** =========================
 * NEW: Activity icon utils
 * ========================= */
const activityIcon: Record<ActivityType, LucideIcon> = {
  vocab: BookOpen,
  flashcard: Copy,
  quiz: Trophy,
  grammar: FileText,
  reading: BookOpen,
  writing: FileText,
  listening: Headphones,
  speaking: MessageSquare,
  pronunciation: Mic,
  mini_game: Gamepad2,
  conversation: MessageSquare,
  fill_blank: FileText,
  dictation: Mic,
  matching: Copy,
}

const activityColor: Record<ActivityType, string> = {
  vocab: 'text-emerald-600',
  flashcard: 'text-indigo-600',
  quiz: 'text-amber-600',
  grammar: 'text-blue-600',
  reading: 'text-rose-600',
  writing: 'text-purple-600',
  listening: 'text-sky-600',
  speaking: 'text-teal-600',
  pronunciation: 'text-pink-600',
  mini_game: 'text-orange-600',
  conversation: 'text-cyan-600',
  fill_blank: 'text-emerald-600',
  dictation: 'text-pink-600',
  matching: 'text-indigo-600',
}

/** =========================
 * NEW: Lesson row with collapse animation
 * ========================= */
type LessonRowProps = {
  lesson: LessonUI
  isOpen: boolean
  onToggle: () => void
  onStart: (lessonId: string) => void
  onStartActivity: (lessonId: string, activityId: string) => void
  classroomStatus?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

function LessonRow({
  lesson,
  isOpen,
  onToggle,
  onStart,
  onStartActivity,
  classroomStatus,
}: LessonRowProps): JSX.Element {
  // Mock completion from activity states
  const total = lesson.activities.length
  const passed = lesson.activities.filter(
    (a) => a.state === 'done' || a.state === 'mastered'
  ).length
  const completion = total ? Math.round((passed / total) * 100) : 0

  const nextActivity = lesson.activities.find(
    (a) => a.state !== 'done' && a.state !== 'mastered'
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header row */}
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 gap-4 hover:bg-gray-50 rounded-xl transition cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`lesson-${lesson.id}-content`}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                #{lesson.orderNo}
              </span>
            </div>
            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {lesson.estimatedTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedTime} phút
                </span>
              )}
              {typeof completion === 'number' && (
                <span className="inline-flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{completion}%</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStart(lesson.id)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
          >
            <Play className="h-4 w-4" />
            {classroomStatus === 'upcoming'
              ? 'Xem trước'
              : nextActivity
                ? 'Tiếp tục học'
                : 'Ôn lại bài'}
          </button>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            transition={{ duration: 0.2 }}
            className="h-8 w-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white pointer-events-none"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="text-gray-500"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`lesson-${lesson.id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/50">
                {lesson.activities.map((a) => {
                  const Icon = activityIcon[a.type]
                  const color = activityColor[a.type]
                  const isDone = a.state === 'done' || a.state === 'mastered'
                  return (
                    <li
                      key={a.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-6 text-right">
                          #{a.orderNo}
                        </span>
                        <div
                          className={`h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center ${color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {a.title}
                          </p>
                          <div className="text-xs text-gray-500 flex items-center gap-3">
                            <span className="capitalize">
                              {a.type.replace('_', ' ')}
                            </span>
                            {a.duration && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {a.duration} phút
                              </span>
                            )}
                            {typeof a.passingScore === 'number' && (
                              <span className="inline-flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                Qua bài ≥ {a.passingScore}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-xs rounded-full bg-green-100 text-green-700 px-2 py-1">
                            <CheckCircle className="h-3 w-3" />
                            Hoàn thành
                          </span>
                        ) : (
                          <button
                            onClick={() => onStartActivity(lesson.id, a.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Bắt đầu
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * =========================
 * Main component (typed)
 * =========================
 */

type TabKey = 'overview' | 'assignments' | 'announcements' | 'students'

// Đã loại bỏ interface ClassroomDetailProps vì không còn dùng

export default function ClassroomDetail(props: {
  onBack: () => void
  classroomId?: string
}): JSX.Element {
  const { onBack } = props
  const { user } = useAuth()
  const { openWidget } = useConversation()
  const classroomIdFromUrl =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/').pop() || undefined
      : undefined

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [searchStudent, setSearchStudent] = useState<string>('')
  const [openLessonId, setOpenLessonId] = useState<string | null>(null)
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annLoading, setAnnLoading] = useState(false)
  const [openStudentId, setOpenStudentId] = useState<string | null>(null)
  const [openTeacherId, setOpenTeacherId] = useState<string | null>(null)
  const [showEditAssignment, setShowEditAssignment] = useState(false)
  const [editAssignmentId, setEditAssignmentId] = useState<string | undefined>(
    undefined
  )
  const [editInitial, setEditInitial] = useState<any>(undefined)
  const queryClient = useQueryClient()
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)

  const { id: classroomIdFromParams } = useParams<{ id: string }>()

  const {
    data: classroomDetail,
    isLoading,
    isError,
    error,
    refetch: refetchClassroomDetail,
  } = useClassroomDetail(classroomIdFromParams)

  // Lấy dữ liệu lesson tiếp theo từ API /next
  const role = user?.role
  const isTeacher = role === 'teacher'
  const isStudent = role === 'student'

  const { data: nextLessonData } = useNextLesson(isStudent)

  // Dữ liệu lớp học từ API
  const detail: ClassroomDetailResponse | undefined = classroomDetail
  // Load user details for modals
  const { data: studentDetail, isLoading: loadingStudentDetail } =
    useStudentDetail(openStudentId || undefined)
  const { data: teacherDetail, isLoading: loadingTeacherDetail } =
    useTeacherDetail(openTeacherId || undefined)

  const announcementPageSize = 5
  const [announcementPage, setAnnouncementPage] = useState(1)
  const {
    data: announcementsPage,
    isLoading: isLoadingAnnouncements,
    refetch: refetchAnnouncements,
  } = useClassroomAnnouncements(
    classroomIdFromParams,
    announcementPage,
    announcementPageSize
  )

  const announcements = announcementsPage?.data ?? []
  const announcementTotal =
    announcementsPage?.totalItems ?? detail?._count?.announcements ?? 0
  const hasNextAnnouncement = announcementsPage?.hasNextPage ?? false
  const hasPrevAnnouncement = announcementsPage?.hasPrevPage ?? false

  const copyClassCode = async (code: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code)
      console.log('Class code copied:', code)
    } catch (err) {
      console.error('Failed to copy class code:', err)
    }
  }

  const handleDownloadPdf = async (assignment: Assignment): Promise<void> => {
    try {
      toast.promise(
        downloadAssignmentPdf(assignment.id).then((blob) => {
          const filename = `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_Assignment.pdf`
          downloadPdfFromBlob(blob, filename)
        }),
        {
          loading: 'Đang tạo PDF...',
          success: 'Tải PDF thành công!',
          error: 'Không thể tải PDF. Vui lòng thử lại.',
        }
      )
    } catch (err) {
      console.error('Failed to download PDF:', err)
    }
  }

  // Handle null displayName for students
  const filteredStudents =
    detail?.students
      ?.map((student) => ({
        ...student,
        displayName:
          student.displayName ?? `${student.firstName} ${student.lastName}`,
      }))
      .filter((student) =>
        student.displayName.toLowerCase().includes(searchStudent.toLowerCase())
      ) ?? []

  const handleCreateAnnouncement = async () => {
    if (!classroomIdFromParams) return
    if (!annTitle.trim()) {
      toast.error('Nhập tiêu đề thông báo')
      return
    }
    try {
      setAnnLoading(true)
      await createClassroomAnnouncement(classroomIdFromParams, {
        title: annTitle.trim(),
        content: annBody.trim() || '',
      })
      toast.success('Đã gửi thông báo đến học viên trong lớp')
      setAnnTitle('')
      setAnnBody('')
      setShowAnnForm(false)
      if (announcementPage === 1) {
        await refetchAnnouncements()
      } else {
        setAnnouncementPage(1)
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gửi thông báo thất bại')
    } finally {
      setAnnLoading(false)
    }
  }

  // Handler để mở chat riêng với học sinh
  const handleSendMessageToStudent = async (student: Student) => {
    if (!classroomIdFromParams || !user?.id) return

    try {
      // Tạo personal conversation
      const newConversation = await createClassroomConversation(
        classroomIdFromParams,
        {
          type: 'personal',
          name: `Chat với ${student.displayName || student.firstName + ' ' + student.lastName}`,
          participantIds: [student.id],
        }
      )

      // Mở widget chat và chọn conversation vừa tạo
      openWidget(classroomIdFromParams, newConversation.id)

      toast.success(
        `Đã mở chat riêng với ${student.displayName || student.firstName + ' ' + student.lastName}`
      )
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo chat')
    }
  }

  // Handler để nhắn tin với giáo viên
  const handleSendMessageToTeacher = async () => {
    if (!classroomIdFromParams || !user?.id || !detail?.teacher) return

    try {
      // Tạo personal conversation với giáo viên
      const newConversation = await createClassroomConversation(
        classroomIdFromParams,
        {
          type: 'personal',
          name: `Chat với giáo viên ${detail.teacher.displayName || detail.teacher.firstName + ' ' + detail.teacher.lastName}`,
          participantIds: [detail.teacher.id],
        }
      )

      // Mở widget chat và chọn conversation vừa tạo
      openWidget(classroomIdFromParams, newConversation.id)

      toast.success(
        `Đã mở chat riêng với giáo viên ${detail.teacher.displayName || detail.teacher.firstName + ' ' + detail.teacher.lastName}`
      )
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Không thể tạo chat với giáo viên'
      )
    }
  }

  // Không có averageScore và completionRate trong API, có thể tính toán hoặc để 0
  const averageScore = 0
  const completionRate = 0

  const tabs: ReadonlyArray<{ id: TabKey; label: string; icon: LucideIcon }> = [
    { id: 'overview', label: 'Tổng quan', icon: BookOpen },
    { id: 'assignments', label: 'Bài tập', icon: FileText },
    { id: 'announcements', label: 'Thông báo', icon: Bell },
    { id: 'students', label: 'Học sinh', icon: Users },
  ] as const

  // Điều hướng khi bắt đầu học bài
  const handleStartLesson = (lessonId: string) => {
    if (!detail) return
    const lesson = detail.lessons?.find((l) => l.id === lessonId)
    const activityId = lesson?.activities?.[0]?.id
    if (classroomIdFromUrl && lessonId && activityId) {
      navigate(`/learn/${classroomIdFromUrl}/${lessonId}/${activityId}`)
    }
  }

  // Điều hướng khi bắt đầu học activity
  const handleStartActivity = (lessonId: string, activityId: string) => {
    if (!detail) return
    if (lessonId && activityId) {
      navigate(`/learn/${detail.id}/${lessonId}/${activityId}`)
    }
  }

  // Điều hướng khi nhấn "Tiếp tục học"
  const handleContinueLearning = () => {
    if (!nextLessonData) return

    // Lấy dữ liệu từ API /next
    const classroomId = nextLessonData.id // classroomId từ API
    const lessonId = nextLessonData.activity?.lessonId
    const activityId = nextLessonData.activity?.id

    if (classroomId && lessonId && activityId) {
      navigate(`/learn/${classroomId}/${lessonId}/${activityId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải dữ liệu lớp học...</div>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">
          Lỗi tải dữ liệu lớp học: {error?.message || ''}
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-lg p-2 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{detail?.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <button
                className="underline underline-offset-2 hover:text-gray-900"
                onClick={() => setOpenTeacherId(detail?.teacher?.id || null)}
              >
                {detail?.teacher?.displayName}
              </button>
              <span>•</span>
              <span
                className={`text-sm ${
                  detail?.isActive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {detail?.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: Global CTA “Tiếp tục học” */}
          {user?.role === 'student' && (
            <button
              onClick={handleContinueLearning}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
            >
              <Play className="h-4 w-4" />
              {detail?.status === 'upcoming'
                ? 'Xem trước buổi học'
                : 'Tiếp tục học'}
            </button>
          )}

          <button
            onClick={() => copyClassCode(detail?.classCode ?? '')}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 transition"
          >
            <Copy className="h-4 w-4" />
            {detail?.classCode}
          </button>
          <button
            className="rounded-lg p-2 hover:bg-gray-100 transition"
            aria-label="Share class"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg p-2 hover:bg-gray-100 transition"
            aria-label="More actions"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Học sinh</p>
              <p className="text-xl font-bold text-blue-900">
                {detail?._count?.students ?? 0}/{detail?.maxStudents ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-green-50 p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Bài tập</p>
              <p className="text-xl font-bold text-green-900">
                {detail?._count?.assignments ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-orange-50 p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-orange-700">Thông báo</p>
              <p className="text-xl font-bold text-orange-900">
                {announcementTotal}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-purple-50 p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700">Điểm trung bình</p>
              <p className="text-xl font-bold text-purple-900">
                {averageScore}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* NEW: Lesson List with collapse */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Danh sách bài học</h3>
                  <span className="text-sm text-gray-500">
                    {detail?.lessons?.length ?? 0} bài • ước tính ~
                    {detail?.lessons?.reduce(
                      (sum: number, l) => sum + (l.estimatedTime ?? 0),
                      0
                    ) ?? 0}{' '}
                    phút
                  </span>
                </div>

                <div className="space-y-3">
                  {detail?.lessons?.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={{
                        ...lesson,
                        difficulty: lesson.difficulty as
                          | 'beginner'
                          | 'elementary'
                          | 'intermediate'
                          | undefined,
                        activities: lesson.activities.map((a) => ({
                          ...a,
                          type: a.type as ActivityType,
                          duration:
                            a.duration === null ? undefined : a.duration,
                          passingScore:
                            a.passingScore === null
                              ? undefined
                              : a.passingScore,
                          state: undefined,
                        })),
                      }}
                      isOpen={openLessonId === lesson.id}
                      onToggle={() => {
                        setOpenLessonId(
                          openLessonId === lesson.id ? null : lesson.id
                        )
                      }}
                      onStart={handleStartLesson}
                      onStartActivity={handleStartActivity}
                      classroomStatus={detail?.status}
                    />
                  ))}
                </div>
              </div>

              {/* Existing: Thông tin lớp học */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-lg font-semibold mb-4">
                  Thông tin lớp học
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <p className="text-gray-600 mt-1">{detail?.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ngày tạo
                      </label>
                      <p className="text-gray-600 mt-1">
                        {detail?.createdAt &&
                          new Date(detail.createdAt).toLocaleDateString(
                            'vi-VN'
                          )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Lần cập nhật cuối
                      </label>
                      <p className="text-gray-600 mt-1">
                        {detail?.updatedAt &&
                          new Date(detail.updatedAt).toLocaleDateString(
                            'vi-VN'
                          )}
                      </p>
                    </div>
                  </div>
                  {/* Không có schedule trong API, ẩn UI này */}
                </div>
              </div>

              {/* Existing: Bài tập gần đây */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-lg font-semibold mb-4">
                  {isTeacher ? 'Bài tập gần đây' : 'Bài tập cần làm'}
                </h3>
                <div className="space-y-4">
                  {isTeacher
                    ? // Teacher view - Show recent assignments with management actions
                      detail?.assignments?.slice(0, 3).map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          detail={detail}
                          onViewSubmissions={(aid) =>
                            navigate(
                              `/classroom-detail/${detail.id}/assignments/${aid}/submissions`
                            )
                          }
                          onDownloadPdf={handleDownloadPdf}
                          onTogglePublish={async (a) => {
                            try {
                              await setAssignmentPublish(
                                detail.id,
                                a.id,
                                !a.isPublished
                              )
                              toast.success(
                                a.isPublished
                                  ? 'Đã chuyển sang Nháp'
                                  : 'Đã xuất bản'
                              )
                              await queryClient.invalidateQueries({
                                queryKey: ['classroom-detail', detail.id],
                              })
                            } catch (e: any) {
                              toast.error(
                                e?.response?.data?.message ||
                                  'Cập nhật trạng thái thất bại'
                              )
                            }
                          }}
                          onEdit={(a) => {
                            const initial = {
                              title: a.title,
                              description: a.description || '',
                              instructions: a.instructions || '',
                              dueDate: a.dueDate
                                ? new Date(a.dueDate).toISOString().slice(0, 16)
                                : '',
                              isPublished: a.isPublished,
                              totalPoints: a.totalPoints || 100,
                              timeLimit: a.timeLimit || undefined,
                              maxAttempts: a.maxAttempts || 1,
                              activities: (a.activities || []).map(
                                (ac: any) => ({
                                  type: ac.type,
                                  title: ac.title,
                                  instructions: ac.instructions || '',
                                  points: ac.points || 0,
                                  timeLimit: ac.timeLimit || undefined,
                                  maxAttempts: ac.maxAttempts || undefined,
                                  passingScore: ac.passingScore || undefined,
                                  difficulty: ac.difficulty || undefined,
                                  hints: ac.hints || [],
                                  content: ac.content,
                                })
                              ),
                            }
                            setEditInitial(initial)
                            setEditAssignmentId(a.id)
                            setShowEditAssignment(true)
                          }}
                          onDelete={async (a) => {
                            if (
                              !confirm(
                                'Xoá bài tập này? Hành động không thể hoàn tác.'
                              )
                            )
                              return
                            try {
                              await deleteAssignment(detail.id, a.id)
                              toast.success('Đã xoá bài tập')
                              await queryClient.invalidateQueries({
                                queryKey: ['classroom-detail', detail.id],
                              })
                            } catch (e: any) {
                              toast.error(
                                e?.response?.data?.message || 'Xoá thất bại'
                              )
                            }
                          }}
                        />
                      ))
                    : // Student view - Show published assignments that need attention
                      detail?.assignments
                        ?.filter((assignment) => assignment.isPublished)
                        ?.slice(0, 3)
                        ?.map((assignment) => (
                          <StudentAssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            submission={assignment.submission ?? null}
                            onDownloadPdf={handleDownloadPdf}
                            onStartAssignment={(aid) => {
                              navigate(
                                `/classroom/${detail.id}/assignment/${aid}`
                              )
                            }}
                            onViewResult={(aid) => {
                              navigate(
                                `/classroom/${detail.id}/assignment/${aid}/result`
                              )
                            }}
                          />
                        ))}
                  {detail?.assignments?.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      {isTeacher
                        ? 'Chưa có bài tập nào'
                        : 'Chưa có bài tập nào'}
                    </p>
                  )}
                  {isStudent &&
                    detail?.assignments &&
                    detail.assignments.length > 0 &&
                    detail.assignments.filter((a) => a.isPublished).length ===
                      0 && (
                      <p className="text-gray-500 text-center py-8">
                        Giáo viên chưa xuất bản bài tập nào
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isTeacher ? 'Quản lý bài tập' : 'Danh sách bài tập'}
                </h3>
                {isTeacher && (
                  <button
                    onClick={() => setShowCreateAssignment(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo bài tập
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {isTeacher
                  ? // Teacher view - Assignment management
                    detail?.assignments?.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        detail={detail}
                        onViewSubmissions={(aid) =>
                          navigate(
                            `/classroom-detail/${detail.id}/assignments/${aid}/submissions`
                          )
                        }
                        onDownloadPdf={handleDownloadPdf}
                        onTogglePublish={async (a) => {
                          try {
                            await setAssignmentPublish(
                              detail.id,
                              a.id,
                              !a.isPublished
                            )
                            toast.success(
                              a.isPublished
                                ? 'Đã chuyển sang Nháp'
                                : 'Đã xuất bản'
                            )
                            await queryClient.invalidateQueries({
                              queryKey: ['classroom-detail', detail.id],
                            })
                          } catch (e: any) {
                            toast.error(
                              e?.response?.data?.message ||
                                'Cập nhật trạng thái thất bại'
                            )
                          }
                        }}
                        onEdit={(a) => {
                          const initial = {
                            title: a.title,
                            description: a.description || '',
                            instructions: a.instructions || '',
                            dueDate: a.dueDate
                              ? new Date(a.dueDate).toISOString().slice(0, 16)
                              : '',
                            isPublished: a.isPublished,
                            totalPoints: a.totalPoints || 100,
                            timeLimit: a.timeLimit || undefined,
                            maxAttempts: a.maxAttempts || 1,
                            activities: (a.activities || []).map((ac: any) => ({
                              type: ac.type,
                              title: ac.title,
                              instructions: ac.instructions || '',
                              points: ac.points || 0,
                              timeLimit: ac.timeLimit || undefined,
                              maxAttempts: ac.maxAttempts || undefined,
                              passingScore: ac.passingScore || undefined,
                              difficulty: ac.difficulty || undefined,
                              hints: ac.hints || [],
                              content: ac.content,
                            })),
                          }
                          setEditInitial(initial)
                          setEditAssignmentId(a.id)
                          setShowEditAssignment(true)
                        }}
                        onDelete={async (a) => {
                          if (
                            !confirm(
                              'Xoá bài tập này? Hành động không thể hoàn tác.'
                            )
                          )
                            return
                          try {
                            await deleteAssignment(detail.id, a.id)
                            toast.success('Đã xoá bài tập')
                            await queryClient.invalidateQueries({
                              queryKey: ['classroom-detail', detail.id],
                            })
                          } catch (e: any) {
                            toast.error(
                              e?.response?.data?.message || 'Xoá thất bại'
                            )
                          }
                        }}
                      />
                    ))
                  : // Student view - Assignment doing
                    detail?.assignments
                      ?.filter((assignment) => assignment.isPublished) // Only show published assignments to students
                      ?.map((assignment) => (
                        <StudentAssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          submission={assignment.submission ?? null}
                          onDownloadPdf={handleDownloadPdf}
                          onStartAssignment={(aid) => {
                            // Navigate to assignment taking page
                            navigate(
                              `/classroom/${detail.id}/assignment/${aid}`
                            )
                          }}
                          onViewResult={(aid) => {
                            // Navigate to assignment result page
                            navigate(
                              `/classroom/${detail.id}/assignment/${aid}/result`
                            )
                          }}
                        />
                      ))}
                {detail?.assignments?.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {isTeacher ? 'Chưa có bài tập' : 'Chưa có bài tập'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {isTeacher
                        ? 'Tạo bài tập đầu tiên cho lớp học này'
                        : 'Giáo viên chưa tạo bài tập nào'}
                    </p>
                  </div>
                )}
                {/* Special case for students: No published assignments */}
                {isStudent &&
                  detail?.assignments &&
                  detail.assignments.length > 0 &&
                  detail.assignments.filter((a) => a.isPublished).length ===
                    0 && (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Chưa có bài tập được xuất bản
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Giáo viên đã tạo bài tập nhưng chưa xuất bản cho học
                        sinh
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thông báo</h3>
                {isTeacher && (
                  <div className="flex items-center gap-2">
                    {!showAnnForm && (
                      <button
                        onClick={() => setShowAnnForm(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
                      >
                        <Plus className="h-4 w-4" />
                        Tạo thông báo
                      </button>
                    )}
                  </div>
                )}
              </div>
              {isTeacher && showAnnForm && (
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm text-gray-700">Tiêu đề</label>
                      <input
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Nhập tiêu đề thông báo"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Nội dung</label>
                      <textarea
                        value={annBody}
                        onChange={(e) => setAnnBody(e.target.value)}
                        placeholder="Nhập nội dung (tuỳ chọn)"
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleCreateAnnouncement}
                      disabled={annLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {annLoading ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Gửi thông báo
                    </button>
                    <button
                      onClick={() => {
                        setShowAnnForm(false)
                        setAnnTitle('')
                        setAnnBody('')
                      }}
                      disabled={annLoading}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {isLoadingAnnouncements ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    Đang tải thông báo...
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Chưa có thông báo
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {isTeacher
                        ? 'Tạo thông báo đầu tiên cho lớp học này'
                        : 'Chưa có thông báo nào từ giáo viên'}
                    </p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                    />
                  ))
                )}
              </div>

              {(hasPrevAnnouncement || hasNextAnnouncement) && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      setAnnouncementPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={!hasPrevAnnouncement}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <span className="text-xs text-gray-500">
                    Trang {announcementsPage?.page ?? announcementPage} /{' '}
                    {announcementsPage?.totalPages ?? 1}
                  </span>
                  <button
                    onClick={() => setAnnouncementPage((prev) => prev + 1)}
                    disabled={!hasNextAnnouncement}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang tiếp
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Danh sách học sinh ({filteredStudents.length})
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm học sinh..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {user?.role === 'teacher' && (
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition">
                      <Plus className="h-4 w-4" />
                      Thêm học sinh
                    </button>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={{
                        ...student,
                        displayName:
                          student.displayName ??
                          `${student.firstName} ${student.lastName}`,
                        avatarUrl: student.avatarUrl ?? '',
                        studentRecord: {
                          ...student.studentRecord,
                          notes:
                            student.studentRecord.notes === null
                              ? undefined
                              : student.studentRecord.notes,
                        },
                      }}
                      onViewInfo={(id) => setOpenStudentId(id)}
                      onSendMessage={handleSendMessageToStudent}
                      currentUserId={user?.id}
                    />
                  ))}
                  {filteredStudents.length === 0 && searchStudent && (
                    <p className="text-center py-8 text-gray-500">
                      Không tìm thấy học sinh phù hợp
                    </p>
                  )}
                  {detail?.students?.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Chưa có học sinh
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Chia sẻ mã lớp để học sinh tham gia
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Teacher Info */}
          <div
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 cursor-pointer hover:bg-gray-50"
            onClick={() => setOpenTeacherId(detail?.teacher?.id || null)}
          >
            <h3 className="text-base font-semibold mb-4">Giáo viên</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={detail?.teacher?.avatarUrl ?? undefined}
                  alt={
                    detail?.teacher?.displayName ??
                    `${detail?.teacher?.firstName ?? ''} ${detail?.teacher?.lastName ?? ''}`
                  }
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {detail?.teacher?.displayName}
                </p>
                <p className="text-sm text-gray-500">
                  {detail?.teacher?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="text-base font-semibold mb-4">Thao tác nhanh</h3>
            <div className="space-y-2">
              <button
                onClick={handleSendMessageToTeacher}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition"
              >
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Nhắn tin cho giáo viên</span>
              </button>
              <button
                onClick={() => setOpenTeacherId(detail?.teacher?.id || null)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition"
              >
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Xem thông tin giáo viên</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Xem lịch học</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Cài đặt thông báo</span>
              </button>
            </div>
          </div>

          {/* Class Stats */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="text-base font-semibold mb-4">Thống kê lớp học</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ngày tạo</span>
                <span className="font-medium">
                  {detail?.createdAt &&
                    new Date(detail.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tỷ lệ hoàn thành bài tập</span>
                <span className="font-medium text-green-600">
                  {completionRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Điểm trung bình lớp</span>
                <span className="font-medium text-blue-600">
                  {averageScore}/100
                </span>
              </div>
              {detail?.expiresAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hết hạn mã lớp</span>
                  <span className="font-medium text-orange-600">
                    {new Date(detail.expiresAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Class Settings Preview */}
          {user?.role === 'teacher' && detail?.settings && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-base font-semibold mb-4">Cài đặt lớp học</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cho phép thảo luận</span>
                  <span
                    className={
                      detail.settings.allowDiscussion
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {detail.settings.allowDiscussion ? 'Có' : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tự động chấm điểm</span>
                  <span
                    className={
                      detail.settings.autoGrade
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {detail.settings.autoGrade ? 'Có' : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giờ hạn mặc định</span>
                  <span className="font-medium">
                    {detail.settings.dueTimeDefault}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition">
                <Settings className="h-4 w-4" />
                Chỉnh sửa cài đặt
              </button>
            </div>
          )}
        </div>
      </div>
      {openStudentId && (
        <UserDetailModal
          open={!!openStudentId}
          onClose={() => setOpenStudentId(null)}
          user={studentDetail}
          loading={loadingStudentDetail}
          title="Thông tin học sinh"
        />
      )}
      {openTeacherId && (
        <UserDetailModal
          open={!!openTeacherId}
          onClose={() => setOpenTeacherId(null)}
          user={teacherDetail}
          loading={loadingTeacherDetail}
          title="Thông tin giáo viên"
        />
      )}
      {detail?.id && (
        <CreateAssignmentModal
          isOpen={showCreateAssignment}
          classroomId={detail.id}
          onClose={() => setShowCreateAssignment(false)}
        />
      )}
      {detail?.id && (
        <CreateAssignmentModal
          key={`edit-${editAssignmentId}-${showEditAssignment}`}
          isOpen={showEditAssignment}
          classroomId={detail.id}
          mode="edit"
          assignmentId={editAssignmentId}
          initialValues={editInitial}
          onSubmitted={() => refetchClassroomDetail?.()}
          onClose={() => setShowEditAssignment(false)}
        />
      )}

      {/* Conversation Widget có sẵn */}
      <div className="fixed bottom-4 right-4 z-50">
        <ConversationWidget />
      </div>
    </div>
  )
}
