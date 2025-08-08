import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. 
          It may have been moved or doesn't exist.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <Link to="/" className="btn btn-brand group">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <Link to="/generate" className="text-sm text-primary-600 hover:text-primary-700">
              Generate Slogans
            </Link>
            <Link to="/pricing" className="text-sm text-primary-600 hover:text-primary-700">
              Pricing
            </Link>
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage