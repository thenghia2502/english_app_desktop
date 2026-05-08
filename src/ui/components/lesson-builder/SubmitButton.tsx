"use client"

import { Button } from "@/components/ui/button"

export interface SubmitButtonProps {
  isSubmitting: boolean
  isEditMode: boolean
}
export default function SubmitButton({ isSubmitting, isEditMode }: SubmitButtonProps) {
  return (
    <div className="flex-none flex justify-end pt-4 border-t bg-white">
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-400 hover:bg-green-500 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? (isEditMode ? "Đang cập nhật..." : "Đang tạo...")
          : (isEditMode ? "Cập nhật danh sách" : "Tạo danh sách")
        }
      </Button>
    </div>
  )
}