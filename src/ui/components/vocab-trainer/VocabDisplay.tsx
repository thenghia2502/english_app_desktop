"use client"

import { LessonWord } from '@/lib/types'

interface VocabDisplayProps {
    currentWord: LessonWord | null,
    ipa?: string,
}

export default function VocabDisplay({ currentWord, ipa }: VocabDisplayProps) {
    if (!currentWord) {
        return <span className="text-4xl text-gray-400">Đang tải...</span>
    }

    const readCount = Number(currentWord.word_progress)
    const ipaRounds = Number(currentWord.word_show_ipa)
    const wordRounds = Number(currentWord.word_show_word)

    const wordStart = ipaRounds
    const bothStart = ipaRounds + wordRounds

    const openCambridge = () => {
        const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(currentWord.word)}`;
        window.open(url, "_blank");
    };

    let phase: 1 | 2 | 3 = 1
    if (readCount <= wordStart) {
        phase = 1 // IPA
    } else if (readCount <= bothStart) {
        phase = 2 // Word
    } else {
        phase = 3 // IPA + Word
    }

    if (phase === 1) {
        return <span onClick={openCambridge} title='go to cambridge dictionary' className="ipa-text text-[10rem] text-blue-600 hover:cursor-pointer hover:-translate-y-0.5 transition-transform">/{ipa}/</span>
    }

    if (phase === 2) {
        return (
            <span className="text-7xl text-gray-900">
                <span onClick={openCambridge} title='go to cambridge dictionary' className="ipa-text text-[10rem] text-blue-600 hover:cursor-pointer hover:-translate-y-0.5 transition-transform">{currentWord.word}</span>
            </span>
        )
    }

    return (
        <span className="flex flex-col">
            <span onClick={openCambridge} title='go to cambridge dictionary' className="ipa-text text-[10rem] text-blue-600 text-center hover:cursor-pointer hover:-translate-y-0.5 transition-transform">{currentWord.word}</span>
            <span onClick={openCambridge} title='go to cambridge dictionary' className="ipa-text text-[10rem] text-blue-600 ml-2 hover:cursor-pointer hover:-translate-y-0.5 transition-transform">/{ipa}/</span>
        </span>
    )
}