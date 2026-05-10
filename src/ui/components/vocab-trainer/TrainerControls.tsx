"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface TrainerControlsProps {
    checked: boolean
    setChecked: (checked: boolean) => void
    dialect: string
    setDialect: (dialect: string) => void
    isLooping: boolean
    isPlaying: boolean
}

export default function TrainerControls({
    checked,
    setChecked,
    dialect,
    setDialect,
    isLooping,
    isPlaying
}: TrainerControlsProps) {
    return (
        <div className="my-3 flex justify-between">
            <div className="flex space-x-6">
                <div className="space-x-2 flex items-center text-gray-900">
                    <Checkbox
                        id="danh-sach-tu"
                        checked={checked}
                        onCheckedChange={(value) => setChecked(!!value)}
                    />
                    <Label htmlFor="danh-sach-tu" className="text-sm font-medium cursor-pointer">
                        danh sách từ
                    </Label>
                </div>
                <RadioGroup
                    value={dialect}
                    onValueChange={setDialect}
                    className={cn(
                        "flex flex-row space-x-6 text-gray-900",
                        (isLooping || isPlaying) && "opacity-80"
                    )}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="us" id="us" />
                        <Label htmlFor="us" className="text-sm font-medium cursor-pointer">
                            us
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="uk" id="uk" />
                        <Label htmlFor="uk" className="text-sm font-medium cursor-pointer">
                            uk
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    )
}