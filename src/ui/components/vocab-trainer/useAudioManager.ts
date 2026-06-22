"use client"

import { useCallback, useRef, useEffect } from "react"
import { LessonWord } from '@/lib/types'

interface UseAudioManagerProps {
    vocabularyData: LessonWord[]
    currentIndex: number
    dialect: string
    isLooping: boolean
    getAudioUrl: (word: string, dialect: string) => Promise<string>
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
    setIsLooping: React.Dispatch<React.SetStateAction<boolean>>
    setAudioError: React.Dispatch<React.SetStateAction<boolean>>
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
    setVocabularyData: React.Dispatch<React.SetStateAction<LessonWord[]>>
    onDoneCourse: () => Promise<void>
}

export function useAudioManager({
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
}: UseAudioManagerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const isForceStopRef = useRef(true)
    const playingIndexRef = useRef<number | null>(null)
    const playCurrentWordRef = useRef<((index?: number, knownProgress?: number) => Promise<void>) | null>(null)
    const readsInCurrentRoundRef = useRef(0)

    const ensureAudioElement = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
        }

        return audioRef.current
    }, [])

    useEffect(() => {
        const audio = ensureAudioElement()
        const handleEnded = () => {
            setIsPlaying(false)
        }
        const handleError = () => {
            setIsPlaying(false)
            setAudioError(true)
        }

        audio.addEventListener("ended", handleEnded)
        audio.addEventListener("error", handleError)

        return () => {
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("error", handleError)

            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
                audioRef.current = null
            }
        }
    }, [ensureAudioElement, setIsPlaying, setAudioError])

    const delay = useCallback((ms: number) => new Promise((res) => setTimeout(res, ms)), [])

    const updateProgress = useCallback((index: number) => {
        let newProgress = 0

        setVocabularyData((prev) => {
            const updated = [...prev]
            const current = updated[index]
            if (!current) {
                return prev
            }

            const realProgress = Number(current.word_progress)
            const maxReads = Number(current.word_max_read)

            if (realProgress >= maxReads) {
                newProgress = realProgress
                return prev
            }

            newProgress = realProgress + 1
            updated[index] = {
                ...current,
                word_progress: newProgress.toString(),
            }

            return updated
        })

        return Promise.resolve(newProgress)
    }, [setVocabularyData])

    const findNextWordToPlay = useCallback(() => {
        const totalWords = vocabularyData.length
        if (totalWords === 0) return

        const nextIndex = currentIndex + 1

        for (let i = nextIndex; i < totalWords; i++) {
            const word = vocabularyData[i]
            if (Number(word.word_progress) < Number(word.word_max_read)) {
                setCurrentIndex(i)
                if (playingIndexRef.current === null) {
                    playCurrentWordRef.current?.(i)
                }
                return
            }
        }

        for (let i = 0; i < currentIndex; i++) {
            const word = vocabularyData[i]
            if (Number(word.word_progress) < Number(word.word_max_read)) {
                setCurrentIndex(i)
                if (playingIndexRef.current === null) {
                    playCurrentWordRef.current?.(i)
                }
                return
            }
        }

        const current = vocabularyData[currentIndex]
        if (!current) {
            if (vocabularyData.length > 0) {
                setCurrentIndex(vocabularyData.length - 1)
            }
            setIsLooping(false)
            setIsPlaying(false)
            isForceStopRef.current = true
            void onDoneCourse()
            return
        }

        if (Number(current.word_progress) >= Number(current.word_max_read)) {
            if (vocabularyData.length > 0) {
                setCurrentIndex(Math.min(currentIndex, vocabularyData.length - 1))
            }
            setIsLooping(false)
            setIsPlaying(false)
            isForceStopRef.current = true
            void onDoneCourse()
        } else {
            playCurrentWordRef.current?.(currentIndex)
        }
    }, [
        vocabularyData,
        currentIndex,
        setCurrentIndex,
        setIsLooping,
        setIsPlaying,
        onDoneCourse
    ])

    const onWordEnded = useCallback(async (indexParam?: number, updatedProgress?: number) => {
        const idx = typeof indexParam === 'number' ? indexParam : currentIndex
        const word = vocabularyData[idx]
        if (!word) return

        const readsPerRound = Number(word.word_reads_per_round)
        const currentReadsInRound = readsInCurrentRoundRef.current + 1

        if (currentReadsInRound >= readsPerRound) {
            readsInCurrentRoundRef.current = 0
            findNextWordToPlay()
            return
        }

        readsInCurrentRoundRef.current = currentReadsInRound

        const maxReads = Number(word.word_max_read)
        const progress = typeof updatedProgress === 'number'
            ? updatedProgress
            : Number(word.word_progress || 0)

        if (progress < maxReads && !isForceStopRef.current) {
            playCurrentWordRef.current?.(idx, progress)
        } else {
            if (!isForceStopRef.current) {
                findNextWordToPlay()
            }
        }
    }, [
        vocabularyData,
        currentIndex,
        findNextWordToPlay
    ])

    const playCurrentWord = useCallback(
        async (indexToPlay: number = currentIndex, knownProgress?: number) => {
            const audio = ensureAudioElement()
            const wordToPlay = vocabularyData[indexToPlay]
            if (!audio || !wordToPlay || isForceStopRef.current) return

            if (playingIndexRef.current !== null) {
                return
            }

            playingIndexRef.current = indexToPlay

            const progress = typeof knownProgress === 'number' ? knownProgress : Number(wordToPlay.word_progress)
            const maxReads = Number(wordToPlay.word_max_read)

            if (progress === maxReads) {
                await onWordEnded(indexToPlay, progress)
                playingIndexRef.current = null
                return
            }

            setAudioError(false)

            // No Web Speech API fast path: use resolved audio URLs only.

            try {
                // Use cached audioUrl if it matches current dialect
                if (wordToPlay.audioUrl && (wordToPlay as any).audioDialect === dialect) {
                    audio.src = wordToPlay.audioUrl
                } else {
                    const audioUrl = await getAudioUrl(wordToPlay.word, dialect)
                    audio.src = audioUrl

                    // cache the fetched url and dialect on the word to avoid refetching
                    setVocabularyData(prev => {
                        const updated = [...prev]
                        const w = updated[indexToPlay]
                        if (w) {
                            (w as any).audioUrl = audioUrl
                                ; (w as any).audioDialect = dialect
                            updated[indexToPlay] = { ...w }
                        }
                        return updated
                    })
                }
            } catch (error) {
                console.error('Error fetching audio URL:', error)

                if (wordToPlay.audioUrl) {
                    audio.src = wordToPlay.audioUrl
                } else {
                    setAudioError(true)
                    setIsLooping(false)
                    setIsPlaying(false)
                    playingIndexRef.current = null
                    return
                }
            }

            audio.currentTime = 0

            audio.onerror = () => {
                setAudioError(true)
                setIsLooping(false)
                setIsPlaying(false)
                playingIndexRef.current = null
            }

            audio.onended = async () => {
                if (isForceStopRef.current) {
                    playingIndexRef.current = null
                    return
                }

                setIsPlaying(false)

                // Determine whether there will be a next word to play after
                // incrementing this word's progress. If not, skip the pause
                // so the UI transitions to the completed state faster.
                const currentProgress = Number(wordToPlay.word_progress || 0)
                const maxReads = Number(wordToPlay.word_max_read)
                const willHaveNext = (() => {
                    const simulatedProgress = currentProgress + 1
                    if (simulatedProgress < maxReads) return true

                    for (let i = 0; i < vocabularyData.length; i++) {
                        if (i === indexToPlay) continue
                        if (Number(vocabularyData[i].word_progress) < Number(vocabularyData[i].word_max_read)) {
                            return true
                        }
                    }

                    return false
                })()

                const pauseMs = (Number(wordToPlay.word_pause_time) || 3) * 1000
                if (willHaveNext && pauseMs > 0) {
                    await delay(pauseMs)
                    if (isForceStopRef.current) {
                        playingIndexRef.current = null
                        return
                    }
                }

                const newProgress = await updateProgress(indexToPlay)
                await onWordEnded(indexToPlay, newProgress)
                playingIndexRef.current = null
            }

            try {
                await audio.play()
                if (isForceStopRef.current) {
                    audio.pause()
                    playingIndexRef.current = null
                    return
                }

                setIsPlaying(true)
            } catch (playError) {
                console.error('Error playing audio:', playError)
                setAudioError(true)
                setIsLooping(false)
                setIsPlaying(false)
                playingIndexRef.current = null
            }
        },
        [
            currentIndex,
            vocabularyData,
            dialect,
            getAudioUrl,
            delay,
            setAudioError,
            setIsPlaying,
            setIsLooping,
            updateProgress,
            onWordEnded,
            ensureAudioElement
        ]
    )

    const handleAudioToggle = useCallback(async () => {
        const audio = ensureAudioElement()
        console.debug('[audio] handleAudioToggle called - isLooping=', isLooping)

        if (isLooping) {
            console.debug('[audio] stopping loop')
            setIsLooping(false)
            setIsPlaying(false)
            isForceStopRef.current = true

            audio.pause()
            audio.currentTime = 0
            playingIndexRef.current = null

            await onDoneCourse()
            return
        }

        const isCompleted = vocabularyData.every(word =>
            Number(word.word_progress || 0) >= Number(word.word_max_read || 3)
        )

        let startIndex = currentIndex

        if (isCompleted) {
            setVocabularyData(prev => prev.map(word => ({
                ...word,
                word_progress: "0"
            })))
            setCurrentIndex(0)
            readsInCurrentRoundRef.current = 0
            startIndex = 0
        }

        isForceStopRef.current = false
        console.debug('[audio] starting loop - setting isLooping=true')
        setIsLooping(true)
        playingIndexRef.current = null

        await playCurrentWord(startIndex)
    }, [
        ensureAudioElement,
        isLooping,
        vocabularyData,
        currentIndex,
        setIsLooping,
        setIsPlaying,
        setVocabularyData,
        setCurrentIndex,
        onDoneCourse,
        playCurrentWord
    ])

    const handleRetryAudio = useCallback(() => {
        setAudioError(false)
        setIsPlaying(false)
        setIsLooping(false)
        isForceStopRef.current = false
        playingIndexRef.current = null

        void handleAudioToggle()
    }, [setAudioError, setIsPlaying, setIsLooping, handleAudioToggle])

    useEffect(() => {
        playCurrentWordRef.current = playCurrentWord
    }, [playCurrentWord])

    useEffect(() => {
        if (!isLooping || isForceStopRef.current) {
            return
        }

        if (playingIndexRef.current !== null) {
            return
        }

        void playCurrentWord(currentIndex)
    }, [currentIndex, isLooping, playCurrentWord])

    return {
        playCurrentWord,
        handleAudioToggle,
        handleRetryAudio,
        updateProgress,
        onWordEnded,
        findNextWordToPlay
    }
}