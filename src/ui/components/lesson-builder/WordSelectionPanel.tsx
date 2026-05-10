"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { LocalWord, Unit, Word } from "@/lib/types"
import ModalAddWords from "./ModalAddWords"
import { appService } from "../../../services/AppService"

interface WordListUnit {
    unit_id: string
    unit_name: string
    unit_title?: string
    unit_words: {
        original: {
            id: string;
            word: string;
            meaning?: string;
            ipa?: string;
            popularity?: number;
            parent_id?: string | null;
            children_count: number;
        }[]
        custom: {
            id: string;
            word: string;
            meaning?: string;
            ipa?: string;
            popularity?: number;
            parent_id?: string | null;
            children_count: number;
        }[] | null
    }
}

interface RowWord {
    id: string
    word: string
    meaning?: string
    ipa?: string
    parent_id?: string
    popularity?: number
    lesson_ids?: string[]
    lesson_names?: string[]
    children_count?: number
}

interface UnitChildWord {
    word_id: string
    word: string
    ipa?: string
    meaning?: string
    parent_id?: string
    word_popularity: number
    children_count: number
    custom: number
}

interface WordSelectionPanelProps {
    units: WordListUnit[]
    selectedUnitIds: string[]
    data: {
        [key: string]: LocalWord[];
    }
    expandedChildGroups: Set<string>
    setData: React.Dispatch<React.SetStateAction<{ [key: string]: LocalWord[] }>>
    setExpandedChildGroups: React.Dispatch<React.SetStateAction<Set<string>>>
    onWordsAdded?: () => void | Promise<void>
    // onOpenModalAddWords: () => void
}

