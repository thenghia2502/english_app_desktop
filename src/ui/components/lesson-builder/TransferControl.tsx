"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface TransferControlProps {
    selectedCount: number
    onTransfer: () => void
}

export default function TransferControl({ selectedCount, onTransfer }: TransferControlProps) {
    return (
        <div className="flex flex-col items-center justify-center mx-4">
            <div className="text-center">
                <Button
                    onClick={onTransfer}
                    disabled={selectedCount === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                >
                    <ChevronRight className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">chuyển tiếp</span>
                </Button>
                {selectedCount > 0 && (
                    <div className="mb-3 text-xs text-gray-600 font-medium">
                        {selectedCount} từ đã chọn
                    </div>
                )}
            </div>
        </div>
    )
}