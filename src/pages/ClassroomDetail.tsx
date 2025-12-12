import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion' // <-- NEW
import {
  AlertCircle,
  ArrowLeft,
  Award, // NEW
  Bell,
  BookMarked, // NEW
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  ClipboardPenLine, // NEW
  Clock,
  Copy,
  Download,
  Eye,
  FileQuestion, // NEW
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
import { useEffect, useMemo, useRef, useState, type JSX } from 'react' // useMemo
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import certificateApi from '../apis/certificate.api'
import {
  AttendanceStatusWidget,
  MyAttendanceSection,
  TeacherAttendanceSection,
} from '../components/attendance'
import CreateAssignmentModal from '../components/classroom/CreateAssignmentModal'
import ConversationWidget from '../components/conversation/ConversationWidget'
import UserDetailModal from '../components/user/UserDetailModel'
import { useAuth } from '../context/AuthContext'
import { useConversation } from '../context/useConversation'
import {
  useBlockingStatus,
  useMyAttendanceHistory,
} from '../hooks/useAttendance'
import { useClassroomAnnouncements } from '../hooks/useClassroomAnnouncements'
import { useClassroomDetail } from '../hooks/useClassroomDetail'
import { useNextLesson } from '../hooks/useNextLesson'
import { useClassroomSessions } from '../hooks/useTeacherAttendance'
import { useStudentDetail, useTeacherDetail } from '../hooks/useUserDetail'
import {
  deleteAssignment,
  downloadAssignmentPdf,
  downloadPdfFromBlob,
  setAssignmentPublish,
} from '../services/assignment.api'
import { createClassroomAnnouncement } from '../services/classroom-detail.api'
import { createClassroomConversation } from '../services/conversation.api'
import { AssignmentType, type Assignment } from '../types/assignment.type' // NEW
import type { GetMyCertificatesResponse } from '../types/certificate.type'
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
  // Note: individual activity completion status is not provided by API
  // Progress is tracked at lesson level
}

interface LessonUI {
  id: string
  title: string
  orderNo: number
  estimatedTime?: number
  difficulty?: 'beginner' | 'elementary' | 'intermediate'
  isLocked?: boolean
  activities: ActivityUI[]
  progress?: {
    totalActivities: number
    completedActivities: number
    completion: number
  }
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
    aiScore?: number | null
    aiFeedback?: string | null
    gradedById?: string | null
    status: 'submitted' | 'graded' | 'late' | 'missing'
    attempt: number
    submittedAt: string | null
  } | null
  onStartAssignment?: (id: string) => void
  onViewResult?: (id: string) => void
}

