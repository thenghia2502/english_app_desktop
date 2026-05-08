"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface Unit {
    unit_id: string
    unit_name: string
}

interface UnitFilterProps {
    units: Unit[] | {
        words: {
            word_id: string;
            word: string;
            word_meaning: string;
            word_ipa?: string | undefined;
            word_parent_id?: string | undefined;
            word_popularity?: number | undefined;
        }[];
        unit_id: string;
        unit_name: string;
        unit_description?: string | undefined;
        unit_order?: number | undefined;
        level_id: string;
        level_name: string;
        level_code: string;
        level_description?: string | undefined;
    }[]
    selectedUnitIds: string[]
    setSelectedUnitIds: React.Dispatch<React.SetStateAction<string[]>>
}

export default function UnitFilter({ units, selectedUnitIds, setSelectedUnitIds }: UnitFilterProps) {
    return (
        <div className="mb-6">
            <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-gray-900">Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-5 text-sm flex-wrap">
                        <div key={'all'} className="space-x-1 flex items-center text-gray-900 ">
                            <label htmlFor="all" className="text-nowrap">Tất cả</label>
                            <Checkbox
                                id="all"
                                checked={selectedUnitIds.length === units.length && units.length > 0}
                                onCheckedChange={(checked) => {
                                    const enable = checked === true
                                    if (enable) {
                                        const allIds = units.map((u) => u.unit_id)
                                        setSelectedUnitIds(allIds)
                                    } else {
                                        setSelectedUnitIds([])
                                    }
                                }}
                                aria-label="All"
                            />
                        </div>
                        {units.map((unit) => (
                            <div key={unit.unit_id} className="space-x-1 flex items-center text-gray-900">
                                <label htmlFor={`bai${unit.unit_id}`} className="text-nowrap">{unit.unit_name}</label>
                                <Checkbox
                                    id={`bai${unit.unit_id}`}
                                    checked={selectedUnitIds.includes(unit.unit_id)}
                                    onCheckedChange={(checked) => {
                                        const enable = checked === true
                                        setSelectedUnitIds((prev) => {
                                            if (enable) {
                                                return Array.from(new Set([...prev, unit.unit_id]))
                                            }
                                            return prev.filter((id) => id !== unit.unit_id)
                                        })
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}