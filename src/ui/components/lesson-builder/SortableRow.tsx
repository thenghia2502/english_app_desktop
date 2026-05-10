"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LessonWord } from "@/lib/types"

interface LocalWord {
  word_id: string
  word: string
  ipa: string
}

export default function SortableRow({
  word,
  lessonWord,
  updateLessonWord,
  updateMaxReadsLessonWord,
  removeLessonWord
}: {
  word: LocalWord
  lessonWord: LessonWord
  updateLessonWord: (id: string, field: keyof LessonWord, value: string) => void
  updateMaxReadsLessonWord: (id: string, value: string) => void
  removeLessonWord: (id: string) => void
}) {
  const id = word.word_id

  return (
    <TableRow id={id} className="border-b text-gray-900">
      <TableCell className="py-3 px-6">
        <div className="font-medium">{word.word}</div>
        {/* <div className="text-gray-700 text-sm">{word.ipa}</div> */}
      </TableCell>

      {/* Số lần đọc tối đa */}
      <TableCell className="py-3 px-2 w-24 text-center">
        <Input
          type="number"
          min={1}
          value={lessonWord.word_max_read ?? ""}
          onChange={(e) => updateMaxReadsLessonWord(id, e.target.value)}
        />
      </TableCell>

      {/* Số lần hiện IPA */}
      <TableCell className="py-3 px-2 w-24 text-center">
        <Input
          type="number"
          min={0}
          value={lessonWord.word_show_ipa ?? ""}
          onChange={(e) => updateLessonWord(id, "word_show_ipa", e.target.value)}
        />
      </TableCell>

      {/* Số lần hiện từ */}
      <TableCell className="py-3 px-2 w-24 text-center">
        <Input
          type="number"
          min={0}
          value={lessonWord.word_show_word ?? ""}
          onChange={(e) => updateLessonWord(id, "word_show_word", e.target.value)}
        />
      </TableCell>

      {/* Số lần hiện IPA và từ */}
      <TableCell className="py-3 px-2 w-24 text-center">
        <Input
          type="number"
          min={0}
          value={lessonWord.word_show_ipa_and_word ?? ""}
          onChange={(e) => updateLessonWord(id, "word_show_ipa_and_word", e.target.value)}
        />
      </TableCell>

      {/* Số lần đọc trong 1 lần */}
      <TableCell className="py-3 px-2 w-24 text-center">
        <Input
          type="number"
          min={1}
          value={lessonWord.word_reads_per_round ?? ""}
          onChange={(e) => updateLessonWord(id, "word_reads_per_round", e.target.value)}
        />
      </TableCell>

      {/* Khoảng dừng */}
      <TableCell className="py-3 px-2 w-30 text-center">
        <Input
          type="number"
          step="0.1"
          min={0}
          value={lessonWord.word_pause_time ?? ""}
          onChange={(e) => updateLessonWord(id, "word_pause_time", e.target.value)}
        />
      </TableCell>

      <TableCell className="w-16 py-3 px-4 text-right">
        <Button variant="ghost" onClick={() => removeLessonWord(id)}>
          Xóa
        </Button>
      </TableCell>
    </TableRow>
  )
}