"use client"

import { Button } from "@/components/ui/button"

interface TopNavigationProps {
    lessonName?: string
}

export default function TopNavigation({ lessonName }: TopNavigationProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Vocab Trainer
                    </h1>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {lessonName}
                    </h1>
                    <Button
                        onClick={() => window.location.href = '/user-dashboard'}
                        className="ml-4 bg-primary text-white"
                    >
                        Quản lý bài học
                    </Button>
                </div>
            </div>
        </nav>
    )
}