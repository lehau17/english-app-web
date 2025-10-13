function Stepper({
  items,
  activeId,
  onJump,
  isPreviewMode = false,
}: {
  items: Activity[]
  activeId?: string
  onJump: (id: string) => void
  isPreviewMode?: boolean
}): JSX.Element {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="text-sm text-gray-500 text-center">
          Không có hoạt động nào
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        {items
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((a) => {
            const isActive = a.id === activeId
            const done = a.state === 'done' || a.state === 'mastered'
            const isReviewNeeded = a.state === 'review_needed'
            // In preview mode, allow access to all activities
            const canAccess =
              isPreviewMode || done || a.state === 'in_progress' || isReviewNeeded
            return (
              <button
                key={a.id}
                onClick={() => canAccess && onJump(a.id)}
                title={
                  !canAccess
                    ? 'Hoàn thành các hoạt động trước đó để truy cập'
                    : a.title
                }
                className={classNames(
                  'group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isReviewNeeded
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : canAccess
                        ? 'border-gray-200 bg-white hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={!canAccess}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                  {a.orderNo}
                </span>
                <span className="whitespace-nowrap">{a.title}</span>
                {done && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {isReviewNeeded && (
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                )}
              </button>
            )
          })}
      </div>
    </div>
  )
}

const handlePass = useCallback(
    async (payload?: ActivityCompletePayload) => {
      if (!activeId || !user?.id) return

      // Block submit in preview mode
      if (isPreviewMode) {
        toast.error(
          'Không thể nộp bài trong chế độ xem trước. Lớp học chưa bắt đầu!'
        )
        return
      }

      try {
        const score = payload?.score ?? 100
        const newState: ProgressState =
          score >= 85 ? 'mastered' : score >= 70 ? 'review_needed' : 'done'

        // Mark activity as completed in local state
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activeId
              ? {
                  ...a,
                  state: newState,
                  lastScore: score,
                  lastFeedback: payload?.feedback,
                }
              : a
          )
        )

        // Call API to complete activity using mutation
        await completeActivityMutation.mutateAsync({
          activityId: activeId,
          userId: user.id,
          score,
        })

        if (newState === 'review_needed') {
          toast(
            'Làm tốt lắm! Hãy thử làm lại bài này khi có thời gian để đạt điểm cao hơn nhé.',
            {
              icon: '💡',
            }
          )
        }

        // Clear any error message on successful completion
        setErrorMessage(null)
        setErrorDetails(null)

        // Check if all activities are now completed after this completion
        const updatedActivities = activities.map((a) =>
          a.id === activeId
            ? {
                ...a,
                state: newState,
                lastScore: score,
                lastFeedback: payload?.feedback,
              }
            : a
        )

        const allCompleted = updatedActivities.every(
          (activity) =>
            activity.state === 'done' ||
            activity.state === 'mastered' ||
            activity.state === 'review_needed'
        )

        // If all activities are completed, try to unlock next lesson
        if (allCompleted && lessonId) {
          try {
            const unlockResult =
              await unlockNextLessonMutation.mutateAsync(lessonId)
            // Show success message with the unlock result
            if (unlockResult.data.message) {
              // Success - lesson unlocked
            }
          } catch (unlockError) {
            // Don't fail the main flow if unlock fails
            console.error('Failed to unlock next lesson:', unlockError)
          }
        }
      } catch (error) {
        console.error('Failed to complete activity:', error)
        // Revert local state on error
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activeId
              ? { ...a, state: 'in_progress' as ProgressState }
              : a
          )
        )
      }
    },
    [
      activeId,
      user?.id,
      activities,
      lessonId,
      isPreviewMode,
      completeActivityMutation,
      unlockNextLessonMutation,
    ]
  )