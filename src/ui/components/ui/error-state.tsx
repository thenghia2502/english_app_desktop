import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'minimal'
}

export function ErrorState({ 
  title = "Có lỗi xảy ra", 
  message = "Vui lòng thử lại sau", 
  onRetry,
  className = "",
  variant = 'default'
}: ErrorStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <p className="text-red-600 text-sm">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            Thử lại
          </Button>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Thử lại
          </Button>
        )}
      </div>
    </div>
  )
}

export default ErrorState
