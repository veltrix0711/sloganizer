import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-night flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-grad-heat rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-orange">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-heading mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-body mb-8">
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={this.handleRefresh}
                className="w-full btn-primary flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="text-muted cursor-pointer hover:text-heading">
                  Technical Details (Dev Mode)
                </summary>
                <div className="mt-4 p-4 bg-space rounded-lg">
                  <p className="text-red-400 text-sm font-mono">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  <pre className="text-xs text-muted mt-2 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary