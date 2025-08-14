import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-night/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-grad-surge rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-body text-lg">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-electric`} />
        {text && (
          <span className={`${textSizeClasses[size]} text-body`}>
            {text}
          </span>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner