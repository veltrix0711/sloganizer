import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

const SuccessPage = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // You could verify the session with Stripe here if needed
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="card">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for your subscription! Your account has been upgraded and you now have access to all Pro features.
          </p>
          
          <div className="space-y-3">
            <Link to="/dashboard" className="btn btn-brand w-full group">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/generate" className="btn btn-outline w-full">
              Generate Slogans
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Session ID: {sessionId || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage