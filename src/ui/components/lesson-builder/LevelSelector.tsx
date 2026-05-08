"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FormValues, Level } from "@/lib/types"
import { Control } from "react-hook-form"

export interface LevelSelectorProps {
  control: Control<FormValues>
  levels: Level[]
  selectedLevel: Level | undefined
  onLevelChange: (levelId: string) => void
  isEditMode: boolean
}
export default function LevelSelector({
  control,
  levels,
  selectedLevel,
  onLevelChange
}: LevelSelectorProps) {
  return (
    <FormField
      control={control}
      name="levelId"
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel className="text-base font-medium text-gray-900">
            Trình độ
          </FormLabel>
          <FormControl>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-900"
                >
                  {selectedLevel?.level_name || "Chọn trình độ"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-full bg-white text-gray-900 z-9999 max-h-50 overflow-y-auto border shadow-lg"
                sideOffset={4}
              >
                <DropdownMenuItem
                  key={'all-levels'}
                  onSelect={() => {
                    field.onChange('all')
                    onLevelChange('all')
                  }}
                >
                  {'Tất cả'}
                </DropdownMenuItem>
                {levels.map((level) => (
                  <DropdownMenuItem
                    key={level.level_id}
                    onSelect={() => {
                      field.onChange(level.level_id)
                      onLevelChange(level.level_id)
                    }}
                  >
                    {level.level_name}
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