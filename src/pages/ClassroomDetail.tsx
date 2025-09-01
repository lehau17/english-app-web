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
import { useState, type JSX } from 'react'

/**
 * =========================
 * Domain types & props
 * =========================
 */

type Role = 'student' | 'teacher' | 'parent' | 'admin'

type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

interface CurrentUser {
  id: string
  role: Role
  firstName: string
  lastName: string
  displayName: string
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  avatarUrl: string
}

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

type AssignmentStatus = 'draft' | 'published' | 'archived'

interface Assignment {
  id: string
  title: string
  description?: string
  instructions?: string
  dueDate: string // ISO
  status: AssignmentStatus
  isPublished: boolean
  totalPoints: number
  timeLimit?: number // minutes
  maxAttempts: number
  createdAt: string // ISO
  _count: { submissions: number }
}

type AnnouncementPriority = 'high' | 'normal' | 'low'

interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  targetAll: boolean
  createdAt: string // ISO
  updatedAt: string // ISO
}

interface Schedule {
  days: Weekday[]
  time: string // HH:mm
  duration: number // minutes
}

interface ClassroomModel {
  id: string
  name: string
  description: string
  classCode: string
  teacher: Teacher
  isActive: boolean
  maxStudents: number
  createdAt: string
  updatedAt: string
  expiresAt?: string
  settings: {
    allowDiscussion: boolean
    autoGrade: boolean
    dueTimeDefault: string // HH:mm
  }
  schedule?: Schedule
  _count: {
    students: number
    assignments: number
    announcements: number
  }
  students: Student[]
  assignments: Assignment[]
  announcements: Announcement[]
}

/** =========================
 * NEW: Lesson/Activity UI types
 * ========================= */
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
  isLocked?: boolean
  activities: ActivityUI[]
}

/**
 * =========================
 * Mock data (typed)
 * =========================
 */

const currentUser: CurrentUser = {
  id: 'user123',
  role: 'teacher',
  firstName: 'Bé',
  lastName: 'Ong',
  displayName: 'Bé Ong',
}

const mockClassroomDetail: ClassroomModel = {
  id: 'class1',
  name: 'Tiếng Anh Lớp 5A',
  description:
    'Lớp học tiếng Anh cho học sinh lớp 5, tập trung vào từ vựng và ngữ pháp cơ bản',
  classCode: 'ABC123XY',
  teacher: {
    id: 'teacher1',
    firstName: 'Cô',
    lastName: 'Lan',
    displayName: 'Cô Lan',
    email: 'co.lan@school.edu.vn',
    avatarUrl: '/api/placeholder/60/60',
  },
  isActive: true,
  maxStudents: 30,
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-08-29T10:00:00Z',
  expiresAt: '2024-12-31T23:59:59Z',
  settings: {
    allowDiscussion: true,
    autoGrade: true,
    dueTimeDefault: '17:00',
  },
  schedule: {
    days: ['monday', 'wednesday', 'friday'],
    time: '14:00',
    duration: 90,
  },
  _count: {
    students: 24,
    assignments: 2,
    announcements: 2,
  },
  students: [
    {
      id: 's1',
      firstName: 'Nguyễn Văn',
      lastName: 'An',
      displayName: 'Nguyễn Văn An',
      avatarUrl: '/api/placeholder/32/32',
      studentRecord: {
        joinedAt: '2024-01-15T00:00:00Z',
        isActive: true,
        notes: 'Học sinh chăm chỉ',
      },
    },
    {
      id: 's2',
      firstName: 'Trần Thị',
      lastName: 'Bình',
      displayName: 'Trần Thị Bình',
      avatarUrl: '/api/placeholder/32/32',
      studentRecord: {
        joinedAt: '2024-01-16T00:00:00Z',
        isActive: true,
      },
    },
    {
      id: 's3',
      firstName: 'Lê Hoàng',
      lastName: 'Cường',
      displayName: 'Lê Hoàng Cường',
      avatarUrl: '/api/placeholder/32/32',
      studentRecord: {
        joinedAt: '2024-01-17T00:00:00Z',
        isActive: true,
      },
    },
  ],
  assignments: [
    {
      id: 'assign1',
      title: 'Bài tập từ vựng Unit 3',
      description: 'Hoàn thành các bài tập về từ vựng chủ đề gia đình',
      instructions:
        'Làm tất cả các bài tập từ trang 25-30. Ghi âm phát âm của 10 từ mới.',
      dueDate: '2024-08-31T17:00:00Z',
      status: 'published',
      isPublished: true,
      totalPoints: 100,
      timeLimit: 45,
      maxAttempts: 3,
      createdAt: '2024-08-25T10:00:00Z',
      _count: {
        submissions: 18,
      },
    },
    {
      id: 'assign2',
      title: 'Ngữ pháp: Present Simple',
      description: 'Bài tập về thì hiện tại đơn',
      instructions: 'Hoàn thành 20 câu trắc nghiệm và 5 câu viết lại câu.',
      dueDate: '2024-09-02T17:00:00Z',
      status: 'published',
      isPublished: true,
      totalPoints: 50,
      timeLimit: 30,
      maxAttempts: 2,
      createdAt: '2024-08-28T09:00:00Z',
      _count: {
        submissions: 12,
      },
    },
  ],
  announcements: [
    {
      id: 'ann1',
      title: 'Nghỉ học ngày 30/8',
      content:
        'Lớp học sẽ nghỉ vào ngày 30/8 do giáo viên có việc đột xuất. Các em nhớ làm bài tập về nhà nhé!',
      priority: 'high',
      targetAll: true,
      createdAt: '2024-08-28T10:00:00Z',
      updatedAt: '2024-08-28T10:00:00Z',
    },
    {
      id: 'ann2',
      title: 'Thông báo kiểm tra giữa kỳ',
      content:
        'Kiểm tra giữa kỳ sẽ diễn ra vào ngày 5/9. Phạm vi ôn tập từ Unit 1 đến Unit 3.',
      priority: 'normal',
      targetAll: true,
      createdAt: '2024-08-26T15:00:00Z',
      updatedAt: '2024-08-26T15:00:00Z',
    },
  ],
}

