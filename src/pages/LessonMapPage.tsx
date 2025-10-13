import { CheckCircle2, Loader2, Lock, Star } from 'lucide-react'
import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useClassroomDetail } from '../hooks/useClassroomDetail'
import { useNextLesson } from '../hooks/useNextLesson'

// Define a type for the lesson status
type LessonStatus = 'completed' | 'active' | 'locked'

// Generate positions for lessons to form a winding path
const generateLessonPositions = (count: number) => {
  const positions = []
  for (let i = 0; i < count; i++) {
    const x = 10 + (i % 5) * 18 + (Math.floor(i / 5) % 2 === 1 ? 9 : 0)
    const y = 85 - Math.floor(i / 5) * 20
    positions.push({ x, y })
  }
  return positions
}

const LessonMapPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const {
    data: classroomDetail,
    isLoading,
    isError,
  } = useClassroomDetail(classroomId)
  const { data: nextLessonData } = useNextLesson()

  const lessons = useMemo(() => {
    if (!classroomDetail?.lessons) return []

    const lessonPositions = generateLessonPositions(
      classroomDetail.lessons.length
    )

    return classroomDetail.lessons
      .map((lesson, index) => {
        const totalActivities = lesson.activities.length
        const completedActivities = lesson.activities.filter(
          (a) => a.progress && a.progress[0]?.state === 'mastered'
        ).length

        let status: LessonStatus = 'locked'
        if (nextLessonData?.id === lesson.id) {
          status = 'active'
        } else if (totalActivities > 0 && completedActivities === totalActivities) {
          status = 'completed'
        }

        return {
          id: lesson.id,
          title: lesson.title,
          status,
          position: lessonPositions[index] || { x: 50, y: 50 },
        }
      })
      .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
  }, [classroomDetail, nextLessonData])

  const handleLessonClick = (status: LessonStatus, lessonId: string) => {
    if (status === 'completed' || status === 'active') {
      navigate(`/learn/${classroomId}/${lessonId}`)
    } else {
      alert('Bạn cần hoàn thành các bài học trước!')
    }
  }

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
        )
      case 'active':
        return (
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse" />
            <div className="relative w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <Star className="w-10 h-10 text-white" />
            </div>
          </div>
        )
      case 'locked':
        return (
          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg opacity-70">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Lỗi khi tải dữ liệu bản đồ bài học.
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      <img
        src="https://i.imgur.com/yGqB1fN.jpg"
        alt="Adventure Map"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>
        </defs>
        {lessons.length > 1 && (
          <path
            d={lessons
              .map(
                (l, i) =>
                  `${i === 0 ? 'M' : 'L'} ${l.position.x}% ${l.position.y}%`
              )
              .join(' ')}
            stroke="url(#pathGradient)"
            strokeWidth="10"
            fill="none"
            strokeDasharray="20,10"
            strokeLinecap="round"
          />
        )}
      </svg>
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${lesson.position.x}%`, top: `${lesson.position.y}%` }}
          onClick={() => handleLessonClick(lesson.status, lesson.id)}
        >
          {getStatusIcon(lesson.status)}
          <div className="absolute bottom-full mb-2 w-48 text-center p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="font-bold text-gray-800">{lesson.title}</p>
          </div>
        </div>
      ))}
      {(() => {
        const activeLesson = lessons.find((l) => l.status === 'active')
        if (activeLesson) {
          return (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${activeLesson.position.x}%`,
                top: `${activeLesson.position.y}%`,
                marginTop: '-60px',
              }}
            >
              <img
                src="https://i.imgur.com/7k1h5ma.png"
                alt="Player Avatar"
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
            </div>
          )
        }
        return null
      })()}
    </div>
  )
}

export default LessonMapPage