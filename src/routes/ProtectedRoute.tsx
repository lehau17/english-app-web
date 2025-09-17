import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Redirect based on user role after authentication
  useEffect(() => {
    console.log('ProtectedRoute useEffect:', {
      isAuthenticated,
      user,
      currentPath: location.pathname,
    })

    if (isAuthenticated && user && user.role) {
      const currentPath = location.pathname

      // If user is on login page or root, redirect based on role
      if (
        currentPath === '/login' ||
        currentPath === '/parent-login' ||
        currentPath === '/'
      ) {
        console.log('Redirecting based on role:', user.role)
        if (user.role === 'parent') {
          console.log('Redirecting parent to /parent-home')
          navigate('/parent-home', { replace: true })
        } else if (user.role === 'student') {
          console.log('Redirecting student to /')
          navigate('/', { replace: true })
        } else {
          console.log('Redirecting other role to /')
          navigate('/', { replace: true })
        }
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
