"use client"

import { FormValues } from "@/lib/types"
import { Control } from "react-hook-form"
import LessonGrid from "./LessonGrid"
import PaginationControls from "./PaginationControls"

interface LessonSelectionSectionProps {
  control: Control<FormValues>
  baiList: {
    unit_id: string;
    unit_name: string;
    unit_description?: string | undefined;
    unit_order?: number | undefined;
    level_id: string;
    level_name: string;
    level_code: string;
    level_description?: string | undefined;
}[]
  currentItems: {
    unit_id: string;
    unit_name: string;
    unit_description?: string | undefined;
    unit_order?: number | undefined;
    level_id: string;
    level_name: string;
    level_code: string;
    level_description?: string | undefined;
}[]
  currentPage: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  originalSelectedRef: { current: string[] }
  isEditMode: boolean
  onPageChange: (page: number) => void
  onItemChange: () => void
}

export default function LessonSelectionSection({
  control,
  baiList,
  currentItems,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  originalSelectedRef,
  isEditMode,
  onPageChange,
  onItemChange
}: LessonSelectionSectionProps) {
  return (
    <div className="flex-1 border rounded-md p-4 min-h-0 flex flex-col">
      <div className="flex-none mb-4">
        <p className="text-base font-medium text-gray-900">
          Chọn bài học ({baiList.length} bài)
        </p>
      </div>
      
      {baiList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Vui lòng chọn giáo trình gốc và trình độ để xem danh sách bài học</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <LessonGrid
            control={control}
            baiList={baiList}
            currentItems={currentItems}
            originalSelectedRef={originalSelectedRef}
            isEditMode={isEditMode}
            onItemChange={onItemChange}
          />
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}