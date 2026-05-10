import React from 'react'
import TaoBaiHocError from './tao-bai-hoc-error'
import HomeError from './home-error'
import QuanLyBaiHocError from './quan-ly-bai-hoc-error'

type ErrorType =
  | 'NO_LESSON_SELECTED'
  | 'NO_COURSE_SELECTED'
  | 'NO_DATA_FOUND'
  | 'GENERAL_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'

type PageType =
  | 'tao-bai-hoc'
  | 'quan-ly-bai-hoc'
  | 'quan-ly-giao-trinh'
  | 'tao-danh-sach-bai-hoc'
  | 'tao-danh-sach-tu'
  | 'home'
  | 'vocab-trainer'

interface ErrorHandlerProps {
  type: ErrorType
  pageType?: PageType
  title?: string
  message?: string
  errorDetails?: string
  onRetry?: () => void
  onGoBack?: () => void
  onGoHome?: () => void
  onGoToSettings?: () => void
  onActionButton?: () => void
  labelActionButton?: string
  className?: string
}

export default function ErrorHandler({
  type,
  pageType = 'tao-bai-hoc', // Default fallback
  title,
  message,
  errorDetails,
  onRetry,
  onGoBack,
  onGoHome,
  onGoToSettings,
  onActionButton,
  labelActionButton,
  className = ""
}: ErrorHandlerProps) {

  // ✅ NO_LESSON_SELECTED - Generic cho nhiều trang
  if (type === 'NO_LESSON_SELECTED') {
    const defaultMessages = {
      'tao-bai-hoc': {
        title: "Chưa chọn danh sách bài học",
        message: "Bạn cần chọn một danh sách bài học trước khi tạo bài học mới",
        guide: "Hãy vào trang quản lý giáo trình để chọn giáo trình tùy chỉnh mà bạn muốn tạo bài học từ đó",
        buttonText: "Đi đến Quản lý giáo trình"
      },
      'quan-ly-bai-hoc': {
        title: "Chưa chọn khóa học",
        message: "Bạn cần chọn một khóa học để quản lý các bài học",
        guide: "Hãy vào trang quản lý khóa học để chọn khóa học mà bạn muốn quản lý",
        buttonText: "Đi đến Quản lý khóa học"
      },
      'vocab-trainer': {
        title: "Chưa chọn khóa học",
        message: "Bạn cần chọn một khóa học để bắt đầu luyện tập từ vựng",
        guide: "Hãy vào trang quản lý bài học để chọn khóa học mà bạn muốn luyện tập",
        buttonText: "Đi đến Quản lý bài học"
      },
      'tao-danh-sach-bai-hoc': {
        title: "Chưa chọn giáo trình",
        message: "Bạn cần chọn một giáo trình để tạo danh sách bài học",
        guide: "Hãy vào trang quản lý giáo trình để chọn giáo trình mà bạn muốn tạo danh sách bài học từ đó",
        buttonText: "Đi đến Quản lý giáo trình"
      },
      'tao-danh-sach-tu': {
        title: "Chưa có dữ liệu từ vựng",
        message: "Bạn cần có từ vựng để tạo danh sách từ",
        guide: "Hãy kiểm tra kết nối mạng hoặc liên hệ quản trị viên để tải dữ liệu từ vựng",
        buttonText: "Tải lại dữ liệu"
      },
      'home': {
        title: "Dữ liệu không khả dụng",
        message: "Không thể tải dữ liệu trang chủ",
        guide: "Hãy kiểm tra kết nối mạng và thử lại",
        buttonText: "Tải lại trang"
      }
    }

    const config = defaultMessages[pageType as keyof typeof defaultMessages] || defaultMessages['tao-bai-hoc']

    return (
      <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-4 ${className}`}>
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg border border-blue-200 rounded-lg">
            <div className="text-center pb-4 p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <div className="text-4xl">📚</div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {title || config.title}
              </h2>
              <p className="text-gray-600 text-base">
                {message || config.message}
              </p>
            </div>

            <div className="pt-0 p-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg mb-6">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium text-blue-900 mb-1">Hướng dẫn</h4>
                <p className="text-sm text-blue-700">
                  {config.guide}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {onActionButton && (
                  <button
                    onClick={onActionButton}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {labelActionButton || "Thực hiện hành động"}
                  </button>
                )}
                {onGoBack && (
                  <button
                    onClick={onGoBack}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Quay lại
                  </button>
                )}
                {onGoHome && (
                  <button
                    onClick={onGoHome}
                    className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
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

  // ✅ NO_DATA_FOUND - Generic empty state
  if (type === 'NO_DATA_FOUND') {
    return (
      <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-4 ${className}`}>

        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {title || "Không có dữ liệu"}
              </h2>
              <p className="text-gray-600 text-base mb-6">
                {message || "Chưa có dữ liệu để hiển thị"}
              </p>

              {(onRetry || onGoBack || onGoHome) && (
                <div className="flex flex-col gap-3">
                  {/* {onRetry && (
                    <button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                      Tải lại
                    </button>
                  )} */}
                  {onActionButton && (
                    <button onClick={onActionButton} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                      {labelActionButton || "Thực hiện hành động"}
                    </button>
                  )}
                  {onGoBack && (
                    <button onClick={onGoBack} className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg">
                      Quay lại
                    </button>
                  )}
                  {onGoHome && (
                    <button onClick={onGoHome} className="text-blue-600 hover:text-blue-700">
                      Về trang chủ
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ GENERAL_ERROR - Routing to specific error components
  if (type === 'GENERAL_ERROR' || type === 'API_ERROR' || type === 'NETWORK_ERROR') {
    switch (pageType) {
      case 'home':
        return (
          <HomeError
            title={title}
            message={message}
            errorDetails={errorDetails}
            onRetry={onRetry}
            onGoToSettings={onGoToSettings}
          />
        )
      case 'quan-ly-bai-hoc':
        return (
          <QuanLyBaiHocError
            title={title}
            message={message}
            errorDetails={errorDetails}
            onRetry={onRetry}
            onGoBack={onGoBack}
            onGoHome={onGoHome}
          />
        )
      case 'tao-danh-sach-bai-hoc':
      case 'tao-danh-sach-tu':
      case 'quan-ly-giao-trinh':
      case 'tao-bai-hoc':
      default:
        return (
          <TaoBaiHocError
            title={title}
            message={message}
            errorDetails={errorDetails}
            onRetry={onRetry}
            onGoBack={onGoBack}
            onGoHome={onGoHome}
          />
        )
    }
  }

  return null
}