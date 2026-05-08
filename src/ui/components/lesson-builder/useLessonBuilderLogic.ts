"use client"

import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateLesson, useUpdateLessonWords } from "@/hooks"
import { LessonWord } from "@/lib/types"
// import { DesktopLessonWord } from "../../hooks/use-lessons"
import { LocalWord } from "../../lib/types"


interface UseLessonBuilderLogicProps {
    // Data
    data: { [key: string]: LocalWord[] }
    lessonWords: LessonWord[]
    courseName: string
    lessonById?: unknown
    selectedUnitsFromModal: string[]
    curriculumOriginalId: string
    description: string

    // Setters
    setLessonWords: React.Dispatch<React.SetStateAction<LessonWord[]>>
    setData: React.Dispatch<React.SetStateAction<{ [key: string]: LocalWord[] }>>
}

export function useLessonBuilderLogic({
    data,
    lessonWords: initialLessonWords,
    courseName,
    selectedUnitsFromModal,
    lessonById,
    setLessonWords,
    setData,
    curriculumOriginalId,
    description
}: UseLessonBuilderLogicProps) {
    const navigate = useNavigate()
    const { mutateAsync: createLessonMutation } = useCreateLesson()
    const { mutateAsync: updateLessonWordsMutation } = useUpdateLessonWords()

    // Get selected words count
    const getSelectedCount = useCallback(() => {
        let count = 0
        // lessonsFiltered.forEach((lesson) => {
        //     count += lesson.words.filter(w => w.selected).length
        // })
        Object.values(data).forEach((words) => {
            count += words.filter(w => w.selected).length
        })
        return count
    }, [data])

    // Transfer selected words to course builder
    const transferSelectedWords = useCallback(() => {
        // Thu thập các từ được chọn, loại trùng ngay trong batch hiện tại
        const selectedMap = new Map<string, LessonWord>()

        Object.values(data).forEach((words) => {
            words.forEach((word) => {
                if (!word.selected) return
                if (selectedMap.has(word.id)) return

                selectedMap.set(word.id, {
                    id: word.id,
                    word: word.word,
                    word_meaning: word.meaning || '',
                    word_pause_time: "2",
                    word_max_read: "6",
                    word_show_ipa: "3",
                    word_show_word: "1",
                    word_show_ipa_and_word: "2",
                    word_reads_per_round: "6",
                    word_progress: "0",
                    word_popularity: word.word_popularity || 0,
                    word_parent_id: word.word_parent_id || "",
                    uk_ipa: word.word_ipa || "",
                    us_ipa: word.word_ipa || ""
                })
            })
        })

        const uniqueSelected = Array.from(selectedMap.values())

        setLessonWords((prevWords) => {
            // Loại trùng so với danh sách đã có
            const existingIds = new Set(prevWords.map((w) => w.id))
            const additions = uniqueSelected.filter((w) => !existingIds.has(w.id))
            return [...prevWords, ...additions]
        })
    }, [data, setLessonWords])

    // Update lesson word properties
    const updateLessonWord = useCallback((wordId: string, field: keyof LessonWord | string, value: string) => {
        // Chuẩn hóa field về dạng snake_case đúng với LessonWord
        const mapField = (f: string): keyof LessonWord => {
            const directKeys: (keyof LessonWord)[] = [
                'word_max_read',
                'word_show_ipa',
                'word_show_word',
                'word_show_ipa_and_word',
                'word_reads_per_round',
                'word_pause_time',
                'word_progress'
            ]
            if (directKeys.includes(f as keyof LessonWord)) return f as keyof LessonWord
            switch (f) {
                case 'maxReads': return 'word_max_read'
                case 'showIpa': return 'word_show_ipa'
                case 'showWord': return 'word_show_word'
                case 'showIpaAndWord': return 'word_show_ipa_and_word'
                case 'readsPerRound': return 'word_reads_per_round'
                case 'pauseTime': return 'word_pause_time'
                default: return f as keyof LessonWord
            }
        }
        const canonical = mapField(String(field))

        setLessonWords((prev) =>
            prev.map((w) => (w.id === wordId ? { ...w, [canonical]: value } as LessonWord : w))
        )
    }, [setLessonWords])

    // Update max reads and calculate related values
    const updateMaxReadsLessonWord = useCallback((wordId: string, value: string) => {
        const maxReads = Math.max(0, Number(value) || 0)
        const showIpa = Math.floor(maxReads * 0.6)
        const showWord = Math.floor(maxReads * 0.3)
        const showIpaAndWord = Math.max(0, maxReads - showIpa - showWord)
        const readsPerRound = Math.min(maxReads || 0, 6)

        setLessonWords((prev) =>
            prev.map((w) =>
                w.id === wordId
                    ? {
                        ...w,
                        word_max_read: String(maxReads),
                        word_show_ipa: String(showIpa),
                        word_show_word: String(showWord),
                        word_show_ipa_and_word: String(showIpaAndWord),
                        word_reads_per_round: String(readsPerRound)
                    }
                    : w
            )
        )
    }, [setLessonWords])

    // Remove word from lesson
    const removeLessonWord = useCallback((wordId: string) => {
        // Remove from lesson words
        setLessonWords((prevWords) => prevWords.filter((word) => word.id !== wordId))

        // Unselect from data
        setData((prevData) => {
            const newData: typeof prevData = {}
            for (const key in prevData) {
                newData[key] = prevData[key].map((word) =>
                    word.id === wordId ? { ...word, selected: false } : word
                )
            }
            return newData
        })
    }, [setLessonWords, setData])

    // Calculate estimated time in seconds
    const calculateEstimatedTime = useCallback((words: LessonWord[]) => {
        let totalSeconds = 0

        words.forEach((word) => {
            const readCount = Number.parseInt(word.word_max_read) || 0
            if (readCount > 0) {
                const readingTime = readCount * 2
                totalSeconds += readingTime
            }
        })

        return totalSeconds
    }, [])

    // Format time for display
    const formatEstimatedTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60

        if (minutes > 0) {
            return `${minutes}p ${secs}s`
        } else {
            return `${secs}s`
        }
    }, [])

    // Create new lesson
    const handleCreateLesson = useCallback(async () => {
        const name = courseName.trim()
        if (!name) {
            alert('Vui lòng nhập tên bài học')
            return
        }
        if (!curriculumOriginalId) {
            alert('Vui lòng chọn giáo trình')
            return
        }
        if (initialLessonWords.length === 0) {
            alert('Vui lòng chọn ít nhất một từ vựng')
            return
        }

        const wordsPayload = initialLessonWords.map((word) => ({
            word_id: word.id,
            word_max_read: Number(word.word_max_read) || 0,
            word_show_ipa: Number(word.word_show_ipa) || 0,
            word_show_word: Number(word.word_show_word) || 0,
            word_show_ipa_and_word: Number(word.word_show_ipa_and_word) || 0,
            word_reads_per_round: Number(word.word_reads_per_round) || 0,
            word_pause_time: Number(word.word_pause_time) || 0,
        }))

        const newLesson = {
            name,
            unit_ids: selectedUnitsFromModal,
            words: wordsPayload,
            curriculum_original_id: curriculumOriginalId,
            description: description.trim(),
            duration: calculateEstimatedTime(initialLessonWords)
        }

        // console.log('📤 Creating lesson with payload:', newLesson)
        // console.log('📝 Description value:', description, '| Trimmed:', description.trim())

        try {
            await createLessonMutation(newLesson)
            navigate('/dashboard')
        } catch (err) {
            console.error('Failed to create course locally', err)
            const message = err instanceof Error ? err.message : String(err)
            alert(`Failed to create lesson: ${message}`)
        }
    }, [courseName, initialLessonWords, selectedUnitsFromModal, curriculumOriginalId, description, createLessonMutation, navigate])

    // Update existing lesson
    const handleUpdateLesson = useCallback(async () => {
        if (!courseName.trim()) {
            alert('Vui lòng nhập tên bài học')
            return
        }

        if (initialLessonWords.length === 0) {
            alert('Vui lòng chọn ít nhất một từ vựng')
            return
        }

        if (!lessonById) {
            alert('Không tìm thấy thông tin bài học')
            return
        }

        try {
            const lbRecord = (lessonById as unknown as Record<string, unknown>)
            const lessonId = (lbRecord['lesson_id'] as string) ?? (lbRecord['id'] as string)
            const wordsPayload = initialLessonWords.map((word) => ({
                word_id: word.id,
                word_progress: word.word_progress,
                word_max_read: word.word_max_read,
                word_show_ipa: word.word_show_ipa,
                word_show_word: word.word_show_word,
                word_show_ipa_and_word: word.word_show_ipa_and_word,
                word_reads_per_round: word.word_reads_per_round,
                word_pause_time: word.word_pause_time,
            }))
            const payload = {
                lessonId,
                words: wordsPayload
            }

            console.log('📤 Updating lesson with payload:', payload)
            await updateLessonWordsMutation(payload)
            navigate('/dashboard')
        } catch (error) {
            console.error('❌ Failed to update lesson:', error)
            alert('Failed to update lesson. Please try again.')
        }
    }, [courseName, lessonById, initialLessonWords, updateLessonWordsMutation, navigate, description])
    return {
        getSelectedCount,
        transferSelectedWords,
        updateLessonWord,
        updateMaxReadsLessonWord,
        removeLessonWord,
        calculateEstimatedTime,
        formatEstimatedTime,
        handleCreateLesson,
        handleUpdateLesson
    }
}