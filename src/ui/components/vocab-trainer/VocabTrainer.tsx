"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import ErrorHandler from "@/components/ui/error-handler"
import { useLessonById, useUpdateLesson } from "@/hooks"
import { LessonWord } from '@/lib/types'
import Loading from "@/components/ui/loading"

// Components
import TopNavigation from "@/components/vocab-trainer/TopNavigation"
import TrainerControls from "@/components/vocab-trainer/TrainerControls"
import AudioControls from "@/components/vocab-trainer/AudioControls"
import ProgressBadge from "@/components/vocab-trainer/ProgressBadge"
import VocabDisplay from "@/components/vocab-trainer/VocabDisplay"
import VocabTable from "@/components/vocab-trainer/VocabTable"
import { useAudioManager } from "@/components/vocab-trainer/useAudioManager"

// Audio data imports
import { useGetUrlAudio } from "@/hooks/use-audios"


const mapLessonWordToTrainerWord = (word: any): LessonWord => ({
    id: String(word.id ?? ''),
    word: String(word.word ?? ''),
    uk_ipa: String(word.uk_ipa ?? ''),
    us_ipa: String(word.us_ipa ?? ''),
    word_meaning: String(word.word_meaning ?? ''),
    audioUrl: '',
    word_max_read: String(word.word_max_read ?? '3'),
    word_show_ipa: String(word.word_show_ipa ?? '1'),
    word_show_word: String(word.word_show_word ?? '1'),
    word_show_ipa_and_word: String(word.word_show_ipa_and_word ?? '1'),
    word_progress: String(word.word_progress ?? '0'),
    word_reads_per_round: String(word.word_reads_per_round ?? '1'),
    word_pause_time: String(word.word_pause_time ?? '1.5'),
    word_parent_id: String(word.word_parent_id ?? ''),
    word_popularity: Number(word.word_popularity ?? 0),
    example: word.example ? String(word.example) : undefined,
})