/** =========================
 * NEW: Mock lessons + activities
 * ========================= */
const mockLessons: LessonUI[] = [
  {
    id: 'lesson1',
    title: 'Unit 1 · My Family',
    orderNo: 1,
    estimatedTime: 25,
    difficulty: 'beginner',
    isLocked: false,
    activities: [
      {
        id: 'a1',
        lessonId: 'lesson1',
        orderNo: 1,
        type: 'vocab',
        title: 'Từ vựng: Family',
        state: 'done',
      },
      {
        id: 'a2',
        lessonId: 'lesson1',
        orderNo: 2,
        type: 'flashcard',
        title: 'Flashcards: Family',
        state: 'in_progress',
      },
      {
        id: 'a3',
        lessonId: 'lesson1',
        orderNo: 3,
        type: 'quiz',
        title: 'Quiz nhanh',
        passingScore: 70,
      },
      {
        id: 'a4',
        lessonId: 'lesson1',
        orderNo: 4,
        type: 'listening',
        title: 'Nghe & Chọn đáp án',
        duration: 8,
      },
      {
        id: 'a5',
        lessonId: 'lesson1',
        orderNo: 5,
        type: 'pronunciation',
        title: 'Phát âm /f/ & /v/',
      },
    ],
  },
  {
    id: 'lesson2',
    title: 'Unit 2 · Colors & Shapes',
    orderNo: 2,
    estimatedTime: 30,
    difficulty: 'beginner',
    isLocked: false,
    activities: [
      {
        id: 'b1',
        lessonId: 'lesson2',
        orderNo: 1,
        type: 'mini_game',
        title: 'Color Pop Game',
      },
      {
        id: 'b2',
        lessonId: 'lesson2',
        orderNo: 2,
        type: 'reading',
        title: 'Đọc ngắn: Color Poem',
      },
      {
        id: 'b3',
        lessonId: 'lesson2',
        orderNo: 3,
        type: 'quiz',
        title: 'Color Quiz',
        passingScore: 70,
      },
      {
        id: 'b4',
        lessonId: 'lesson2',
        orderNo: 4,
        type: 'speaking',
        title: 'Nói về màu yêu thích',
      },
    ],
  },
  {
    id: 'lesson3',
    title: 'Unit 3 · Present Simple',
    orderNo: 3,
    estimatedTime: 35,
    difficulty: 'elementary',
    isLocked: true,
    activities: [
      {
        id: 'c1',
        lessonId: 'lesson3',
        orderNo: 1,
        type: 'grammar',
        title: 'Cấu trúc & Quy tắc',
      },
      {
        id: 'c2',
        lessonId: 'lesson3',
        orderNo: 2,
        type: 'writing',
        title: 'Viết câu đơn giản',
      },
      {
        id: 'c3',
        lessonId: 'lesson3',
        orderNo: 3,
        type: 'conversation',
        title: 'Hội thoại ngắn',
      },
    ],
  },
]

/**
 * =========================
 * UI Sub-components (typed)
 * =========================
 */