function StudentAssignmentCard({
  assignment,
  submission,
  onStartAssignment,
  onViewResult,
}: StudentAssignmentCardProps): JSX.Element {
  const startTime = assignment.startTime ? new Date(assignment.startTime) : null
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const now = new Date()
  const isOverdue = !!dueDate && dueDate < now
  const isNotStarted = !!startTime && startTime > now

  // Use real submission data instead of mock data
  const hasSubmitted = !!submission
  const hasAIScore =
    submission?.aiScore !== null && submission?.aiScore !== undefined
  const hasTeacherScore = !!submission?.gradedById
  const finalScore = hasTeacherScore
    ? submission?.score
    : submission?.aiScore || submission?.score || null
  const score = finalScore
  const attempts = submission?.attempt || 0 // này là attemptCount từ backend

  const assignmentTypeMap: Record<
    AssignmentType,
    {
      label: string
      icon: LucideIcon
      iconColor: string
      badgeColor: string
    }
  > = {
    [AssignmentType.HOMEWORK]: {
      label: 'Bài tập về nhà',
      icon: BookMarked,
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    [AssignmentType.QUIZ]: {
      label: 'Bài kiểm tra',
      icon: FileQuestion,
      iconColor: 'text-indigo-600',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    [AssignmentType.MIDTERM_EXAM]: {
      label: 'Thi giữa kỳ',
      icon: ClipboardPenLine,
      iconColor: 'text-amber-600',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    [AssignmentType.FINAL_EXAM]: {
      label: 'Thi cuối kỳ',
      icon: Award,
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-800',
    },
  }

  const typeInfo =
    assignmentTypeMap[assignment.type] || assignmentTypeMap.HOMEWORK
  const IconComponent = typeInfo.icon

  const getStatusColor = () => {
    if (hasSubmitted && score !== null) {
      if (score >= 80) return 'bg-green-100 text-green-700'
      if (score >= 60) return 'bg-yellow-100 text-yellow-700'
      return 'bg-red-100 text-red-700'
    }
    if (isOverdue) return 'bg-red-100 text-red-700'
    if (isNotStarted) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getStatusText = () => {
    if (hasSubmitted && score !== null) {
      return `Đã nộp - ${score} điểm`
    }
    if (isOverdue) return 'Quá hạn'
    if (isNotStarted) return 'Chưa đến giờ'
    return 'Chưa làm'
  }

  const isImportant =
    assignment.type === AssignmentType.MIDTERM_EXAM ||
    assignment.type === AssignmentType.FINAL_EXAM

  return (
    <div
      className={`rounded-xl border bg-white p-4 hover:shadow-sm transition ${isImportant ? 'border-2 border-amber-400' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <IconComponent
              className={`h-6 w-6 mt-1 flex-shrink-0 ${typeInfo.iconColor}`}
            />
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h4 className="font-medium text-gray-900">
                  {assignment.title}
                </h4>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.badgeColor}`}
                >
                  {typeInfo.label}
                </div>
              </div>
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
          </div>

          {assignment.description && (
            <p className="text-sm text-gray-600 mb-2 pl-9">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 pl-9">
            {startTime && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Bắt đầu: {startTime.toLocaleDateString('vi-VN')} lúc{' '}
                {startTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
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
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-2 ml-9">
              <strong>Hướng dẫn:</strong> {assignment.instructions}
            </p>
          )}

          {hasSubmitted && score !== null && (
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded ml-9 space-y-1">
              <div>
                <strong>Kết quả:</strong> Lần {attempts}/
                {assignment.maxAttempts}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {hasAIScore && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    <Award className="h-3 w-3" />
                    AI: {submission.aiScore}/100
                  </span>
                )}
                {hasTeacherScore && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded font-semibold">
                    <Award className="h-3 w-3" />
                    Giáo viên: {submission.score}/100 (Cuối)
                  </span>
                )}
                {!hasTeacherScore && hasAIScore && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    Điểm cuối: {submission.aiScore}/100
                  </span>
                )}
                {!hasAIScore && !hasTeacherScore && (
                  <span>Điểm: {score}/100</span>
                )}
                <span>
                  -{' '}
                  {score >= 80
                    ? 'Xuất sắc'
                    : score >= 60
                      ? 'Khá'
                      : 'Cần cải thiện'}
                </span>
              </div>
            </div>
          )}

          {isNotStarted && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded ml-9 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <strong>Chưa đến giờ bắt đầu:</strong>{' '}
              {startTime?.toLocaleDateString('vi-VN')} lúc{' '}
              {startTime?.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}

          {isOverdue && !hasSubmitted && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded ml-9 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              <strong>Đã quá hạn nộp bài:</strong> Không thể bắt đầu làm bài nữa
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
            {hasSubmitted ? (
              <>
                <button
                  onClick={() => onViewResult?.(assignment.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  Xem kết quả
                </button>

                {attempts < assignment.maxAttempts &&
                  !isOverdue &&
                  !isNotStarted && (
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
                disabled={isNotStarted || isOverdue}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  isNotStarted || isOverdue
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Play className="h-4 w-4" />
                {isNotStarted
                  ? 'Chưa đến giờ'
                  : isOverdue
                    ? 'Đã quá hạn'
                    : 'Bắt đầu làm'}
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
  const startTime = assignment.startTime ? new Date(assignment.startTime) : null
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isOverdue = !!dueDate && dueDate < new Date()
  const completionRate =
    (assignment._count.submissions / detail._count.students) * 100

  // Assignment type mapping for teacher view
  const assignmentTypeMap: Record<
    AssignmentType,
    {
      label: string
      icon: LucideIcon
      iconColor: string
      badgeColor: string
    }
  > = {
    [AssignmentType.HOMEWORK]: {
      label: 'Bài tập về nhà',
      icon: BookMarked,
      iconColor: 'text-blue-600',
      badgeColor: 'text-blue-800',
    },
    [AssignmentType.QUIZ]: {
      label: 'Bài kiểm tra',
      icon: FileQuestion,
      iconColor: 'text-indigo-600',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    [AssignmentType.MIDTERM_EXAM]: {
      label: 'Thi giữa kỳ',
      icon: ClipboardPenLine,
      iconColor: 'text-amber-600',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    [AssignmentType.FINAL_EXAM]: {
      label: 'Thi cuối kỳ',
      icon: Award,
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-800',
    },
  }

  const typeInfo =
    assignmentTypeMap[assignment.type] || assignmentTypeMap.HOMEWORK
  const IconComponent = typeInfo.icon

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.badgeColor}`}
            >
              <IconComponent className={`h-3 w-3 ${typeInfo.iconColor}`} />
              {typeInfo.label}
            </div>
          </div>
          {assignment.description && (
            <p className="text-sm text-gray-600 mb-2">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            {startTime && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Bắt đầu: {startTime.toLocaleDateString('vi-VN')} lúc{' '}
                {startTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {dueDate ? (
                <>
                  Hạn: {dueDate.toLocaleDateString('vi-VN')} lúc{' '}
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
            {assignment.weight && assignment.weight > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {assignment.weight}% trọng số
              </div>
            )}
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
 * NEW: Game Map Journey - Lessons as Big Nodes, Activities as Path Steps
 * ========================= */

// Type for journey elements
type JourneyLesson = {
  id: string
  title: string
  orderNo: number
  isCompleted: boolean
  isLocked: boolean
  isCurrent: boolean // User is currently in this lesson
  activities: JourneyActivity[]
}

type JourneyActivity = {
  id: string
  title: string
  type: ActivityType
  lessonId: string
  orderNo: number // Global order across all lessons
  isCompleted: boolean
  isLocked: boolean
  isCurrent: boolean // User's current position (avatar here)
}

// Build journey structure from lessons
function buildJourneyStructure(lessons: LessonUI[]): {
  journeyLessons: JourneyLesson[]
  totalActivities: number
  completedActivities: number
  currentActivityIndex: number
} {
  const journeyLessons: JourneyLesson[] = []
  let globalActivityIndex = 0
  let totalCompleted = 0
  let currentActivityIndex = -1

  lessons.forEach((lesson, lessonIndex) => {
    const lessonCompleted = (lesson.progress?.completion ?? 0) === 100
    const lessonStarted = (lesson.progress?.completedActivities ?? 0) > 0
    const completedInLesson = lesson.progress?.completedActivities ?? 0

    const activities: JourneyActivity[] = lesson.activities.map(
      (activity, actIndex) => {
        const isCompleted = actIndex < completedInLesson
        const isCurrent =
          !isCompleted &&
          lessonStarted &&
          actIndex === completedInLesson &&
          !lesson.isLocked

        if (isCurrent) {
          currentActivityIndex = globalActivityIndex
        }

        const journeyActivity: JourneyActivity = {
          id: activity.id,
          title: activity.title,
          type: activity.type,
          lessonId: lesson.id,
          orderNo: globalActivityIndex + 1,
          isCompleted,
          isLocked: lesson.isLocked ?? false,
          isCurrent,
        }

        globalActivityIndex++
        if (isCompleted) totalCompleted++

        return journeyActivity
      }
    )

    journeyLessons.push({
      id: lesson.id,
      title: lesson.title,
      orderNo: lessonIndex + 1,
      isCompleted: lessonCompleted,
      isLocked: lesson.isLocked ?? false,
      isCurrent: lessonStarted && !lessonCompleted,
      activities,
    })
  })

  return {
    journeyLessons,
    totalActivities: globalActivityIndex,
    completedActivities: totalCompleted,
    currentActivityIndex,
  }
}

// Game Map Journey Component
type GameMapJourneyProps = {
  lessons: LessonUI[]
  userAvatarUrl?: string
  onStartActivity: (lessonId: string, activityId: string) => void
  classroomStatus?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

function GameMapJourney({
  lessons,
  userAvatarUrl,
  onStartActivity,
  // classroomStatus,
}: GameMapJourneyProps): JSX.Element {
  // Build journey structure
  const { journeyLessons, totalActivities, completedActivities } =
    buildJourneyStructure(lessons)

  const progressPercent =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0

  // State to track which lessons are expanded
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId)
      } else {
        newSet.add(lessonId)
      }
      return newSet
    })
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 shadow-lg overflow-visible">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hành trình học tập
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {completedActivities}/{totalActivities} hoạt động •{' '}
            {journeyLessons.length} bài học
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {progressPercent}%
          </div>
          <p className="text-xs text-gray-500">Hoàn thành</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-3 bg-white rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Journey Map */}
      <div className="relative space-y-8 overflow-visible">
        {journeyLessons.map((lesson, lessonIndex) => {
          const isExpanded = expandedLessons.has(lesson.id)

          return (
            <div key={lesson.id} className="relative">
              {/* Lesson Node (Big Circle) */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ scale: lesson.isLocked ? 1 : 1.05 }}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      lesson.isLocked
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed'
                        : lesson.isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-2xl shadow-green-200'
                          : lesson.isCurrent
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl shadow-blue-200'
                            : 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-xl shadow-purple-200'
                    }`}
                    title={lesson.title}
                  >
                    {/* Progress ring */}
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 96 96"
                    >
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeDasharray={`${((lesson.isCompleted ? 100 : (lesson.activities.filter((a) => a.isCompleted).length / lesson.activities.length) * 100) * 264) / 100} 264`}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Lesson content */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-white">
                      {lesson.isCompleted ? (
                        <Trophy className="w-10 h-10 mb-1" strokeWidth={2.5} />
                      ) : lesson.isLocked ? (
                        <XCircle className="w-10 h-10 mb-1" strokeWidth={2.5} />
                      ) : (
                        <div className="text-3xl font-bold">
                          {lesson.orderNo}
                        </div>
                      )}
                    </div>

                    {/* Pulse effect for current lesson */}
                    {lesson.isCurrent && !lesson.isCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-400"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}

                    {/* Expand/Collapse indicator */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600 rotate-90" />
                    </motion.div>
                  </motion.div>
                </button>
              </div>

              {/* Lesson Title */}
              <div className="text-center mt-10">
                <h3 className="text-lg font-bold text-gray-900">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {lesson.activities.filter((a) => a.isCompleted).length}/
                  {lesson.activities.length} hoạt động
                  {lesson.isCompleted && ' • Hoàn thành'}
                  {lesson.isLocked && ' • Đã khóa'}
                </p>
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                </button>
              </div>

              {/* Activities List - Show for ALL lessons when expanded */}
              <motion.div
                initial={false}
                animate={{
                  height:
                    isExpanded && lesson.activities.length > 0 ? 'auto' : 0,
                  opacity: isExpanded && lesson.activities.length > 0 ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                {lesson.activities.length > 0 && (
                  <div className="mt-10 mb-10">
                    {/* Vertical path of activities */}
                    <div className="flex flex-col items-center gap-0 relative">
                      {/* Decorative dashed line background */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-1 border-l-2 border-dashed border-gray-300 -translate-x-1/2 opacity-30" />

                      {lesson.activities.map((activity, actIndex) => {
                        const Icon = activityIcon[activity.type] || BookOpen
                        const colorClass =
                          activityColor[activity.type] || 'text-gray-600'

                        return (
                          <div
                            key={activity.id}
                            className="relative group flex items-center w-full justify-center py-3"
                          >
                            {/* Connection line to next activity (VERTICAL) */}
                            {actIndex < lesson.activities.length - 1 && (
                              <div
                                className={`absolute top-full left-1/2 w-1 h-12 ${
                                  activity.isCompleted
                                    ? 'bg-gradient-to-b from-green-400 to-green-300'
                                    : 'bg-gradient-to-b from-gray-300 to-gray-200'
                                } -translate-x-1/2 z-0 rounded-full`}
                              />
                            )}

                            {/* Activity Step Node */}
                            <motion.button
                              whileHover={{
                                scale: activity.isLocked ? 1 : 1.2,
                              }}
                              whileTap={{
                                scale: activity.isLocked ? 1 : 0.95,
                              }}
                              onClick={() => {
                                if (!activity.isLocked) {
                                  onStartActivity(
                                    activity.lessonId,
                                    activity.id
                                  )
                                }
                              }}
                              disabled={activity.isLocked}
                              className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                                activity.isLocked
                                  ? 'bg-gray-200 cursor-not-allowed border-2 border-gray-300'
                                  : activity.isCompleted
                                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200 border-2 border-green-300'
                                    : activity.isCurrent
                                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-300 ring-4 ring-blue-200 animate-pulse-slow'
                                      : 'bg-white border-3 border-gray-400 shadow-md hover:shadow-lg hover:border-blue-400'
                              }`}
                              title={activity.title}
                            >
                              {/* Inner glow effect */}
                              {!activity.isLocked && !activity.isCompleted && (
                                <div className="absolute inset-1 rounded-full bg-white opacity-20" />
                              )}

                              {activity.isCompleted ? (
                                <CheckCircle className="w-7 h-7 text-white drop-shadow-md" />
                              ) : (
                                <Icon
                                  className={`w-6 h-6 ${
                                    activity.isCurrent
                                      ? 'text-white drop-shadow-md'
                                      : colorClass
                                  }`}
                                />
                              )}

                              {/* Sparkle effect for completed */}
                              {activity.isCompleted && (
                                <>
                                  <motion.div
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
                                    animate={{
                                      scale: [0, 1, 0],
                                      opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: 0,
                                    }}
                                  />
                                  <motion.div
                                    className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full"
                                    animate={{
                                      scale: [0, 1, 0],
                                      opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: 0.5,
                                    }}
                                  />
                                </>
                              )}

                              {/* Avatar - show on current activity */}
                              {activity.isCurrent && userAvatarUrl && (
                                <motion.div
                                  initial={{ scale: 0, x: -40, opacity: 0 }}
                                  animate={{ scale: 1, x: 0, opacity: 1 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.2,
                                  }}
                                  className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2"
                                >
                                  <div className="relative flex items-center gap-4">
                                    {/* Animated arrow pointing left to activity */}
                                    <motion.div
                                      animate={{ x: [-6, 0, -6] }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                      }}
                                      className="flex flex-col items-center gap-1"
                                    >
                                      <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-t-transparent border-b-transparent border-r-blue-500 drop-shadow-md" />
                                    </motion.div>

                                    <div className="relative">
                                      <img
                                        src={userAvatarUrl}
                                        alt="Vị trí hiện tại"
                                        className="w-16 h-16 rounded-full border-4 border-white shadow-2xl ring-2 ring-blue-400"
                                      />
                                      {/* Multiple pulse rings */}
                                      <motion.div
                                        className="absolute inset-0 rounded-full bg-blue-400"
                                        animate={{
                                          scale: [1, 1.5, 1],
                                          opacity: [0.6, 0, 0.6],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                        }}
                                      />
                                      <motion.div
                                        className="absolute inset-0 rounded-full bg-blue-300"
                                        animate={{
                                          scale: [1, 1.8, 1],
                                          opacity: [0.4, 0, 0.4],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: 'easeInOut',
                                          delay: 0.5,
                                        }}
                                      />

                                      {/* "You are here" badge */}
                                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                                        Bạn đang ở đây
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Activity number badge with better styling */}
                              <div className="absolute left-full ml-3 flex items-center gap-2">
                                <div
                                  className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                    activity.isCompleted
                                      ? 'bg-green-100 text-green-700'
                                      : activity.isCurrent
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  #{activity.orderNo}
                                </div>
                              </div>
                            </motion.button>

                            {/* Enhanced tooltip on hover - positioned above activity */}
                            <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 group-hover:-translate-y-1">
                              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 whitespace-nowrap">
                                <div className="font-semibold">
                                  {activity.title}
                                </div>
                                <div className="text-[10px] text-gray-300 mt-1">
                                  {activity.isCompleted
                                    ? '✓ Đã hoàn thành'
                                    : activity.isCurrent
                                      ? '▶ Đang học'
                                      : 'Chưa bắt đầu'}
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900" />
                              </div>
                            </div>

                            {/* Progress indicator line on the left side */}
                            <div
                              className={`absolute right-full mr-3 w-8 h-0.5 rounded-full ${
                                activity.isCompleted
                                  ? 'bg-green-400'
                                  : activity.isCurrent
                                    ? 'bg-blue-400'
                                    : 'bg-gray-300'
                              }`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Enhanced arrow pointing to next lesson - Only show if not last lesson */}
              {lessonIndex < journeyLessons.length - 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-1 h-16 bg-gradient-to-b from-gray-400 via-gray-300 to-transparent rounded-full" />
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-400" />
                    </motion.div>
                    <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Bài tiếp theo
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * =========================
 * Main component (typed)
 * =========================
 */

type TabKey =
  | 'overview'
  | 'assignments'
  | 'announcements'
  | 'students'
  | 'attendance'

// Đã loại bỏ interface ClassroomDetailProps vì không còn dùng

// Helper function to group assignments by type
function groupAssignmentsByType(assignments: any[]) {
  const groups: Record<AssignmentType, any[]> = {
    [AssignmentType.HOMEWORK]: [],
    [AssignmentType.QUIZ]: [],
    [AssignmentType.MIDTERM_EXAM]: [],
    [AssignmentType.FINAL_EXAM]: [],
  }

  assignments?.forEach((assignment) => {
    const type = (assignment.type as AssignmentType) || AssignmentType.HOMEWORK
    if (groups[type]) {
      groups[type].push(assignment)
    }
  })

  return groups
}

// Helper function to get section title and icon for assignment type
function getAssignmentSectionInfo(type: AssignmentType) {
  const sectionMap = {
    [AssignmentType.HOMEWORK]: {
      title: 'Bài tập về nhà',
      icon: BookMarked,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    [AssignmentType.QUIZ]: {
      title: 'Bài kiểm tra',
      icon: FileQuestion,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    [AssignmentType.MIDTERM_EXAM]: {
      title: 'Thi giữa kỳ',
      icon: ClipboardPenLine,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    [AssignmentType.FINAL_EXAM]: {
      title: 'Thi cuối kỳ',
      icon: Award,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  }

  return sectionMap[type] || sectionMap[AssignmentType.HOMEWORK]
}

export default function ClassroomDetail(props: {
  onBack: () => void
  classroomId?: string
}): JSX.Element {
  const { onBack } = props
  const { user } = useAuth()
  const { openWidget } = useConversation()
  // const classroomIdFromUrl =
  //   typeof window !== 'undefined'
  //     ? window.location.pathname.split('/').pop() || undefined
  //     : undefined

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [searchStudent, setSearchStudent] = useState<string>('')

  // Handle URL hash for tab navigation (e.g., #attendance)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'attendance') {
      setActiveTab('attendance')
    }
  }, [])
  // const [openLessonId, setOpenLessonId] = useState<string | null>(null)
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

  // Get certificates for this course
  const { data: certificatesData } = useQuery<GetMyCertificatesResponse>({
    queryKey: ['my-certificates'],
    queryFn: () => certificateApi.getMyCertificates({ skip: 0, take: 100 }),
    enabled: !!user?.id,
  })

  // Find certificate for this course
  const courseCertificate = useMemo(() => {
    if (!certificatesData?.data || !classroomDetail?.course?.id) return null
    // certificatesData is GetMyCertificatesResponse = { data: IssuedCertificate[], total: number }
    // certificatesData.data is the array of certificates
    return certificatesData.data.find(
      (cert: any) => cert.courseId === classroomDetail.course?.id
    )
  }, [certificatesData, classroomDetail?.course?.id])

  // Check if course is completed (has certificate)
  const isCourseCompleted = !!courseCertificate

  // Filter assignments based on role: Teacher sees all, Student sees only published
  const filteredAssignments = useMemo(() => {
    if (!classroomDetail?.assignments) return []
    // Teacher: show all assignments (including drafts)
    // Student: only show published assignments
    if (user?.role === 'teacher') {
      return classroomDetail.assignments
    }
    return classroomDetail.assignments.filter((a) => a.isPublished)
  }, [classroomDetail?.assignments, user?.role])

  const sortedStudentAssignments = useMemo(() => {
    if (filteredAssignments.length === 0) return []

    const assignmentPriority = {
      [AssignmentType.FINAL_EXAM]: 4,
      [AssignmentType.MIDTERM_EXAM]: 3,
      [AssignmentType.QUIZ]: 2,
      [AssignmentType.HOMEWORK]: 1,
    }

    return [...filteredAssignments].sort((a, b) => {
      const aHasSubmission = !!a.submission
      const bHasSubmission = !!b.submission

      // If one has been submitted and the other not, the unsubmitted one comes first
      if (aHasSubmission !== bHasSubmission) {
        return aHasSubmission ? 1 : -1
      }

      // If both are unsubmitted, sort by type priority
      if (!aHasSubmission && !bHasSubmission) {
        const priorityA = assignmentPriority[a.type] || 0
        const priorityB = assignmentPriority[b.type] || 0
        if (priorityA !== priorityB) {
          return priorityB - priorityA
        }
      }

      // Otherwise, sort by due date (sooner first)
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return dateA - dateB
    })
  }, [filteredAssignments])

  // Lấy dữ liệu lesson tiếp theo từ API /next
  const role = user?.role
  const isTeacher = role === 'teacher'
  const isStudent = role === 'student'

  // Get classroom sessions for teacher attendance
  const { data: classroomSessions = [] } = useClassroomSessions(
    classroomIdFromParams || null,
    isTeacher && !!classroomIdFromParams
  )

  const { data: nextLessonData } = useNextLesson(isStudent)

  // Get blocking status and attendance history for students
  const blockingStatusQuery = useBlockingStatus(
    classroomIdFromParams || '',
    user?.id || '',
    isStudent && !!classroomIdFromParams && !!user?.id
  )

  const attendanceHistoryQuery = useMyAttendanceHistory(
    classroomIdFromParams || '',
    undefined,
    isStudent && !!classroomIdFromParams
  )

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
    { id: 'attendance', label: 'Diem danh', icon: ClipboardList },
  ] as const

  // Điều hướng khi bắt đầu học bài
  // const handleStartLesson = (lessonId: string) => {
  //   if (!detail) return
  //   const lesson = detail.lessons?.find((l) => l.id === lessonId)
  //   const activityId = lesson?.activities?.[0]?.id
  //   if (classroomIdFromUrl && lessonId && activityId) {
  //     navigate(`/learn/${classroomIdFromUrl}/${lessonId}/${activityId}`)
  //   }
  // }

  // Điều hướng khi bắt đầu học activity
  const handleStartActivity = (lessonId: string, activityId: string) => {
    if (!detail) return
    if (lessonId && activityId) {
      // Thêm query param activityId để LearnPage biết activity nào cần hiển thị
      navigate(`/learn/${detail.id}/${lessonId}?activityId=${activityId}`)
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
    <div className="min-h-screen space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
              {detail?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <button
                className="underline underline-offset-2 hover:text-gray-900 truncate max-w-[150px] sm:max-w-none"
                onClick={() => setOpenTeacherId(detail?.teacher?.id || null)}
              >
                {detail?.teacher?.displayName}
              </button>
              <span>•</span>
              <span
                className={`text-xs sm:text-sm ${
                  detail?.isActive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {detail?.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
          {/* NEW: Global CTA "Tiếp tục học" */}
          {user?.role === 'student' && (
            <button
              onClick={handleContinueLearning}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white hover:bg-blue-700 transition flex-1 sm:flex-initial whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>
                {detail?.status === 'upcoming'
                  ? 'Xem trước buổi học'
                  : 'Tiếp tục học'}
              </span>
            </button>
          )}

          <button
            onClick={() => copyClassCode(detail?.classCode ?? '')}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gray-100 px-2 sm:px-3 py-2 text-xs sm:text-sm hover:bg-gray-200 transition flex-shrink-0 whitespace-nowrap"
          >
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{detail?.classCode}</span>
          </button>
          <button
            className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition flex-shrink-0 hidden sm:block"
            aria-label="Share class"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition flex-shrink-0"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-blue-50 p-3 sm:p-4 border border-blue-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-blue-700">Học sinh</p>
              <p className="text-lg sm:text-xl font-bold text-blue-900 truncate">
                {detail?._count?.students ?? 0}/{detail?.maxStudents ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-green-50 p-3 sm:p-4 border border-green-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-green-700">Bài tập</p>
              <p className="text-lg sm:text-xl font-bold text-green-900 truncate">
                {detail?._count?.assignments ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-orange-50 p-3 sm:p-4 border border-orange-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-orange-700">Thông báo</p>
              <p className="text-lg sm:text-xl font-bold text-orange-900 truncate">
                {announcementTotal}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-purple-50 p-3 sm:p-4 border border-purple-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-purple-700">
                Điểm trung bình
              </p>
              <p className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                {averageScore}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Banner */}
      {isCourseCompleted && courseCertificate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-green-900 flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">
                    Chúc mừng! Bạn đã hoàn thành khóa học
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-green-700 mt-1">
                  Bạn đã nhận được chứng chỉ cho khóa học "
                  {detail?.course?.title}"
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-green-600">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>Hoàn thành: </span>
                    {new Date(
                      courseCertificate.completionDate
                    ).toLocaleDateString('vi-VN')}
                  </span>
                  {courseCertificate.finalScore && (
                    <span>⭐ Điểm: {courseCertificate.finalScore}/100</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={() =>
                  navigate(`/certificates/${courseCertificate.id}`)
                }
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-700 transition"
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Xem chứng chỉ</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    const blob = await certificateApi.downloadCertificate(
                      courseCertificate.id
                    )
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `certificate-${courseCertificate.certificateNumber}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    toast.success('Đã tải xuống chứng chỉ thành công!')
                  } catch (error) {
                    console.error('Download error:', error)
                    toast.error('Không thể tải xuống chứng chỉ')
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                <Download className="h-4 w-4" />
                Tải PDF
              </button>
              <button
                onClick={() => navigate('/my-certificates')}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition"
              >
                <Trophy className="h-4 w-4" />
                Tất cả chứng chỉ
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl sm:rounded-2xl bg-gray-100 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* NEW: Game Map Journey */}
              <GameMapJourney
                lessons={(detail?.lessons || []).map((lesson, index) => {
                  // Check if in preview mode (upcoming classroom)
                  const isPreviewMode = detail?.status === 'upcoming'

                  // Check if previous lesson is completed (100%)
                  const prevLesson =
                    index > 0 ? detail?.lessons[index - 1] : null
                  const isPrevLessonCompleted = prevLesson
                    ? ((prevLesson as any).progress?.completion ?? 0) === 100
                    : true // First lesson is always unlocked

                  // Override isLocked based on previous lesson completion
                  // In preview mode, unlock all lessons
                  const isLessonLocked = isPreviewMode
                    ? false
                    : lesson.isLocked || !isPrevLessonCompleted

                  return {
                    ...lesson,
                    difficulty: lesson.difficulty as
                      | 'beginner'
                      | 'elementary'
                      | 'intermediate'
                      | undefined,
                    isLocked: isLessonLocked,
                    activities: lesson.activities.map((a) => ({
                      ...a,
                      type: a.type as ActivityType,
                      duration: a.duration === null ? undefined : a.duration,
                      passingScore:
                        a.passingScore === null ? undefined : a.passingScore,
                    })),
                  }
                })}
                userAvatarUrl={user?.avatarUrl}
                onStartActivity={handleStartActivity}
                classroomStatus={detail?.status}
              />

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

              {/* Certificate Link - Only show if course is completed */}
              {isCourseCompleted && courseCertificate && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Chứng chỉ khóa học
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Đã hoàn thành</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Chứng chỉ hoàn thành khóa học
                      </h4>
                      <p className="text-sm text-gray-600">
                        {courseCertificate.courseName}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Mã chứng chỉ: {courseCertificate.certificateNumber}
                        </span>
                        <span>
                          Ngày cấp:{' '}
                          {new Date(
                            courseCertificate.issueDate
                          ).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/certificates/${courseCertificate.id}`)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const blob =
                              await certificateApi.downloadCertificate(
                                courseCertificate.id
                              )
                            const url = window.URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `certificate-${courseCertificate.certificateNumber}.pdf`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            window.URL.revokeObjectURL(url)
                            toast.success('Đã tải xuống chứng chỉ thành công!')
                          } catch (error) {
                            console.error('Download error:', error)
                            toast.error('Không thể tải xuống chứng chỉ')
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                      >
                        <Download className="h-4 w-4" />
                        Tải PDF
                      </button>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/verify-certificate?code=${courseCertificate.verificationCode}`
                          navigator.clipboard.writeText(url)
                          toast.success('Đã copy link xác thực chứng chỉ')
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-white border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition"
                      >
                        <Copy className="h-4 w-4" />
                        Copy link
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                      sortedStudentAssignments
                        ?.slice(0, 3)
                        .map((assignment) => (
                          <StudentAssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            submission={assignment.submission ?? null}
                            onStartAssignment={(aid) => {
                              navigate(
                                `/classroom/${detail?.id}/assignment/${aid}`
                              )
                            }}
                            onViewResult={(aid) => {
                              navigate(
                                `/classroom/${detail?.id}/assignment/${aid}/result`
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
              {(() => {
                // Use filteredAssignments (role-based: teacher sees all, student sees published only)
                const assignmentGroups =
                  groupAssignmentsByType(filteredAssignments)
                const assignmentTypes = [
                  AssignmentType.HOMEWORK,
                  AssignmentType.QUIZ,
                  AssignmentType.MIDTERM_EXAM,
                  AssignmentType.FINAL_EXAM,
                ]
                const hasAnyAssignments = assignmentTypes.some(
                  (type) => assignmentGroups[type].length > 0
                )

                if (!hasAnyAssignments) {
                  return (
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
                      {isTeacher && (
                        <button
                          onClick={() => setShowCreateAssignment(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
                        >
                          <Plus className="h-4 w-4" />
                          Tạo bài tập đầu tiên
                        </button>
                      )}
                    </div>
                  )
                }

                return (
                  <div className="space-y-6">
                    {assignmentTypes.map((type) => {
                      const assignments = assignmentGroups[type]
                      if (assignments.length === 0) return null

                      const sectionInfo = getAssignmentSectionInfo(type)
                      const IconComponent = sectionInfo.icon

                      return (
                        <div
                          key={type}
                          className="rounded-xl border border-gray-200 bg-white p-4"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <IconComponent
                              className={`h-6 w-6 ${sectionInfo.iconColor}`}
                            />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {sectionInfo.title}
                            </h4>
                            <span className="text-sm text-gray-500">
                              ({assignments.length} bài)
                            </span>
                          </div>

                          <div className="space-y-3">
                            {isTeacher
                              ? // Teacher view - Assignment management
                                assignments.map((assignment) => (
                                  <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    detail={detail!}
                                    onViewSubmissions={(aid) =>
                                      navigate(
                                        `/classroom-detail/${detail!.id}/assignments/${aid}/submissions`
                                      )
                                    }
                                    onDownloadPdf={handleDownloadPdf}
                                    onTogglePublish={async (a) => {
                                      try {
                                        await setAssignmentPublish(
                                          detail!.id,
                                          a.id,
                                          !a.isPublished
                                        )
                                        toast.success(
                                          a.isPublished
                                            ? 'Đã chuyển sang Nháp'
                                            : 'Đã xuất bản'
                                        )
                                        await queryClient.invalidateQueries({
                                          queryKey: [
                                            'classroom-detail',
                                            detail!.id,
                                          ],
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
                                          ? new Date(a.dueDate)
                                              .toISOString()
                                              .slice(0, 16)
                                          : '',
                                        isPublished: a.isPublished,
                                        totalPoints: a.totalPoints || 100,
                                        timeLimit: a.timeLimit || undefined,
                                        maxAttempts: a.maxAttempts || 1,
                                        type: a.type || AssignmentType.HOMEWORK,
                                        weight: a.weight || 0,
                                        activities: (a.activities || []).map(
                                          (ac: any) => ({
                                            type: ac.type,
                                            title: ac.title,
                                            instructions: ac.instructions || '',
                                            points: ac.points || 0,
                                            timeLimit:
                                              ac.timeLimit || undefined,
                                            maxAttempts:
                                              ac.maxAttempts || undefined,
                                            passingScore:
                                              ac.passingScore || undefined,
                                            difficulty:
                                              ac.difficulty || undefined,
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
                                        await deleteAssignment(detail!.id, a.id)
                                        toast.success('Đã xoá bài tập')
                                        await queryClient.invalidateQueries({
                                          queryKey: [
                                            'classroom-detail',
                                            detail!.id,
                                          ],
                                        })
                                      } catch (e: any) {
                                        toast.error(
                                          e?.response?.data?.message ||
                                            'Xoá thất bại'
                                        )
                                      }
                                    }}
                                  />
                                ))
                              : // Student view - assignments already filtered by role
                                assignments.map((assignment) => (
                                  <StudentAssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    submission={assignment.submission ?? null}
                                    onStartAssignment={(aid) => {
                                      navigate(
                                        `/classroom/${detail!.id}/assignment/${aid}`
                                      )
                                    }}
                                    onViewResult={(aid) => {
                                      navigate(
                                        `/classroom/${detail!.id}/assignment/${aid}/result`
                                      )
                                    }}
                                  />
                                ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
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

          {activeTab === 'attendance' && classroomIdFromParams && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              {isTeacher ? (
                <TeacherAttendanceSection
                  classroomId={classroomIdFromParams}
                  sessions={classroomSessions.map((s) => ({
                    id: s.id,
                    title: s.title,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    status: s.status,
                  }))}
                />
              ) : (
                <MyAttendanceSection classroomId={classroomIdFromParams} />
              )}
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

          {/* Attendance Status Widget - Student only */}
          {!isTeacher && (
            <AttendanceStatusWidget
              blockingStatus={blockingStatusQuery.data}
              attendanceRate={
                attendanceHistoryQuery.data?.data?.summary?.attendanceRate
              }
            />
          )}

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

          {/* View Certificate Button - Only show if course is completed */}
          {isCourseCompleted && courseCertificate && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-base font-semibold">Chứng chỉ khóa học</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Bạn đã hoàn thành khóa học và nhận được chứng chỉ.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    navigate(`/certificates/${courseCertificate.id}`)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition"
                >
                  <Eye className="h-4 w-4" />
                  Xem chứng chỉ
                </button>
                <button
                  onClick={async () => {
                    try {
                      const blob = await certificateApi.downloadCertificate(
                        courseCertificate.id
                      )
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `certificate-${courseCertificate.certificateNumber}.pdf`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      window.URL.revokeObjectURL(url)
                      toast.success('Đã tải xuống chứng chỉ thành công!')
                    } catch (error) {
                      console.error('Download error:', error)
                      toast.error('Không thể tải xuống chứng chỉ')
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  <Download className="h-4 w-4" />
                  Tải PDF
                </button>
                <button
                  onClick={() => navigate('/my-certificates')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white border border-green-300 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-50 transition"
                >
                  <Trophy className="h-4 w-4" />
                  Tất cả chứng chỉ
                </button>
              </div>
            </div>
          )}

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