export default function VocabTrainer() {
    const [searchParams] = useSearchParams()
    const lessonId = searchParams.get("lessonId") || ""

    const {
        data: selectedLesson,
        isLoading: lessonLoading,
        error: lessonError,
        refetch: refetchLesson
    } = useLessonById(lessonId)

    const updateLessonMutation = useUpdateLesson()
    const getAudioUrl = useGetUrlAudio()

    const [vocabularyData, setVocabularyData] = useState<LessonWord[]>([])
    const [isTransformingData, setIsTransformingData] = useState(false)
    const [transformError, setTransformError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioError, setAudioError] = useState(false)
    const [isLooping, setIsLooping] = useState(false)
    const [dialect, setDialect] = useState("us")
    const [isDialectChanging, setIsDialectChanging] = useState(false)
    const [checked, setChecked] = useState(true)
    const [isUpdatingLesson, setIsUpdatingLesson] = useState(false)
    const [hasInitialData, setHasInitialData] = useState(false)
    const [disableSkeleton, setDisableSkeleton] = useState(false)

    const lastShownWordRef = useRef<LessonWord | null>(null)
    const updatingLessonRef = useRef(false)
    const vocabularyDataRef = useRef<LessonWord[]>([])

    useEffect(() => {
        vocabularyDataRef.current = vocabularyData
    }, [vocabularyData])

    useEffect(() => {
        if (vocabularyData.length > 0 && !hasInitialData) {
            setHasInitialData(true)
            setDisableSkeleton(true)
        }
    }, [vocabularyData.length, hasInitialData])

    const isPageLoading = !disableSkeleton &&
        !hasInitialData &&
        vocabularyData.length === 0 &&
        (lessonLoading || isTransformingData) &&
        !updatingLessonRef.current &&
        !isUpdatingLesson

    const error = lessonError?.message || transformError
    const currentWord = vocabularyData[currentIndex] || null

    const onDoneCourse = useCallback(async () => {
        const latestWords = vocabularyDataRef.current
        if (!selectedLesson || latestWords.length === 0) return

        try {
            const wordsPayload = latestWords.map((w) => ({
                word_id: w.id,
                word_progress: Number(w.word_progress) || 0,
                // Backend `update_lesson_progress` expects i32 for pause time.
                // Ensure we send an integer to avoid command deserialization failure.
                word_pause_time: Math.max(0, Math.round(Number(w.word_pause_time) || 1.5)),
            }))

            const unit_ids = selectedLesson.units ? selectedLesson.units.map(unit => unit.id) : []

            updatingLessonRef.current = true
            setIsUpdatingLesson(true)

            await updateLessonMutation.mutateAsync({
                lessonId: selectedLesson.id,
                name: selectedLesson.name,
                order: selectedLesson.order || 1,
                unitIds: unit_ids,
                words: wordsPayload,
            })
        } catch (updateError) {
            console.error("Loi khi cap nhat lesson:", updateError)
        } finally {
            updatingLessonRef.current = false
            setIsUpdatingLesson(false)
        }
    }, [selectedLesson, updateLessonMutation])

    const audioManager = useAudioManager({
        vocabularyData,
        currentIndex,
        dialect,
        isLooping,
        getAudioUrl,
        setIsPlaying,
        setIsLooping,
        setAudioError,
        setCurrentIndex,
        setVocabularyData,
        onDoneCourse
    })

    useEffect(() => {
        console.debug('[vocab] isLooping changed ->', isLooping)
    }, [isLooping])

    useEffect(() => {
        if (!selectedLesson || !Array.isArray(selectedLesson.words)) {
            if (!updatingLessonRef.current) {
                setVocabularyData([])
                setIsTransformingData(false)
            }
            return
        }

        if (selectedLesson.words.length === 0 && updatingLessonRef.current) {
            return
        }

        if (updatingLessonRef.current) {
            return
        }

        const transformCourseData = async () => {
            setIsTransformingData(true)
            setTransformError(null)

            try {
                const transformedData = selectedLesson.words.map(mapLessonWordToTrainerWord)

                setVocabularyData(transformedData)
                setCurrentIndex(0)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Khong the tai du lieu tu vung'
                setTransformError(errorMessage)
                setVocabularyData([])
            } finally {
                setIsTransformingData(false)
            }
        }

        void transformCourseData()
    }, [selectedLesson])

    useEffect(() => {
        if (!currentWord) {
            setIsDialectChanging(false)
            return
        }

        let cancelled = false
        // If we already cached an audio URL for this dialect, skip fetching
        if ((currentWord as any).audioUrl && (currentWord as any).audioDialect === dialect) {
            setIsDialectChanging(false)
            return
        }

        setIsDialectChanging(true)

        void getAudioUrl(currentWord.word, dialect)
            .catch((error) => {
                if (!cancelled) {
                    console.error("Loi khi doi accent:", error)
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsDialectChanging(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [currentWord, dialect, getAudioUrl])

    useEffect(() => {
        if (vocabularyData.length === 0) return

        if (currentIndex >= vocabularyData.length) {
            setCurrentIndex(vocabularyData.length - 1)
        }

        if (currentIndex < 0) {
            setCurrentIndex(0)
        }
    }, [vocabularyData, currentIndex])

    useEffect(() => {
        if (currentWord) {
            lastShownWordRef.current = currentWord
        }
    }, [currentWord])

    const updateCourseWord = (wordId: string, field: keyof LessonWord, value: string) => {
        setVocabularyData((prevWords) => {
            return prevWords.map((word) => (word.id === wordId ? { ...word, [field]: value } : word))
        })
    }

    const handleWordClick = (index: number) => {
        setCurrentIndex(index)
    }

    const handleRestart = useCallback(() => {
        setVocabularyData((prev) => prev.map((word) => ({ ...word, word_progress: '0' })))
        setCurrentIndex(0)
        setIsPlaying(false)
        setIsLooping(false)

        setTimeout(() => {
            void audioManager.handleAudioToggle()
        }, 100)
    }, [audioManager])

    const openOxford = (text: string) => {
        const url = `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(text)}`
        window.open(url, "_blank")
    }

    const onImages = (text: string) => {
        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(text)}`
        window.open(url, "_blank")
    }

    if (!lessonId) {
        return (
            <ErrorHandler
                type="NO_LESSON_SELECTED"
                pageType="vocab-trainer"
                title="Chưa chọn bài học"
                message="Bạn cần chọn một khóa học để bắt đầu luyện tập từ vựng"
                onGoBack={() => window.history.back()}
                onGoHome={() => window.location.href = '/'}
            />
        )
    }

    if (error) {
        return (
            <ErrorHandler
                type="GENERAL_ERROR"
                pageType="vocab-trainer"
                title="Không thể tải dữ liệu khóa học"
                message="Đã xảy ra lỗi khi tải khóa học và từ vựng. Vui lòng thử lại."
                errorDetails={error}
                onRetry={() => refetchLesson()}
                onGoBack={() => window.history.back()}
                onGoHome={() => window.location.href = '/'}
            />
        )
    }

    if (isPageLoading) {
        return (
            <Loading
                message="Đang tải dữ liệu từ vựng..."
                variant="full-page"
            />
        )
    }

    if (!isPageLoading && selectedLesson && vocabularyData.length === 0) {
        return (
            <ErrorHandler
                type="NO_DATA_FOUND"
                pageType="vocab-trainer"
                title="Không có từ vựng trong khóa học"
                message="Khóa học này chưa có từ vựng nào. Vui lòng thêm từ vựng hoặc chọn khóa học khác."
                onRetry={() => refetchLesson()}
                onGoBack={() => window.history.back()}
                onGoHome={() => window.location.href = '/'}
            />
        )
    }

    if (!isPageLoading && lessonId && !selectedLesson && !error) {
        return (
            <ErrorHandler
                type="NO_DATA_FOUND"
                pageType="vocab-trainer"
                title="Không tìm thấy bài học"
                message={`Bài học với ID "${lessonId}" không tồn tại hoặc đã bị xóa.`}
                onRetry={() => refetchLesson()}
                onGoBack={() => window.history.back()}
                onGoHome={() => window.location.href = '/'}
            />
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <TopNavigation lessonName={selectedLesson?.name} />

            <main className="mx-auto min-h-208 px-4 py-8 sm:px-6 lg:pb-8 lg:pt-16 flex flex-col space-y-5">
                <div className="my-3 flex justify-between">
                    <TrainerControls
                        checked={checked}
                        setChecked={setChecked}
                        dialect={dialect}
                        setDialect={setDialect}
                        isLooping={isLooping}
                        isPlaying={isPlaying}
                    />

                    <div className="shrink-0">
                        <AudioControls
                            isLooping={isLooping}
                            isPageLoading={isPageLoading}
                            isDialectChanging={isDialectChanging}
                            audioError={audioError}
                            vocabularyData={vocabularyData}
                            onAudioToggle={audioManager.handleAudioToggle}
                            onRetryAudio={audioManager.handleRetryAudio}
                            onRestart={handleRestart}
                        />
                    </div>
                </div>

                <Card className="border-none shadow-lg bg-white relative">
                    <ProgressBadge
                        currentWord={currentWord}
                        lastShownWord={lastShownWordRef.current}
                    />

                    <CardContent className="p-6 h-fit">
                        <div className="mb-6 flex items-center justify-between bg-gray-50 rounded-lg p-4 h-120 relative">
                            <div className="w-full mx-4 md:mx-8 flex justify-center items-center">
                                <VocabDisplay
                                    currentWord={currentWord}
                                    ipa={currentWord ? (dialect === 'uk' ? currentWord.uk_ipa : currentWord.us_ipa) : ''}
                                />
                            </div>
                            {currentWord && (
                                <div className="absolute top-[97%] right-2">
                                    <div
                                        className="text-gray-500 transition-transform hover:-translate-y-0.5 hover:cursor-pointer italic hover:text-blue-500"
                                        onClick={() => openOxford(currentWord.word)}
                                        title="go to oxford dictionary"
                                    >
                                        oxford
                                    </div>
                                    <div
                                        className="text-gray-500 transition-transform hover:-translate-y-0.5 hover:cursor-pointer italic hover:text-blue-500"
                                        onClick={() => onImages(currentWord.word)}
                                        title="go to google images"
                                    >
                                        Images
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {checked && (
                    <VocabTable
                        vocabularyData={vocabularyData}
                        currentIndex={currentIndex}
                        isLooping={isLooping}
                        isPlaying={isPlaying}
                        onWordClick={handleWordClick}
                        onUpdateWord={updateCourseWord}
                    />
                )}
            </main>
        </div>
    )
}