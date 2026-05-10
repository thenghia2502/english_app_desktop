"use client"

import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface TopNavigationProps {
    isEditMode: boolean
    onOpenModal?: () => void
}

export default function TopNavigation({ isEditMode, onOpenModal }: TopNavigationProps) {
    const navigate = useNavigate()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">
                        {isEditMode ? "Chỉnh sửa bài học" : "Tạo bài học"}
                    </h1>
                    <div className="flex gap-3">
                        {onOpenModal && (
                            <Button
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={onOpenModal}
                            >
                                Tạo bài học mới
                            </Button>
                        )}
                        <Button
                            className="bg-blue-600"
                            onClick={() => navigate("/dashboard")}
                            variant="outline"
                        >
                            Quản lý bài học
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}