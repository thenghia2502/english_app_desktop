"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { LessonWord } from '@/lib/types'
import { cn } from "@/lib/utils"

interface VocabTableProps {
    vocabularyData: LessonWord[]
    currentIndex: number
    isLooping: boolean
    isPlaying: boolean
    onWordClick: (index: number) => void
    onUpdateWord: (wordId: string, field: keyof LessonWord, value: string) => void
}

export default function VocabTable({
    vocabularyData,
    currentIndex,
    isLooping,
    isPlaying,
    onWordClick,
    onUpdateWord
}: VocabTableProps) {
    return (
        <div className={cn(
            "rounded-lg border border-gray-200 overflow-hidden transition-all",
            (isLooping || isPlaying) && "pointer-events-none opacity-50"
        )}>
            <Table className="text-gray-900">
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="font-semibold">Từ</TableHead>
                        <TableHead className="font-semibold">UK IPA</TableHead>
                        <TableHead className="font-semibold">US IPA</TableHead>
                        <TableHead className="font-semibold">khoảng dừng</TableHead>
                        <TableHead className="font-semibold">Ví dụ</TableHead>
                        <TableHead className="font-semibold w-20 text-center">Đọc</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vocabularyData.map((item, index) => (
                        <TableRow
                            key={item.id}
                            className={`hover:bg-gray-100 transition-colors cursor-pointer ${index === currentIndex ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                }`}
                        >
                            <TableCell
                                onClick={() => onWordClick(index)}
                                className="text-center font-medium text-gray-600"
                            >
                                {index + 1}
                            </TableCell>
                            <TableCell
                                onClick={() => onWordClick(index)}
                                className="font-semibold text-gray-900"
                            >
                                {item.word}
                            </TableCell>
                            <TableCell
                                onClick={() => onWordClick(index)}
                                className="text-gray-600 ipa-text text-sm"
                            >
                                {item.uk_ipa}
                            </TableCell>
                            <TableCell className="text-gray-600 ipa-text text-sm">
                                {item.us_ipa}
                            </TableCell>
                            <TableCell className="text-gray-600 italic flex items-center space-x-2">
                                <Input
                                    id="pause-time"
                                    type="number"
                                    value={item.word_pause_time}
                                    onChange={(e) => onUpdateWord(item.id, "word_pause_time", e.target.value)}
                                    placeholder="0"
                                    className="w-1/2 text-sm text-center"
                                    min="0"
                                />
                                <span>giây</span>
                            </TableCell>
                            <TableCell
                                onClick={() => onWordClick(index)}
                                className="text-gray-600 italic"
                            >
                                {item.example}
                            </TableCell>
                            <TableCell
                                onClick={() => onWordClick(index)}
                                className="text-center"
                            >
                                <span
                                    className={`text-sm font-medium ${Number(item.word_progress || 0) >= Number(item.word_max_read || 3)
                                            ? "text-green-600"
                                            : "text-blue-600"
                                        }`}
                                >
                                    {item.word_progress || 0}/{item.word_max_read || 3}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}