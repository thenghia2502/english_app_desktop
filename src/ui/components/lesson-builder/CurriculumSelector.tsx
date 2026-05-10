"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FormValues } from "@/lib/types"
import { Control } from "react-hook-form"
import { Curriculum } from "../curriculum-original/types"

interface CurriculumSelectorProps {
  control: Control<FormValues>
  curriculums: Curriculum[]
  selectedCurriculum: Curriculum | undefined
  onCurriculumChange: () => void
  isEditMode: boolean
}

export default function CurriculumSelector({
  control,
  curriculums,
  selectedCurriculum,
  onCurriculumChange
}: CurriculumSelectorProps) {
  return (
    <FormField
      control={control}
      name="curriculum"
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel className="text-base font-medium text-gray-900">
            Giáo trình gốc:
          </FormLabel>
          <FormControl>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-900"
                >
                  {selectedCurriculum?.name || selectedCurriculum?.title || "Chọn giáo trình gốc"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-full bg-white text-gray-900 z-9999">
                {curriculums.map((cur) => (
                  <DropdownMenuItem
                    key={cur.id}
                    onSelect={() => {
                      field.onChange(cur.id)
                      onCurriculumChange()
                    }}
                  >
                    {cur.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}