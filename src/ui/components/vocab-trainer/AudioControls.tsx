"use client"

import { Button } from "@/components/ui/button"
import { LessonWord } from "@/lib/types"

interface AudioControlsProps {
    isLooping: boolean
    isPageLoading: boolean
    isDialectChanging: boolean
    audioError: boolean
    vocabularyData: Array<LessonWord>
    onAudioToggle: () => void
    onRetryAudio: () => void
    onRestart: () => void
}

export default function AudioControls({
    isLooping,
    isPageLoading,
    isDialectChanging,
    audioError,
    vocabularyData,
    onAudioToggle,
    onRetryAudio,
    onRestart
}: AudioControlsProps) {
    const hasVocabulary = vocabularyData.length > 0
    const isDisabled = isPageLoading || isDialectChanging || !hasVocabulary

    if (audioError) {
        return (
            <div className="flex flex-col items-center">
                <Button
                    onClick={onRetryAudio}
                    className="px-6 py-2 rounded-full font-medium transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white"
                >
                    Thử lại
                </Button>
                <div className="text-xs text-red-500 mt-1 text-center">
                    Không tải được file âm thanh
                </div>
            </div>
        )
    }

    const isCompleted = vocabularyData.every(word =>
        Number(word.word_progress || 0) >= Number(word.word_max_read || 3)
    )

    return (
        <div className="flex flex-col items-center">
            <Button
                type="button"
                className={`max-w-[100px] px-6 py-2 rounded-full font-medium transition-all duration-200 ${isPageLoading || isDialectChanging
                    ? "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
                    : isLooping
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-primary hover:bg-blue-500 text-white"
                    }`}
                onClick={() => {
                    if (isDisabled) {
                        return
                    }

                    if (isCompleted) {
                        onRestart()
                        return
                    }

                    onAudioToggle()
                }}
                disabled={isDisabled}
            >
                {isDialectChanging
                    ? "Đang chuyển..."
                    : isLooping
                        ? "Dừng lại"
                        : isCompleted
                            ? "Bắt đầu lại"
                            : "Bắt đầu"
                }
            </Button>
            {isDisabled && !audioError && (
                <div className="mt-1 text-xs text-gray-600">
                    {isPageLoading
                        ? "Dang tai du lieu"
                        : isDialectChanging
                            ? "Dang chuyen accent"
                            : "Khong co tu de phat"}
                </div>
            )}
        </div>
    )
}