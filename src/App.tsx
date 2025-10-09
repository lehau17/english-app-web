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
import AssignmentResultPage from './pages/AssignmentResultPage'
import AssignmentSubmissionsPage from './pages/AssignmentSubmissionsPage'
import AssignmentTakingPage from './pages/AssignmentTakingPage'
import LoginPage from './pages/auth/LoginPage'
import ParentLoginPage from './pages/auth/ParentLoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ClassroomDetail from './pages/ClassroomDetail'
import ClassroomPage from './pages/ClassroomPage'
import CreatePodcastPageUpdated from './pages/CreatePodcastPageBeautiful'
import DictionaryPage from './pages/DictionaryPage'
import HomePage from './pages/HomePage' // Import HomePage
import LearnPlayerPage from './pages/LearnPage'
import ListeningPracticePage from './pages/ListeningPracticePage'
import { ListeningResultPage } from './pages/ListeningResultPage'
import NotificationsPage from './pages/NotificationsPage'
import ParentActivitiesPage from './pages/ParentActivitiesPage'
import ParentHomePage from './pages/ParentHomePage'
import ParentReportsPage from './pages/ParentReportsPage'
import ParentRewardsPage from './pages/ParentRewardsPage'
import ParentSchedulePage from './pages/ParentSchedulePage'
import ParentSettingsPage from './pages/ParentSettingsPage'
import { PaymentDemoPage } from './pages/PaymentDemoPage'
import PlaylistsPage from './pages/PlaylistsPage'
import PodcastDetailPage from './pages/PodcastDetailPage'
import PodcastPracticePage from './pages/PodcastPracticePage'
import ProfilePage from './pages/ProfilePage'
import SchedulePage from './pages/SchedulePage'
import SettingsPage from './pages/SettingsPage'
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
              path="/learn/:classroomId/:lessonId/:activityId"
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
              path="/listening-practice"
              element={
                <HomeLayout>
                  <ListeningPracticePage />
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
              path="/listening-practice/create"
              element={
                <HomeLayout>
                  <CreatePodcastPageUpdated />
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
          </Route>
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