export default function WordSelectionPanel({
    units,
    selectedUnitIds,
    data,
    expandedChildGroups,
    setData,
    setExpandedChildGroups,
    onWordsAdded,
    // onOpenModalAddWords
}: WordSelectionPanelProps) {

    const getWordSelected = (unitId: string, wordId: string) => {
        const list = data[unitId]
        if (!Array.isArray(list)) return false
        const found = list.find((w: LocalWord) => w.id === wordId)
        return !!(found && found.selected)
    }

    const toggleWordSelection = (unitId: string, wordId: string) => {
        setData((prev) => {
            // If data already exists for this unit, update it
            if (prev[unitId]) {
                const updated = prev[unitId].map((w: LocalWord) =>
                    w.id === wordId ? { ...w, selected: !w.selected } : w
                )
                return { ...prev, [unitId]: updated }
            }
            return prev
        })
    }

    const renderRow = (word: RowWord, unit: WordListUnit, type: number) => {
        const selected = getWordSelected(unit.unit_id, word.id)

        return (
            <TableRow
                key={word.id}
                className={`hover:bg-gray-50 text-gray-900 flex ${type === 1 ? 'bg-[#b9d7fd]' : type === 2 ? 'bg-[#ffedd9]' : 'bg-[#8890ff]'} border-b border-gray-200 cursor-pointer`}
                onClick={() => toggleWordSelection(unit.unit_id, word.id)}
            >
                <TableCell className="px-4 py-3 w-1/3">
                    <div className={`flex items-center space-x-3 ${word.parent_id ? 'pl-2.5' : ''}`}>
                        <div>
                            <div className="font-medium text-gray-900">{word.word || word.id}</div>
                            {/* <div className="text-sm text-gray-500">{word.ipa}</div> */}
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-4 py-3 w-20 text-sm text-gray-700 flex-1 flex items-center">
                    {word.lesson_ids && word.lesson_ids.length > 0 && (
                        <div className="text-xs">
                            {word.lesson_ids.length === 1
                                ? `đã có trong bài ${word.lesson_names?.[0] || word.lesson_ids[0]}`
                                : `đã có trong ${word.lesson_ids.length} bài học`
                            }
                        </div>
                    )}
                </TableCell>
                <TableCell className="px-4 py-3 w-10 flex items-center">
                    <div className="space-x-3">
                        <Checkbox
                            checked={selected}
                            className={`${selected ? 'bg-blue-500 border-blue-500' : 'bg-white'}`}
                        />
                    </div>
                </TableCell>
            </TableRow>
        )
    }
    const [modalUnitId, setModalUnitId] = useState<string | null>(null)
    const [modalUnitTitle, setModalUnitTitle] = useState<string | null>(null)
    const [childrenCache, setChildrenCache] = useState<Map<string, UnitChildWord[]>>(new Map())
    const [loadingChildren, setLoadingChildren] = useState<Set<string>>(new Set())

    const handleOpenModalAddWords = (unitId: string, unitTitle: string) => {
        setModalUnitId(unitId)
        setModalUnitTitle(unitTitle)
    }
    const handleCloseModalAddWords = () => {
        setModalUnitId(null)
        setModalUnitTitle(null)
    }

    const fetchChildren = async (wordId: string, unitId: string) => {
        if (childrenCache.has(wordId) || loadingChildren.has(wordId)) {
            return
        }

        setLoadingChildren(prev => new Set(prev).add(wordId))

        try {
            const children = await appService.getChildrenWordsByParentId(wordId)

            setChildrenCache(prev => {
                const newMap = new Map(prev)
                newMap.set(wordId, children || [])
                return newMap
            })

            // Add children to data so they can be selected
            if (Array.isArray(children) && children.length > 0) {
                setData(prev => {
                    const list = prev[unitId] || []
                    const childLocalWords: LocalWord[] = children.map((c) => ({
                        id: c.word_id,
                        word: c.word || '',
                        meaning: c.meaning || '-',
                        ipa: c.ipa || '-',
                        parent_id: wordId,
                        word_parent_id: wordId,
                        selected: false,
                        done: false,
                        belong: '',
                        word_popularity: c.word_popularity || 0,
                        children_count: c.children_count || 0
                    }))

                    // Avoid duplicates
                    const existingIds = new Set(list.map(w => w.id))
                    const newChildren = childLocalWords.filter(c => !existingIds.has(c.id))
                    const n = { ...prev, [unitId]: [...list, ...newChildren] }
                    console.log('Updated data with children:', n)
                    return { ...prev, [unitId]: [...list, ...newChildren] }
                })
            }
        } catch (error) {
            console.error('Error fetching children:', error)
        } finally {
            setLoadingChildren(prev => {
                const newSet = new Set(prev)
                newSet.delete(wordId)
                return newSet
            })
        }
    }

    const handleExpandChildren = async (wordId: string, unitId: string) => {
        await fetchChildren(wordId, unitId)
        setExpandedChildGroups(s => {
            const ns = new Set(s)
            ns.add(wordId)
            return ns
        })
    }
    return (
        <>
            {modalUnitId && modalUnitTitle && (
                <ModalAddWords
                    unitId={modalUnitId}
                    unitTitle={modalUnitTitle}
                    onClose={handleCloseModalAddWords}
                    onAdded={onWordsAdded}
                />
            )}
            {units.filter(u => selectedUnitIds.includes(u.unit_id)).map((unit) => {
                const rootsOriginal: RowWord[] = []
                const rootsCustom: RowWord[] = []
                const unitWordsOriginal = (unit.unit_words?.original || [])
                const unitWordsCustom = (unit.unit_words?.custom || [])

                unitWordsOriginal.forEach((w) => {
                    const rootWord: RowWord = {
                        id: w.id,
                        word: w.word ?? '',
                        meaning: w.meaning ?? '',
                        ipa: w.ipa,
                        parent_id: undefined,
                        popularity: w.popularity,
                        // lesson_ids: w.lesson_ids,
                        // lesson_names: w.lesson_names,
                        children_count: w.children_count
                    }
                    rootsOriginal.push(rootWord)
                })

                unitWordsCustom.forEach((w) => {
                    const rootWord: RowWord = {
                        id: w.id,
                        word: w.word ?? '',
                        meaning: w.meaning ?? '',
                        ipa: w.ipa,
                        parent_id: undefined,
                        popularity: w.popularity,
                        // lesson_ids: w.lesson_ids,
                        // lesson_names: w.lesson_names,
                        children_count: w.children_count
                    }
                    rootsCustom.push(rootWord)
                })

                // Sort roots for predictable order
                rootsOriginal.sort((a, b) => a.word.localeCompare(b.word))
                rootsCustom.sort((a, b) => a.word.localeCompare(b.word))

                return (
                    <div key={unit.unit_id} className="mb-6">
                        <div className="flex justify-between">
                            <h3 className="text-md font-semibold text-gray-800 mb-3">{unit.unit_name} từ</h3>
                            <span className="text-black text-sm cursor-pointer italic hover:underline" onClick={() => handleOpenModalAddWords(unit.unit_id, unit.unit_name)}>thêm từ</span>
                        </div>
                        <Card className="bg-white shadow-sm border border-gray-200">
                            <CardContent className="p-0 pt-6">
                                <Table>
                                    <TableBody>
                                        {rootsOriginal.map((root) => {
                                            const rootKey = root.id ?? root.id
                                            if (!rootKey) return null
                                            const unitData = data[unit.unit_id] || []
                                            const children = unitData.filter(w => w.word_parent_id === root.id)
                                            const isLoading = loadingChildren.has(rootKey)
                                            const hasChildren = children.length > 0
                                            const childrenCount = root.children_count ?? 0
                                            const hasChildrenFromAPI = childrenCount > 0

                                            return (
                                                <React.Fragment key={rootKey}>
                                                    {renderRow(root, unit, 1)}
                                                    {expandedChildGroups.has(rootKey) && hasChildren && (
                                                        <>
                                                            {children.map((c) => renderRow(c, unit, 3))}
                                                            <TableRow className="border-b border-gray-700">
                                                                <TableCell colSpan={3} className="px-4 py-2 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setExpandedChildGroups((s) => {
                                                                                const ns = new Set(s)
                                                                                ns.delete(rootKey)
                                                                                return ns
                                                                            })
                                                                        }}
                                                                        className="text-sm text-gray-600 hover:underline"
                                                                    >
                                                                        Ẩn bớt
                                                                    </button>
                                                                </TableCell>
                                                            </TableRow>
                                                        </>
                                                    )}
                                                    {!expandedChildGroups.has(rootKey) && hasChildrenFromAPI && (
                                                        <TableRow className="border-b border-gray-700">
                                                            <TableCell colSpan={3} className="px-4 py-2 flex justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleExpandChildren(rootKey, unit.unit_id)
                                                                    }}
                                                                    disabled={isLoading}
                                                                    className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                                                                >
                                                                    {isLoading ? 'Đang tải...' : 'Xem từ liên quan'}
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                        {rootsCustom.map((root) => {
                                            const rootKey = root.id ?? root.id
                                            if (!rootKey) return null
                                            const unitData = data[unit.unit_id] || []
                                            const children = unitData.filter(w => w.word_parent_id === root.id)
                                            const isLoading = loadingChildren.has(rootKey)
                                            const hasChildren = children.length > 0
                                            const childrenCount = (root).children_count ?? 0
                                            const hasChildrenFromAPI = childrenCount > 0

                                            return (
                                                <React.Fragment key={rootKey}>
                                                    {renderRow(root, unit, 2)}
                                                    {expandedChildGroups.has(rootKey) && hasChildren && (
                                                        <>
                                                            {children.map((c) => renderRow(c, unit, 3))}
                                                            <TableRow className="border-b border-gray-700">
                                                                <TableCell colSpan={3} className="px-4 py-2 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setExpandedChildGroups((s) => {
                                                                                const ns = new Set(s)
                                                                                ns.delete(rootKey)
                                                                                return ns
                                                                            })
                                                                        }}
                                                                        className="text-sm text-gray-600 hover:underline"
                                                                    >
                                                                        Ẩn bớt
                                                                    </button>
                                                                </TableCell>
                                                            </TableRow>
                                                        </>
                                                    )}
                                                    {!expandedChildGroups.has(rootKey) && hasChildrenFromAPI && (
                                                        <TableRow className="border-b border-gray-700">
                                                            <TableCell colSpan={3} className="px-4 py-2 flex justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleExpandChildren(rootKey, unit.unit_id)
                                                                    }}
                                                                    disabled={isLoading}
                                                                    className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                                                                >
                                                                    {isLoading ? 'Đang tải...' : 'Xem từ liên quan'}
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )
            })}
        </>
    )
}