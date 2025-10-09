# 🟡 ENGLISHWEB - Chức Năng Chưa Implement

**Module:** Student Learning Portal
**Last Updated:** 2025-01-05

---

## ⭐⭐⭐⭐⭐ **CRITICAL - Blocking Issues**

### 1. Learn Player - Missing Constraints (HIGHEST PRIORITY)
**File:** `src/pages/LearnPage.tsx`
**Priority:** CRITICAL ⚡⚡⚡
**Effort:** 1-2 tuần
**Impact:** Core learning integrity

**Vấn đề:** Students có thể cheat bằng cách:
- Unlimited retries (không respect maxAttempts)
- No time pressure (không enforce timeLimit)
- No pass/fail (không check passingScore)

---

#### A. Time Limit Enforcement
**Line:** 2463
**Effort:** 2-3 ngày

**Cần làm:**
- [ ] Add countdown timer component
- [ ] Start timer khi activity begins
- [ ] Show timer prominently in UI
- [ ] Auto-submit khi time expires
- [ ] Block further attempts after timeout
- [ ] Save timeout state to backend

**Code:**
```typescript
// Add state
const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
const [timedOut, setTimedOut] = useState(false)

// Start timer
useEffect(() => {
  if (!activity.timeLimit) return

  setTimeRemaining(activity.timeLimit * 60) // Convert minutes to seconds

  const interval = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev === null || prev <= 0) {
        clearInterval(interval)
        handleTimeout()
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(interval)
}, [activity.id])

const handleTimeout = async () => {
  setTimedOut(true)
  toast.error('Time\'s up! Auto-submitting...')
  await handleSubmit(true) // Force submit
}

// UI Component
{activity.timeLimit && timeRemaining !== null && (
  <div className={`timer ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
    <Clock className="w-4 h-4" />
    <span>{formatTime(timeRemaining)}</span>
  </div>
)}
```

---

#### B. Max Attempts Enforcement
**Lines:** 2240, 2274
**Effort:** 2-3 ngày

**Cần làm:**
- [ ] Fetch attempts count từ backend
- [ ] Show "X attempts remaining"
- [ ] Disable retry button khi hết lượt
- [ ] Block activity access khi maxed out
- [ ] Add reset mechanism (admin only)

**Backend API needed:**
```typescript
// GET /api/activities/:id/attempts?studentId=xxx
{
  currentAttempts: number
  maxAttempts: number
  attemptsRemaining: number
  canRetry: boolean
}
```

**Code:**
```typescript
// Fetch attempts
const { data: attemptData } = useQuery({
  queryKey: ['activity-attempts', activity.id],
  queryFn: () => learnApi.getAttempts(activity.id)
})

const attemptsLeft = attemptData?.attemptsRemaining || 0
const canRetry = attemptData?.canRetry && attemptsLeft > 0

// UI
{activity.maxAttempts && (
  <div className="attempts-indicator">
    <span>Attempts: {attemptData?.currentAttempts} / {activity.maxAttempts}</span>
    {attemptsLeft === 0 && (
      <Badge variant="error">No attempts remaining</Badge>
    )}
  </div>
)}

// Disable retry
<Button
  onClick={handleRetry}
  disabled={!canRetry || attemptsLeft === 0}
>
  {attemptsLeft === 0 ? 'No Attempts Left' : 'Try Again'}
</Button>
```

---

#### C. Passing Score Validation
**Lines:** 260, 1152, 1263
**Effort:** 2-3 ngày

**Cần làm:**
- [ ] Calculate real score (not just completion %)
- [ ] Compare với activity.passingScore
- [ ] Show pass/fail status clearly
- [ ] Block next activity if failed + required
- [ ] Add retry với feedback

**Code:**
```typescript
// Calculate score
const calculateScore = (userAnswers: any[], correctAnswers: any[]) => {
  let correct = 0
  userAnswers.forEach((answer, index) => {
    if (answer === correctAnswers[index]) correct++
  })
  return (correct / correctAnswers.length) * 100
}

const score = calculateScore(userAnswers, activity.correctAnswers)
const passed = score >= activity.passingScore

// Update result state
setResult({
  score,
  passed,
  passingScore: activity.passingScore,
  feedback: passed
    ? 'Congratulations! You passed!'
    : `You scored ${score}%. Passing score is ${activity.passingScore}%. Please try again.`
})

// Block progression
const canProceed = !activity.isRequired || passed

// UI
{result && (
  <div className={`result-card ${result.passed ? 'success' : 'fail'}`}>
    <h3>{result.passed ? '✅ Passed!' : '❌ Failed'}</h3>
    <p>Your Score: {result.score}%</p>
    <p>Passing Score: {result.passingScore}%</p>
    <p>{result.feedback}</p>

    {!result.passed && attemptsLeft > 0 && (
      <Button onClick={handleRetry}>
        Try Again ({attemptsLeft} attempts left)
      </Button>
    )}

    {result.passed && (
      <Button onClick={handleNextActivity}>
        Continue to Next Activity
      </Button>
    )}
  </div>
)}
```

---

### 2. CreatePodcastPageBeautiful - Audio Polling
**File:** `src/pages/CreatePodcastPageBeautiful.tsx`
**Priority:** CRITICAL
**Effort:** 2-3 ngày

**Vấn đề:**
- Audio generation chỉ log ra console
- Không poll status từ backend
- User không biết khi nào audio ready

**Cần làm:**
- [ ] Implement polling mechanism
- [ ] Show progress indicator
- [ ] Handle completed state → set audioUrl
- [ ] Handle failed state → show error + retry
- [ ] Add cancel generation option

**Code:**
```typescript
const [generatingAudio, setGeneratingAudio] = useState(false)
const [generationProgress, setGenerationProgress] = useState(0)

const handleGenerateAudio = async () => {
  setGeneratingAudio(true)
  setGenerationProgress(0)

  try {
    // Start generation
    const { jobId } = await podcastApi.generateAudio({
      text: formData.content,
      voiceType: formData.voiceType,
      speed: formData.speechSpeed
    })

    // Poll status
    await pollAudioStatus(jobId)
  } catch (error) {
    toast.error('Failed to generate audio')
    setGeneratingAudio(false)
  }
}

const pollAudioStatus = async (jobId: string) => {
  const maxAttempts = 60 // 2 minutes max
  let attempts = 0

  const poll = async () => {
    attempts++

    if (attempts > maxAttempts) {
      throw new Error('Audio generation timeout')
    }

    const status = await podcastApi.checkAudioStatus(jobId)

    setGenerationProgress(status.progress || 0)

    if (status.status === 'completed') {
      setValue('audioUrl', status.audioUrl)
      toast.success('Audio generated successfully!')
      setGeneratingAudio(false)
      return
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Generation failed')
    }

    // Continue polling
    setTimeout(poll, 2000) // Poll every 2 seconds
  }

  await poll()
}

// UI
{generatingAudio && (
  <div className="generating-overlay">
    <Loader className="animate-spin" />
    <p>Generating audio... {generationProgress}%</p>
    <Progress value={generationProgress} />
    <Button variant="ghost" onClick={cancelGeneration}>
      Cancel
    </Button>
  </div>
)}
```

**Backend API needed:**
```typescript
// POST /api/podcasts/generate-audio
{ jobId: string }

// GET /api/podcasts/audio-status/:jobId
{
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  audioUrl?: string
  error?: string
}
```

---

### 3. ClassroomDetail - Missing Submission Data
**File:** `src/pages/ClassroomDetail.tsx`
**Lines:** 1474, 1618
**Priority:** HIGH
**Effort:** 2-3 ngày

**Vấn đề:**
```typescript
submission={assignment.submission ?? null}
```
Always passing null, students can't see their submission status

**Cần làm:**
- [ ] Fetch assignments WITH submissions trong 1 API call
- [ ] Backend JOIN submissions table với student ID
- [ ] Map submission data to assignments
- [ ] Handle null case (chưa submit)

**Backend API change:**
```typescript
// GET /api/classrooms/:id/assignments-with-submissions
{
  assignments: Array<{
    id: string
    title: string
    dueDate: Date
    submission: {
      id: string
      status: 'submitted' | 'graded' | 'late'
      score: number | null
      submittedAt: Date
      feedback: string | null
    } | null // null if not submitted
  }>
}
```

**Frontend code:**
```typescript
// Update API call
const { data: assignmentsData } = useQuery({
  queryKey: ['classroom-assignments', classroomId],
  queryFn: () => classroomApi.getAssignmentsWithSubmissions(classroomId)
})

