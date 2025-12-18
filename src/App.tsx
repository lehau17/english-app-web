import { Toaster } from 'react-hot-toast'
import { Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import { PaymentResultPage } from './components/payment/PaymentResultPage'
import { AuthProvider } from './context/AuthContext'
import { ConversationProvider } from './context/ConversationContext'
import { HomeLayout } from './layouts/HomeLayout'
import AiSpeakingConversationDetailPage from './pages/AiSpeakingConversationDetailPage'
import AiSpeakingConversationsPage from './pages/AiSpeakingConversationsPage'
import AiSpeakingSessionPage from './pages/AiSpeakingSessionPage'
import RemedialSessionPage from './pages/RemedialSessionPage'
import AssignmentResultPage from './pages/AssignmentResultPage'
import AssignmentSubmissionsPage from './pages/AssignmentSubmissionsPage'
import AssignmentTakingPage from './pages/AssignmentTakingPage'
import LoginPage from './pages/auth/LoginPage'
import ParentLoginPage from './pages/auth/ParentLoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CertificateDetailPage from './pages/CertificateDetailPage'
import ClassroomDetail from './pages/ClassroomDetail'
import ClassroomPage from './pages/ClassroomPage'
import CreatePodcastPageWizard from './pages/CreatePodcastPageWizard'
import DictionaryPage from './pages/DictionaryPage'
import FlashcardReviewPage from './pages/FlashcardReviewPage'
import HomePage from './pages/HomePage' // Import HomePage
import LeaderboardPage from './pages/LeaderboardPage'
import LearningPathDetailPage from './pages/LearningPathDetailPage'
import LearningPathPage from './pages/LearningPathPage'
import LearnPlayerPage from './pages/LearnPage'
import ListeningPracticePage from './pages/ListeningPracticePage'
import { ListeningResultPage } from './pages/ListeningResultPage'
import MyCertificatesPage from './pages/MyCertificatesPage'
import MyLearningHistoryPage from './pages/MyLearningHistoryPage'
import MyVocabularyPage from './pages/MyVocabularyPage'
import NotFoundPage from './pages/NotFoundPage' // Import NotFoundPage
import NotificationsPage from './pages/NotificationsPage'
import ParentActivitiesPage from './pages/ParentActivitiesPage'
import ParentChildrenGradesPage from './pages/ParentChildrenGradesPage'
import ParentHomePage from './pages/ParentHomePage'
import ParentLearningPathPage from './pages/ParentLearningPathPage'
import ParentProgressReportPage from './pages/ParentProgressReportPage'
import ParentReportsPage from './pages/ParentReportsPage'
import ParentRewardsPage from './pages/ParentRewardsPage'
import ParentSchedulePage from './pages/ParentSchedulePage'
import ParentSettingsPage from './pages/ParentSettingsPage'
import { PaymentDemoPage } from './pages/PaymentDemoPage'
import PlaylistsPage from './pages/PlaylistsPage'
import PodcastDetailPage from './pages/PodcastDetailPage'
import PodcastPracticePage from './pages/PodcastPracticePage'
import ProfilePage from './pages/ProfilePage'
import QuizReviewPage from './pages/QuizReviewPage'
import SchedulePage from './pages/SchedulePage'
import SettingsPage from './pages/SettingsPage'
import StudentTranscriptPage from './pages/StudentTranscriptPage'
import VerifyCertificatePage from './pages/VerifyCertificatePage'
import VocabularyListDetailPage from './pages/VocabularyListDetailPage'
import VocabularyListsPage from './pages/VocabularyListsPage'
import VocabularyQuickReviewPage from './pages/VocabularyQuickReviewPage'
import VocabularyReviewPage from './pages/VocabularyReviewPage'
import SpeakingPracticePage from './pages/SpeakingPracticePage'
import SpeakingPracticeSessionPage from './pages/SpeakingPracticeSessionPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

function App() {
  // const navigate = useNavigate();

  // Hàm chuyển hướng sang trang học (có thể dùng sau này)
  // const handleContinueLearning = (classroomId: string, lessonId: string, activityId: string) => {
  //   navigate(`/learn/${classroomId}/${lessonId}/${activityId}`);
  // };

  return (
    <AuthProvider>
      <ConversationProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public pages */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/parent-login" element={<ParentLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected pages */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <HomeLayout>
                  <HomePage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent/reports/:childId"
              element={
                <HomeLayout>
                  <ParentProgressReportPage />
                </HomeLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <HomeLayout>
                  <ProfilePage />
                </HomeLayout>
              }
            />
            <Route
              path="/schedule"
              element={
                <HomeLayout>
                  <SchedulePage />
                </HomeLayout>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <HomeLayout>
                  <LeaderboardPage />
                </HomeLayout>
              }
            />
            <Route
              path="/playlists"
              element={
                <HomeLayout>
                  <PlaylistsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/classroom"
              element={
                <HomeLayout>
                  <ClassroomPage />
                </HomeLayout>
              }
            />
            <Route
              path="/classroom-detail/:id"
              element={
                <HomeLayout>
                  <ClassroomDetailWrapper />
                </HomeLayout>
              }
            />
            <Route
              path="/classroom/:id"
              element={
                <HomeLayout>
                  <ClassroomDetailWrapper />
                </HomeLayout>
              }
            />
            <Route
              path="/classroom-detail/:id/assignments/:assignmentId/submissions"
              element={
                <HomeLayout>
                  <AssignmentSubmissionsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/classroom/:classroomId/assignment/:assignmentId"
              element={
                <HomeLayout>
                  <AssignmentTakingPage />
                </HomeLayout>
              }
            />
            <Route
              path="/classroom/:classroomId/assignment/:assignmentId/result"
              element={
                <HomeLayout>
                  <AssignmentResultPage />
                </HomeLayout>
              }
            />
            <Route
              path="/learn/:classroomId/:lessonId"
              element={
                <HomeLayout>
                  <LearnPlayerPage />
                </HomeLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <HomeLayout>
                  <SettingsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/dictionary"
              element={
                <HomeLayout>
                  <DictionaryPage />
                </HomeLayout>
              }
            />
            <Route
              path="/vocabulary"
              element={
                <HomeLayout>
                  <VocabularyListsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/vocabulary/lists/:listId"
              element={
                <HomeLayout>
                  <VocabularyListDetailPage />
                </HomeLayout>
              }
            />
            <Route
              path="/vocabulary/review/:listId"
              element={
                <HomeLayout>
                  <VocabularyReviewPage />
                </HomeLayout>
              }
            />
            <Route
              path="/vocabulary/review"
              element={
                <HomeLayout>
                  <VocabularyReviewPage />
                </HomeLayout>
              }
            />
            <Route
              path="/vocabulary/quick-review"
              element={
                <HomeLayout>
                  <VocabularyQuickReviewPage />
                </HomeLayout>
              }
            />
            <Route
              path="/vocabulary/my-lists"
              element={
                <HomeLayout>
                  <MyVocabularyPage />
                </HomeLayout>
              }
            />
            <Route
              path="/my-vocabulary"
              element={
                <HomeLayout>
                  <MyVocabularyPage />
                </HomeLayout>
              }
            />
            <Route
              path="/my-vocabulary/flashcard"
              element={
                <HomeLayout>
                  <FlashcardReviewPage />
                </HomeLayout>
              }
            />
            <Route
              path="/my-vocabulary/quiz"
              element={
                <HomeLayout>
                  <QuizReviewPage />
                </HomeLayout>
              }
            />
            <Route
              path="/notifications"
              element={
                <HomeLayout>
                  <NotificationsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent-home"
              element={
                <HomeLayout>
                  <ParentHomePage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent/learning-paths"
              element={
                <HomeLayout>
                  <ParentLearningPathPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent/learning-paths/:childId/:pathId"
              element={
                <HomeLayout>
                  <ParentLearningPathPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent-rewards"
              element={
                <HomeLayout>
                  <ParentRewardsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent-settings"
              element={
                <HomeLayout>
                  <ParentSettingsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent-reports"
              element={
                <HomeLayout>
                  <ParentReportsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent-activities"
              element={
                <HomeLayout>
                  <ParentActivitiesPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent-schedule"
              element={
                <HomeLayout>
                  <ParentSchedulePage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent/grades"
              element={
                <HomeLayout>
                  <ParentChildrenGradesPage />
                </HomeLayout>
              }
            />
            <Route
              path="/parent/children-grades"
              element={
                <HomeLayout>
                  <ParentChildrenGradesPage />
                </HomeLayout>
              }
            />
            <Route
              path="/listening-practice"
              element={
                <HomeLayout>
                  <ListeningPracticePage />
                </HomeLayout>
              }
            />
            <Route
              path="/listening-practice/my-history"
              element={
                <HomeLayout>
                  <MyLearningHistoryPage />
                </HomeLayout>
              }
            />
            <Route
              path="/ai-speaking"
              element={
                <HomeLayout>
                  <AiSpeakingConversationsPage />
                </HomeLayout>
              }
            />
            <Route
              path="/ai-speaking/conversations/:conversationId"
              element={
                <HomeLayout>
                  <AiSpeakingConversationDetailPage />
                </HomeLayout>
              }
            />
            <Route
              path="/ai-speaking/session"
              element={
                <HomeLayout>
                  <AiSpeakingSessionPage />
                </HomeLayout>
              }
            />
            <Route
              path="/ai-speaking/remedial/:id"
              element={
                <HomeLayout>
                  <RemedialSessionPage />
                </HomeLayout>
              }
            />
            <Route
              path="/speaking-practice"
              element={
                <HomeLayout>
                  <SpeakingPracticePage />
                </HomeLayout>
              }
            />
            <Route
              path="/speaking-practice/session"
              element={
                <HomeLayout>
                  <SpeakingPracticeSessionPage />
                </HomeLayout>
              }
            />
            <Route
              path="/listening-practice/create"
              element={
                <HomeLayout>
                  <CreatePodcastPageWizard />
                </HomeLayout>
              }
            />
            <Route
              path="/listening-practice/:id"
              element={
                <HomeLayout>
                  <PodcastDetailPage />
                </HomeLayout>
              }
            />
            <Route
              path="/listening-practice/:podcastId/test"
              element={
                <HomeLayout>
                  <PodcastPracticePage />
                </HomeLayout>
              }
            />
            <Route
              path="/listening-practice/:podcastId/test/result"
              element={
                <HomeLayout>
                  <ListeningResultPage />
                </HomeLayout>
              }
            />
            <Route path="/payment/return" element={<PaymentResultPage />} />
            <Route
              path="/payment/demo"
              element={
                <HomeLayout>
                  <PaymentDemoPage />
                </HomeLayout>
              }
            />

            {/* Certificate Routes */}
            <Route
              path="/certificates"
              element={
                <HomeLayout>
                  <MyCertificatesPage />
                </HomeLayout>
              }
            />
            <Route
              path="/transcript"
              element={
                <HomeLayout>
                  <StudentTranscriptPage />
                </HomeLayout>
              }
            />
            <Route
              path="/my-grades"
              element={
                <HomeLayout>
                  <StudentTranscriptPage />
                </HomeLayout>
              }
            />
            <Route
              path="/certificates/:id"
              element={
                <HomeLayout>
                  <CertificateDetailPage />
                </HomeLayout>
              }
            />
            <Route
              path="/learning-paths"
              element={
                <HomeLayout>
                  <LearningPathPage />
                </HomeLayout>
              }
            />
            <Route
              path="/learning-paths/:id"
              element={
                <HomeLayout>
                  <LearningPathDetailPage />
                </HomeLayout>
              }
            />
          </Route>

          {/* Public Certificate Verification - No auth required */}
          <Route
            path="/verify-certificate"
            element={
              <HomeLayout>
                <VerifyCertificatePage />
              </HomeLayout>
            }
          />

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ConversationProvider>
    </AuthProvider>
  )
}

// Wrapper component để sử dụng useParams
function ClassroomDetailWrapper() {
  const { id } = useParams<{ id: string }>()

  return <ClassroomDetail classroomId={id || '1'} onBack={() => {}} />
}

export default App
