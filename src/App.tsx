import { Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { HomeLayout } from './layouts/HomeLayout'
import LoginPage from './pages/auth/LoginPage'
import ParentLoginPage from './pages/auth/ParentLoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ClassroomDetail from './pages/ClassroomDetail'
import ClassroomPage from './pages/ClassroomPage'
import CreatePodcastPageUpdated from './pages/CreatePodcastPageBeautiful'
import HomePage from './pages/HomePage' // Import HomePage
import LearnPlayerPage from './pages/LearnPage'
import ListeningPracticePage from './pages/ListeningPracticePage'
import { ListeningResultPage } from './pages/ListeningResultPage'
import NotificationsPage from './pages/NotificationsPage'
import ParentHomePage from './pages/ParentHomePage'
import PodcastDetailPage from './pages/PodcastDetailPage'
import PodcastPracticePage from './pages/PodcastPracticePage'
import ProfilePage from './pages/ProfilePage'
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
            path="/listening-practice"
            element={
              <HomeLayout>
                <ListeningPracticePage />
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
        </Route>
      </Routes>
    </AuthProvider>
  )
}

// Wrapper component để sử dụng useParams
function ClassroomDetailWrapper() {
  const { id } = useParams<{ id: string }>()

  return <ClassroomDetail classroomId={id || '1'} onBack={() => {}} />
}

export default App