// Use real submission data
{assignmentsData?.assignments.map(assignment => (
  <AssignmentCard
    key={assignment.id}
    assignment={assignment}
    submission={assignment.submission} // Real data or null
  />
))}
```

---

### 4. Podcast Comment Hooks - Missing Toast
**File:** `src/hooks/podcast-comment.hooks.ts`
**Priority:** MEDIUM
**Effort:** 30 phút ⚡ QUICK WIN

**Vấn đề:**
- Success/error không có feedback cho user
- react-hot-toast đã có trong project nhưng chưa import

**Cần làm:**
```typescript
import toast from 'react-hot-toast'

// In useCreateComment
const createMutation = useMutation({
  mutationFn: (data: CreateCommentData) =>
    podcastCommentApi.create(data),
  onSuccess: () => {
    toast.success('Comment added successfully!')
    queryClient.invalidateQueries(['podcast-comments'])
  },
  onError: (error: any) => {
    toast.error(error.message || 'Failed to add comment')
  }
})

// In useDeleteComment
const deleteMutation = useMutation({
  mutationFn: (id: string) => podcastCommentApi.delete(id),
  onSuccess: () => {
    toast.success('Comment deleted')
    queryClient.invalidateQueries(['podcast-comments'])
  },
  onError: (error: any) => {
    toast.error('Failed to delete comment')
  }
})

// Similar cho update, like, etc.
```

---

## ⭐⭐⭐ **HIGH Priority**

### 5. Grade Details Page
**Priority:** HIGH
**Effort:** 3-4 ngày

**Cần tạo:**
- New route: `/classroom-detail/:id/assignments/:assignmentId/submissions/:submissionId`
- New page: `src/pages/AssignmentSubmissionDetailPage.tsx`

**Features:**
- [ ] Show submission details (answers, time taken, etc.)
- [ ] Grade input form (0-100)
- [ ] Feedback textarea
- [ ] Rubric scoring (if applicable)
- [ ] File attachments display
- [ ] Save grade button

**Code structure:**
```typescript
// src/pages/AssignmentSubmissionDetailPage.tsx
export default function AssignmentSubmissionDetailPage() {
  const { classroomId, assignmentId, submissionId } = useParams()

  const { data: submission } = useQuery({
    queryKey: ['submission-detail', submissionId],
    queryFn: () => assignmentApi.getSubmissionDetail(submissionId)
  })

  const gradeMutation = useMutation({
    mutationFn: (data: { score: number, feedback: string }) =>
      assignmentApi.gradeSubmission(submissionId, data),
    onSuccess: () => {
      toast.success('Graded successfully!')
      navigate(-1)
    }
  })

  return (
    <div className="submission-detail">
      {/* Student info */}
      {/* Submission content */}
      {/* Grade form */}
    </div>
  )
}
```

---

### 6. Learner Notes Persistence
**File:** `src/pages/LearnPage.tsx`
**Lines:** 292, 2169
**Priority:** HIGH
**Effort:** 2-3 ngày

**Vấn đề:**
- Notes mất khi refresh page
- Không resume từ activity cuối cùng

**Cần làm:**
- [ ] API to save/load notes per activity
- [ ] LocalStorage fallback for offline
- [ ] Save current activity ID
- [ ] Resume from last activity on mount
- [ ] Debounce note saves (300ms)

**Code:**
```typescript
// Save note (debounced)
const saveNote = useDebouncedCallback(async (activityId: string, note: string) => {
  try {
    await learnApi.saveNote({ activityId, note })
  } catch (error) {
    // Fallback to localStorage
    localStorage.setItem(`note_${activityId}`, note)
  }
}, 300)

// Load note on activity change
useEffect(() => {
  const loadNote = async () => {
    try {
      const { note } = await learnApi.getNote(activity.id)
      setNotes(note)
    } catch {
      // Fallback to localStorage
      const cached = localStorage.getItem(`note_${activity.id}`)
      if (cached) setNotes(cached)
    }
  }
  loadNote()
}, [activity.id])

// Save last activity
useEffect(() => {
  localStorage.setItem('lastActivityId', activity.id)
}, [activity.id])

