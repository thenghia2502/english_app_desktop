import React from 'react'

interface LoadingProps {
  message?: string
  className?: string
  variant?: 'default' | 'minimal' | 'full-page'
}

export function Loading({ 
  message = "Đang tải...", 
  className = "", 
  variant = 'default'
}: LoadingProps) {
  
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className} `}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
        {message && <span className="ml-3 text-gray-600">{message}</span>}
      </div>
    )
  }

  if (variant === 'full-page') {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className} `}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center justify-center ${className} `}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default Loading
