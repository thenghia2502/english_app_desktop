"use client"

import { LessonWord } from '@/lib/types'

export interface AudioManager {
    playCurrentWord: (indexToPlay?: number, knownProgress?: number) => Promise<void>
    handleAudioToggle: () => Promise<void>
    handleRetryAudio: () => void
    updateProgress: (index: number) => Promise<number>
    onWordEnded: (indexParam?: number, updatedProgress?: number) => Promise<void>
    findNextWordToPlay: () => void
}

export interface VocabTrainerState {
    vocabularyData: LessonWord[]
    currentIndex: number
    isPlaying: boolean
    isLooping: boolean
    audioError: boolean
    dialect: string
    checked: boolean
    isDialectChanging: boolean
    isTransformingData: boolean
    transformError: string | null
}

export interface VocabTrainerActions {
    setVocabularyData: React.Dispatch<React.SetStateAction<LessonWord[]>>
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
    setIsLooping: React.Dispatch<React.SetStateAction<boolean>>
    setAudioError: React.Dispatch<React.SetStateAction<boolean>>
    setDialect: React.Dispatch<React.SetStateAction<string>>
    setChecked: React.Dispatch<React.SetStateAction<boolean>>
    setIsDialectChanging: React.Dispatch<React.SetStateAction<boolean>>
    updateCourseWord: (wordId: string, field: keyof LessonWord, value: string) => void
}