// Resume on mount
useEffect(() => {
  const lastActivityId = localStorage.getItem('lastActivityId')
  if (lastActivityId && activities.length > 0) {
    const index = activities.findIndex(a => a.id === lastActivityId)
    if (index !== -1) setCurrentActivityIndex(index)
  }
}, [activities])
```

---

### 7. Teacher Feedback Loop
**File:** `src/pages/LearnPage.tsx`
**Lines:** 930, 1029, 1214
**Priority:** HIGH
**Effort:** 3-4 ngày (requires backend + CMS)

**Vấn đề:**
- Speaking/Writing activities cần manual review
- Không có "pending review" state

**Cần làm:**

**Frontend (Student App):**
- [ ] Add "Submit for Review" button cho speaking/writing
- [ ] Upload audio blobs to S3/storage
- [ ] Show "Pending Review" status
- [ ] Show feedback when teacher grades

**Frontend (CMS/Teacher App):**
- [ ] Pending reviews queue
- [ ] Audio player + transcript
- [ ] Grade + feedback form
- [ ] Bulk review interface

**Backend:**
- [ ] New table: `activity_reviews`
- [ ] API: Submit for review
- [ ] API: Get pending reviews
- [ ] API: Submit feedback

---

## ⭐⭐ **MEDIUM Priority**

### 8. Assignment Bulk Filters & Export
**File:** `src/pages/AssignmentSubmissionsPage.tsx`
**Priority:** MEDIUM
**Effort:** 2-3 ngày

**Cần làm:**
- [ ] Filter by status dropdown
- [ ] Filter by score range slider
- [ ] Filter by attempts input
- [ ] Export to CSV button
- [ ] Export to Excel button (with formatting)

---

### 9. Settings Persistence
**File:** `src/pages/SettingsPage.tsx`
**Priority:** MEDIUM
**Effort:** 2-3 ngày

**Vấn đề:** Settings chỉ console.log

**Cần làm:**
- [ ] Create settings API endpoints
- [ ] Save to backend on change
- [ ] Load on mount
- [ ] Add loading states

---

### 10. Notifications Enhancements
**File:** `src/pages/NotificationsPage.tsx`
**Priority:** MEDIUM
**Effort:** 2-3 ngày

**Cần làm:**
- [ ] Mark single as read
- [ ] Mark all as read
- [ ] Filter by type
- [ ] Delete notification
- [ ] Pagination

---

### 11. Real-time Notifications
**Files:** `src/lib/notificationBus.ts`, `src/hooks/notifications.hooks.ts`
**Priority:** MEDIUM
**Effort:** 3-4 ngày

**Cần làm:**
- [ ] Setup Socket.IO client
- [ ] Connect on auth
- [ ] Subscribe to user's room
- [ ] Update badge on new notification
- [ ] Show toast
- [ ] Auto-refresh notification list

---

### 12. Language Switching
**Files:** `src/i18n.ts`, `src/pages/SettingsPage.tsx:173`
**Priority:** MEDIUM
**Effort:** 1-2 ngày ⚡ QUICK WIN

**Code:**
```typescript
// In SettingsPage.tsx
import { useTranslation } from 'react-i18next'

const { i18n } = useTranslation()

const handleLanguageChange = (lang: string) => {
  i18n.changeLanguage(lang)
  localStorage.setItem('language', lang)
  toast.success('Language updated!')
}
```

---

## 📋 **IMPLEMENTATION ROADMAP**

### Week 1-2: Critical Path
1. Learn Player Constraints (1-2 tuần)
2. CreatePodcast Polling (2-3 ngày)
3. ClassroomDetail Submission (2-3 ngày)

### Week 3-4: Teacher Tools
4. Grade Details Page (3-4 ngày)
5. Learner Notes (2-3 ngày)
6. Teacher Feedback Loop (3-4 ngày)

### Week 5-6: UX Polish
7. Assignment Filters (2-3 ngày)
8. Settings Persistence (2-3 ngày)
9. Notifications Features (2-3 ngày)
10. Real-time Socket.IO (3-4 ngày)

### Week 7+: Nice to Have
11. Language Switching (1-2 ngày)
12. Podcast Comments Toast (30 phút)

**Total: 6-8 weeks**

---

## ⚡ **QUICK WINS**

Do these first (1-2 days each):
1. Podcast Comments Toast (30 phút)
2. Language Switching (1-2 ngày)

---

**Document Owner:** Dev Team
**Status:** 🔴 Critical Features Needed
