"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormValues } from "@/lib/types"
import { Control } from "react-hook-form"

interface LessonNameInputProps {
  control: Control<FormValues>
}

export default function LessonNameInput({ control }: LessonNameInputProps) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium text-gray-900">
            Tên giáo trình tùy:
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder="Nhập tên giáo trình tùy..."
              className="w-full text-gray-900"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}