import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-600 mt-2">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  )
}

export default NotFoundPage
