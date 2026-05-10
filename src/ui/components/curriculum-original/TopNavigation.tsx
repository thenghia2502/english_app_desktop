"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TopNavigation() {
    const router = useRouter()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-black">Quản lý giáo trình</h1>
                    <Button 
                        onClick={() => router.push("/user-dashboard")} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Quản lý bài học
                    </Button>
                </div>
            </div>
        </nav>
    )
}