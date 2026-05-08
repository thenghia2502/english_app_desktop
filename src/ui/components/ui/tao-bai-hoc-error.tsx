import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface TaoBaiHocErrorProps {
  title?: string
  message?: string
  errorDetails?: string
  onRetry?: () => void
  onGoBack?: () => void
  onGoHome?: () => void
  className?: string
}

export function TaoBaiHocError({ 
  title = "Không thể tải dữ liệu bài học", 
  message = "Đã xảy ra lỗi khi tải danh sách từ vựng và bài học", 
  errorDetails,
  onRetry,
  onGoBack,
  onGoHome,
  className = ""
}: TaoBaiHocErrorProps) {
  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-2xl">
        <Card className="bg-white shadow-lg border border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </CardTitle>
            <p className="text-gray-600 text-base">
              {message}
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {errorDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 mb-2">Chi tiết lỗi:</h4>
                <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                  {errorDetails}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-medium text-gray-900 mb-1">Dữ liệu bài học</h4>
                <p className="text-sm text-gray-600">Không thể tải danh sách từ vựng</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-medium text-gray-900 mb-1">Kết nối API</h4>
                <p className="text-sm text-gray-600">Lỗi kết nối đến server</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-2">💡 Các bước khắc phục:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Kiểm tra kết nối internet của bạn</li>
                  <li>Thử tải lại trang bằng nút &quot;Thử lại&quot; bên dưới</li>
                  <li>Nếu vẫn lỗi, hãy liên hệ với quản trị viên</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {onRetry && (
                <Button 
                  onClick={onRetry} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
              )}
              
              {onGoBack && (
                <Button 
                  onClick={onGoBack} 
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              )}
              
              {onGoHome && (
                <Button 
                  onClick={onGoHome} 
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Trang chủ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TaoBaiHocError
