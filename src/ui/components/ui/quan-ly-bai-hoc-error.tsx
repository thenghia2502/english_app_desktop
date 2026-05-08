import { AlertTriangle, RefreshCw, ArrowLeft, Home, BookOpen } from "lucide-react"

interface QuanLyBaiHocErrorProps {
  title?: string
  message?: string
  errorDetails?: string
  onRetry?: () => void
  onGoBack?: () => void
  onGoHome?: () => void
  className?: string
}

export default function QuanLyBaiHocError({
  title = "Không thể tải dữ liệu quản lý bài học",
  message = "Đã xảy ra lỗi khi tải danh sách khóa học và bài học. Vui lòng thử lại.",
  errorDetails,
  onRetry,
  onGoBack,
  onGoHome,
  className = ""
}: QuanLyBaiHocErrorProps) {
  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center pt-18 ${className}`}>
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-lg border border-red-200 rounded-lg">
          <div className="text-center pb-4 p-6">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600 text-base">
              {message}
            </p>
          </div>
          
          <div className="pt-0 p-6">
            {/* Error Information */}
            <div className="text-center p-4 bg-red-50 rounded-lg mb-6">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-medium text-red-900 mb-2">Thông tin lỗi</h4>
              <div className="text-sm text-red-700 space-y-1">
                <p>• <strong>Danh sách khóa học:</strong> Không thể tải từ server</p>
                <p>• <strong>Bài học:</strong> Lỗi kết nối đến cơ sở dữ liệu</p>
                <p>• <strong>Tiến độ học tập:</strong> Không thể đồng bộ dữ liệu</p>
              </div>
            </div>

            {/* Error Details */}
            {errorDetails && (
              <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Chi tiết lỗi:</h4>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {errorDetails}
                </p>
              </div>
            )}

            {/* Troubleshooting Guide */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Các bước khắc phục:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Kiểm tra kết nối mạng internet</li>
                <li>2. Thử tải lại trang hoặc khởi động lại ứng dụng</li>
                <li>3. Xóa cache và cookies của trình duyệt</li>
                <li>4. Liên hệ hỗ trợ kỹ thuật nếu vẫn gặp vấn đề</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {onRetry && (
                <button 
                  onClick={onRetry}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </button>
              )}
              
              {onGoBack && (
                <button 
                  onClick={onGoBack}
                  className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại trang trước
                </button>
              )}
              
              <button 
                onClick={() => window.location.href = '/quanlygiaotrinh'}
                className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Đi đến Quản lý giáo trình
              </button>
              
              {onGoHome && (
                <button 
                  onClick={onGoHome}
                  className="w-full text-blue-600 hover:text-blue-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}