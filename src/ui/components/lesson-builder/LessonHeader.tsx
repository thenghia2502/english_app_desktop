"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface LessonHeaderProps {
    lessonWordsCount: number
    courseName: string
    setCourseName: (name: string) => void
    estimatedTime: string
    isEditMode: boolean
    onSave: () => void
    canSave: boolean
    description: string
    setDescription: (desc: string) => void
}

export default function LessonHeader({
    lessonWordsCount,
    courseName,
    setCourseName,
    estimatedTime,
    isEditMode,
    onSave,
    canSave,
    description,
    setDescription
}: LessonHeaderProps) {
    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Bài học mới ({lessonWordsCount} từ)
                </h2>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-900">
                        <Label htmlFor="course-name" className="text-sm font-medium text-gray-700">
                            Tên bài học:
                        </Label>
                        <Input
                            id="course-name"
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Nhập tên bài học"
                            className="w-48 text-sm"
                        />
                    </div>

                    {lessonWordsCount > 0 && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Thời gian ước chừng: </span>
                            <span className="text-blue-600 font-semibold">{estimatedTime}</span>
                        </div>
                    )}

                    <Button
                        onClick={onSave}
                        disabled={!canSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                            {isEditMode ? "Cập nhật bài học" : "Tạo bài học"}
                        </span>
                    </Button>
                </div>
            </div>
            <div className="mt-2">
                    <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả bài học"
                        className="text-sm"
                    />
            </div>
        </div>
    )
}