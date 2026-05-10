"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LessonWord } from "@/lib/types"
import SortableRow from "./SortableRow"

interface LocalWord {
    word_id: string
    word: string
    ipa: string
}

interface LessonWordsTableProps {
    lessonWords: LessonWord[]
    setLessonWords: React.Dispatch<React.SetStateAction<LessonWord[]>>
    updateLessonWord: (id: string, field: keyof LessonWord, value: string) => void
    updateMaxReadsLessonWord: (id: string, value: string) => void
    removeLessonWord: (id: string) => void
}

export default function LessonWordsTable({
    lessonWords,
    setLessonWords,
    updateLessonWord,
    updateMaxReadsLessonWord,
    removeLessonWord
}: LessonWordsTableProps) {
    void setLessonWords

    return (
        <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="font-semibold text-gray-700 py-4 px-6">Từ vựng</TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 px-2 w-24 text-center">
                                Số lần đọc tối đa
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 px-2 w-24 text-center">
                                Số lần hiện IPA
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 px-2 w-24 text-center">
                                Số lần hiện từ
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 px-2 w-24 text-center">
                                Số lần hiện IPA và từ
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 px-2 w-24 text-center">
                                Số lần đọc trong 1 lần
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 py-4 px-2 w-30 text-center">
                                Khoảng dừng
                            </TableHead>
                            <TableHead className="w-16 py-4 px-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lessonWords.map((cw) => {
                            const word: LocalWord = {
                                word_id: cw.id,
                                word: cw.word,
                                ipa: ''
                            }

                            return (
                                <SortableRow
                                    key={word.word_id}
                                    word={word}
                                    lessonWord={cw}
                                    updateLessonWord={updateLessonWord}
                                    removeLessonWord={removeLessonWord}
                                    updateMaxReadsLessonWord={updateMaxReadsLessonWord}
                                />
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}