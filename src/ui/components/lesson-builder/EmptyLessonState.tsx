"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function EmptyLessonState() {
    return (
        <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="text-gray-400">
                    <div className="text-5xl mb-4">📚</div>
                    <p className="text-lg font-medium mb-2 text-gray-600">Chưa có từ vựng nào</p>
                    <p className="text-sm text-gray-500">
                        Chọn từ vựng từ panel bên trái và nhấn &quot;chuyển tiếp&quot; để thêm vào khóa học
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}