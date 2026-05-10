"use client"

import { LessonWord } from '@/lib/types'

interface ProgressBadgeProps {
    currentWord: LessonWord | null
    lastShownWord: LessonWord | null
}

export default function ProgressBadge({ currentWord, lastShownWord }: ProgressBadgeProps) {
    const badgeWord = currentWord || lastShownWord
    const progress = badgeWord ? Number(badgeWord.word_progress || 0) : 0
    const maxRead = badgeWord ? Number(badgeWord.word_max_read || 3) : 0
    const colorClass = badgeWord && progress >= maxRead ? "text-green-600" : "text-blue-600"

    return (
        <div className="absolute h-[50px] w-[50px] flex justify-center items-center ">
            <span className={`p-2 text-lg font-medium ${colorClass} z-10`}>
                {badgeWord ? `${badgeWord.word_progress}/${badgeWord.word_max_read}` : "0/0"}
            </span>
        </div>
    )
}