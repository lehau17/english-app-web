import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { HomeLayout } from './layouts/HomeLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ClassroomDetail from './pages/ClassroomDetail'
import ClassroomPage from './pages/ClassroomPage'
import HomePage from './pages/HomePage' // Import HomePage
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public pages */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <HomeLayout>
                {' '}
                {/* Wrap HomePage with HomeLayout */}
                <HomePage />
              </HomeLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <HomeLayout>
                {' '}
                {/* Wrap HomePage with HomeLayout */}
                <ProfilePage />
              </HomeLayout>
            }
          />
          <Route
            path="/classroom"
            element={
              <HomeLayout>
                {' '}
                {/* Wrap HomePage with HomeLayout */}
                <ClassroomPage />
              </HomeLayout>
            }
          />
          <Route
            path="/classroom-detail/:id"
            element={
              <HomeLayout>
                {' '}
                {/* Wrap HomePage with HomeLayout */}
                <ClassroomDetail classroomId="1" onBack={() => {}} />
              </HomeLayout>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