type AssignmentCardProps = { assignment: Assignment }

function AssignmentCard({ assignment }: AssignmentCardProps): JSX.Element {
  const dueDate = new Date(assignment.dueDate)
  const isOverdue = dueDate < new Date()
  const completionRate =
    (assignment._count.submissions / mockClassroomDetail._count.students) * 100

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
              {dueDate.toLocaleDateString('vi-VN')} lúc{' '}
              {dueDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
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
            {assignment._count.submissions}/
            {mockClassroomDetail._count.students} học sinh đã nộp
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

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>Tối đa {assignment.maxAttempts} lần làm</span>
          <span>•</span>
          <span>
            Tạo lúc {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
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

  const Icon = priorityIcons[announcement.priority] ?? Bell

  return (
    <div
      className={`rounded-xl border p-4 ${priorityColors[announcement.priority] ?? priorityColors.normal}`}
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

type StudentCardProps = { student: Student }

function StudentCard({ student }: StudentCardProps): JSX.Element {
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
}

function LessonRow({
  lesson,
  isOpen,
  onToggle,
  onStart,
  onStartActivity,
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
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 gap-4 hover:bg-gray-50 rounded-xl transition"
        aria-expanded={isOpen}
        aria-controls={`lesson-${lesson.id}-content`}
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
              {lesson.isLocked && (
                <span className="text-xs rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                  Locked
                </span>
              )}
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
            {nextActivity ? 'Tiếp tục học' : 'Ôn lại bài'}
          </button>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="h-8 w-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white"
          >
            <ChevronIcon />
          </motion.div>
        </div>
      </button>

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

/** Small chevron icon (so we don’t import another) */
function ChevronIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-500">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * =========================
 * Main component (typed)
 * =========================
 */

type TabKey = 'overview' | 'assignments' | 'announcements' | 'students'

interface ClassroomDetailProps {
  classroomId?: string
  onBack: () => void
  // optional handlers to integrate API
  onStartLesson?: (lessonId: string) => void
  onStartActivity?: (lessonId: string, activityId: string) => void
  onContinueLearning?: () => void
}

export default function ClassroomDetail({
  onBack,
  onStartLesson,
  onStartActivity,
  onContinueLearning,
}: ClassroomDetailProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [searchStudent, setSearchStudent] = useState<string>('')
  const [openLessonId, setOpenLessonId] = useState<string | null>(null) // <-- NEW

  const copyClassCode = async (code: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code)
      console.log('Class code copied:', code)
    } catch (err) {
      console.error('Failed to copy class code:', err)
    }
  }

  const filteredStudents: Student[] = mockClassroomDetail.students.filter(
    (student) =>
      student.displayName.toLowerCase().includes(searchStudent.toLowerCase())
  )

  const averageScore = 85 // Mock
  const completionRate = 78 // Mock

  const tabs: ReadonlyArray<{ id: TabKey; label: string; icon: LucideIcon }> = [
    { id: 'overview', label: 'Tổng quan', icon: BookOpen },
    { id: 'assignments', label: 'Bài tập', icon: FileText },
    { id: 'announcements', label: 'Thông báo', icon: Bell },
    { id: 'students', label: 'Học sinh', icon: Users },
  ] as const

  // CTA handlers (you can wire your API here)
  const handleStartLesson = (lessonId: string) => {
    onStartLesson?.(lessonId)
    console.log('Start/Continue lesson:', lessonId)
  }
  const handleStartActivity = (lessonId: string, activityId: string) => {
    onStartActivity?.(lessonId, activityId)
    console.log('Start activity:', { lessonId, activityId })
  }
  const handleContinueLearning = () => {
    onContinueLearning?.()
    console.log('Global Continue learning')
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
            <h1 className="text-2xl font-bold text-gray-900">
              {mockClassroomDetail.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{mockClassroomDetail.teacher.displayName}</span>
              <span>•</span>
              <span
                className={`text-sm ${
                  mockClassroomDetail.isActive
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {mockClassroomDetail.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: Global CTA “Tiếp tục học” */}
          {currentUser.role === 'student' && (
            <button
              onClick={handleContinueLearning}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
            >
              <Play className="h-4 w-4" />
              Tiếp tục học
            </button>
          )}

          <button
            onClick={() => copyClassCode(mockClassroomDetail.classCode)}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 transition"
          >
            <Copy className="h-4 w-4" />
            {mockClassroomDetail.classCode}
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
                {mockClassroomDetail._count.students}/
                {mockClassroomDetail.maxStudents}
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
                {mockClassroomDetail._count.assignments}
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
                {mockClassroomDetail._count.announcements}
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
                    {mockLessons.length} bài • ước tính ~
                    {mockLessons.reduce(
                      (sum, l) => sum + (l.estimatedTime ?? 0),
                      0
                    )}{' '}
                    phút
                  </span>
                </div>

                <div className="space-y-3">
                  {mockLessons.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      isOpen={openLessonId === lesson.id}
                      onToggle={() =>
                        setOpenLessonId(
                          openLessonId === lesson.id ? null : lesson.id
                        )
                      }
                      onStart={handleStartLesson}
                      onStartActivity={handleStartActivity}
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
                    <p className="text-gray-600 mt-1">
                      {mockClassroomDetail.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ngày tạo
                      </label>
                      <p className="text-gray-600 mt-1">
                        {new Date(
                          mockClassroomDetail.createdAt
                        ).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Lần cập nhật cuối
                      </label>
                      <p className="text-gray-600 mt-1">
                        {new Date(
                          mockClassroomDetail.updatedAt
                        ).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {mockClassroomDetail.schedule && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Lịch học
                      </label>
                      <p className="text-gray-600 mt-1">
                        {mockClassroomDetail.schedule.days.join(', ')} lúc{' '}
                        {mockClassroomDetail.schedule.time}
                        {mockClassroomDetail.schedule.duration &&
                          ` (${mockClassroomDetail.schedule.duration} phút)`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing: Bài tập gần đây */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-lg font-semibold mb-4">Bài tập gần đây</h3>
                <div className="space-y-4">
                  {mockClassroomDetail.assignments
                    .slice(0, 3)
                    .map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                      />
                    ))}
                  {mockClassroomDetail.assignments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Chưa có bài tập nào
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Danh sách bài tập</h3>
                {currentUser.role === 'teacher' && (
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition">
                    <Plus className="h-4 w-4" />
                    Tạo bài tập
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {mockClassroomDetail.assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
                {mockClassroomDetail.assignments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Chưa có bài tập
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {currentUser.role === 'teacher'
                        ? 'Tạo bài tập đầu tiên cho lớp học này'
                        : 'Giáo viên chưa tạo bài tập nào'}
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
                {currentUser.role === 'teacher' && (
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition">
                    <Plus className="h-4 w-4" />
                    Tạo thông báo
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {mockClassroomDetail.announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                  />
                ))}
                {mockClassroomDetail.announcements.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Chưa có thông báo
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {currentUser.role === 'teacher'
                        ? 'Tạo thông báo đầu tiên cho lớp học này'
                        : 'Chưa có thông báo nào từ giáo viên'}
                    </p>
                  </div>
                )}
              </div>
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
                  {currentUser.role === 'teacher' && (
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
                    <StudentCard key={student.id} student={student} />
                  ))}
                  {filteredStudents.length === 0 && searchStudent && (
                    <p className="text-center py-8 text-gray-500">
                      Không tìm thấy học sinh phù hợp
                    </p>
                  )}
                  {mockClassroomDetail.students.length === 0 && (
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
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="text-base font-semibold mb-4">Giáo viên</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={mockClassroomDetail.teacher.avatarUrl}
                  alt={mockClassroomDetail.teacher.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {mockClassroomDetail.teacher.displayName}
                </p>
                <p className="text-sm text-gray-500">
                  {mockClassroomDetail.teacher.email}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="text-base font-semibold mb-4">Thao tác nhanh</h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-50 transition">
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Nhắn tin cho giáo viên</span>
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
                  {new Date(mockClassroomDetail.createdAt).toLocaleDateString(
                    'vi-VN'
                  )}
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
              {mockClassroomDetail.expiresAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hết hạn mã lớp</span>
                  <span className="font-medium text-orange-600">
                    {new Date(mockClassroomDetail.expiresAt).toLocaleDateString(
                      'vi-VN'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Class Settings Preview */}
          {currentUser.role === 'teacher' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-base font-semibold mb-4">Cài đặt lớp học</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cho phép thảo luận</span>
                  <span
                    className={
                      mockClassroomDetail.settings.allowDiscussion
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {mockClassroomDetail.settings.allowDiscussion
                      ? 'Có'
                      : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tự động chấm điểm</span>
                  <span
                    className={
                      mockClassroomDetail.settings.autoGrade
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {mockClassroomDetail.settings.autoGrade ? 'Có' : 'Không'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giờ hạn mặc định</span>
                  <span className="font-medium">
                    {mockClassroomDetail.settings.dueTimeDefault}
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
    </div>
  )
}
