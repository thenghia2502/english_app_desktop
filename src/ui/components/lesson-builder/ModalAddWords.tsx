"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, X, Upload } from "lucide-react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useGetUrlAudio } from "@/hooks/use-audios"
import { useAddWordToUnit } from "@/hooks/use-add-word-to-unit"
import { useCheckWordInUnit } from "@/hooks/use-check-word-in-unit"
import { useToast } from "@/hooks/use-toast"
import React from "react"

export default function ModalAddWords({ unitId, unitTitle, onClose, onAdded }: { unitId: string, unitTitle: string, onClose: () => void, onAdded?: () => void | Promise<void> }) {
    const [rows, setRows] = useState<Array<{ id: string; text: string; meaning: string; ukIpa: string; usIpa: string; exist: boolean; errors?: { text?: string[]; meaning?: string[]; ukIpa?: string[]; usIpa?: string[] } }>>([
        { id: "", text: "", meaning: "", ukIpa: "", usIpa: "", exist: false }
    ])
    // Lưu rows theo từng unitId để mỗi unit có dữ liệu riêng
    const rowsByUnitRef = useRef<Record<string, Array<{ id: string; text: string; meaning: string; ukIpa: string; usIpa: string; exist: boolean; errors?: { text?: string[]; meaning?: string[]; ukIpa?: string[]; usIpa?: string[] } }>>>({})

    // Cache audio để tránh fetch lại nhiều lần
    const audioCache = useRef<Map<string, string>>(new Map())

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Hooks
    const getAudio = useGetUrlAudio()
    const { addWordToUnit, isLoading: isSubmitting } = useAddWordToUnit()
    const { checkWordInUnit } = useCheckWordInUnit<{ exists: boolean }>()
    const { toast } = useToast()

    // Khi unitId thay đổi, đồng bộ rows tương ứng
    useEffect(() => {
        const exist = rowsByUnitRef.current[unitId]
        if (exist && Array.isArray(exist)) {
            setRows(exist)
        } else {
            const initial = [{ id: "", text: "", meaning: "", ukIpa: "", usIpa: "", exist: false }]
            rowsByUnitRef.current[unitId] = initial
            setRows(initial)
        }
    }, [unitId])

    const fetchIpaAndCheckExistence = async (value: string, idx: number) => {
        if (!value.trim()) return;

        const res = await fetch(`/api/proxy/words/get_ipa?words=${encodeURIComponent(value)}`);
        const data = await res.json();

        console.log("API data:", data);
        const existsData = data?.id
            ? await checkWordInUnit({ wordId: data.id, unitId })
            : null
        const existsFlag = typeof existsData === "boolean" ? existsData : !!existsData?.exists
        console.log("Existence data:", existsData);
        setRows(prev => {
            const updated = [...prev];
            updated[idx] = {
                ...updated[idx],
                id: data.id || "",
                meaning: data.meaning || "",
                ukIpa: data.ukIPA || "",
                usIpa: data.usIPA || "",
                exist: existsFlag
            };
            console.log("Updated row:", updated[idx]);
            return updated;
        });
    };

    const handleChange = (idx: number, field: "text" | "meaning" | "ukIpa" | "usIpa", value: string) => {
        try {
            value = value.normalize("NFC");

            setRows(prev => {
                const next = prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
                rowsByUnitRef.current[unitId] = next
                return next
            });

        } catch (e) {
            console.error("Error normalizing string:", e);
        }
    };


    const addRow = () => setRows(prev => {
        const next = [...prev, { id: "", text: "", meaning: "", ukIpa: "", usIpa: "", exist: false }]
        rowsByUnitRef.current[unitId] = next
        return next
    })
    const removeRow = (idx: number) => setRows(prev => {
        const next = prev.filter((_, i) => i !== idx)
        rowsByUnitRef.current[unitId] = next
        return next
    })
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const lastIndex = rows.length - 1;
        const ref = inputRefs.current[lastIndex];
        if (ref) ref.focus();
    }, [rows.length]);

    const handleSubmit = async () => {
        if (isSubmitting) {
            toast({
                title: "Đang xử lý",
                description: "Vui lòng đợi yêu cầu hiện tại hoàn thành"
            });
            return
        }

        const validRows = rows.filter(r => (r.id && r.id.trim()) || (r.text && r.text.trim()))
        if (validRows.length === 0) {
            toast({
                title: "Không có từ",
                description: "Vui lòng nhập ít nhất một từ để lưu"
            });
            return
        }

        const success = await addWordToUnit({
            wordIds: validRows.filter(r => !r.exist).map(r => r.id),
            unitId: unitId
        }, { onSuccess: onAdded })

        if (success) {
            onClose()
        }
    }

    const handlePlayMP3 = async (word: string, dialect: "uk" | "us") => {
        if (!word.trim()) {
            toast({
                title: "Không có từ",
                description: "Vui lòng nhập từ để phát âm thanh"
            });
            return;
        }

        const normalizedWord = word.trim().toLowerCase() + dialect;

        // Kiểm tra cache trước
        if (audioCache.current.has(normalizedWord)) {
            const cachedUrl = audioCache.current.get(normalizedWord)!;
            const audio = new Audio(cachedUrl);
            audio.play().catch(err => {
                console.error("Error playing cached audio:", err);
            });
            return;
        }

        try {
            const res = await getAudio(word, dialect);
            if (!res) {
                console.error(`Failed to fetch audio for "${word}" (${dialect})`);
                return;
            };

            // Lưu vào cache
            audioCache.current.set(normalizedWord, res);

            const audio = new Audio(res);

            audio.oncanplaythrough = () => {
                audio.play().catch(err => {
                    console.error("Error playing audio:", err);
                });
            };

            audio.onerror = (e) => {
                console.error("Audio error:", e);
                // Xóa khỏi cache nếu lỗi
                audioCache.current.delete(normalizedWord);
                URL.revokeObjectURL(res);
            };
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    }

    // Parse error message để xác định field nào bị lỗi
    const parseErrors = (errorMessages: string[]) => {
        const errorsByField: { text?: string[]; meaning?: string[]; ukIpa?: string[]; usIpa?: string[] } = {}
        errorMessages.forEach(msg => {
            if (msg.toLowerCase().includes('meaning')) {
                errorsByField.meaning = [...(errorsByField.meaning || []), msg]
            } else if (msg.toLowerCase().includes('ipa') || msg.toLowerCase().includes('uk') || msg.toLowerCase().includes('us')) {
                if (msg.toLowerCase().includes('uk')) {
                    errorsByField.ukIpa = [...(errorsByField.ukIpa || []), msg]
                } else if (msg.toLowerCase().includes('us')) {
                    errorsByField.usIpa = [...(errorsByField.usIpa || []), msg]
                } else {
                    errorsByField.ukIpa = [...(errorsByField.ukIpa || []), msg]
                }
            } else {
                errorsByField.text = [...(errorsByField.text || []), msg]
            }
        })
        return errorsByField
    }

    const handleFileImport = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/proxy/file/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const data = await response.json()
            console.log("Imported data:", data)

            // API trả về format mới: { success, rows: { validRows: [...], invalidRows: [...] } }
            const validRowsRaw = Array.isArray(data?.rows) ? data.rows : []

            const combinedRows = [...validRowsRaw]
            console.log("combinedRows: ", combinedRows)
            if (combinedRows.length > 0) {
                const newRows = combinedRows.map((word: any) => ({
                    id: word.id || "",
                    text: word.text || "",
                    meaning: word.meaning || "",
                    ukIpa: word.ukIPA || "",
                    usIpa: word.usIPA || "",
                    errors: word.errors || {},
                    exist: false
                }))

                // Kiểm tra sự tồn tại cho các từ import
                for (let i = 0; i < newRows.length; i++) {
                    if (newRows[i].id) {
                        const existsData = await checkWordInUnit({
                            wordId: newRows[i].id,
                            unitId
                        })
                        newRows[i].exist = typeof existsData === "boolean" ? existsData : !!existsData?.exists
                    }
                }

                // Merge với rows hiện tại (loại bỏ row trống và tránh duplicate)
                setRows(prev => {
                    const filtered = prev.filter(r => r.text.trim() || r.meaning.trim())

                    // Lọc ra các từ import chưa tồn tại trong unit và chưa có trong rows hiện tại
                    const existingTexts = new Set(filtered.map(r => r.text.trim().toLowerCase()))
                    const uniqueNewRows = newRows.filter(r =>
                        !existingTexts.has(r.text.trim().toLowerCase())
                    )

                    const combined = filtered.length > 0 ? [...filtered, ...uniqueNewRows] : uniqueNewRows
                    const merged = [...combined, { id: "", text: "", meaning: "", ukIpa: "", usIpa: "", exist: false }]
                    rowsByUnitRef.current[unitId] = merged
                    return merged
                })
            }
        } catch (error) {
            console.error("Error importing file:", error)
            toast({
                title: "Lỗi import file",
                description: "Có lỗi xảy ra khi import file. Vui lòng thử lại."
            });
        } finally {
            setIsUploading(false)
            // Reset input để có thể import lại cùng file
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }
    const fetchIpa = async (word: string, dialect: "uk" | "us") => {
        const res = await fetch(`/api/proxy/words/ipa/${dialect}?word=${encodeURIComponent(word)}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${dialect.toUpperCase()} IPA: ${res.statusText}`);
        }
        return await res.json();
    }

    return (
        <div className="modal fixed inset-0 flex items-center justify-center z-90">
            <div className="fixed inset-0 bg-gray-500/75" />
            <div className="text-black modal-content relative flex flex-col z-10 w-[95%] max-w-6xl bg-white rounded-lg shadow-xl overflow-visible">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Thêm từ vào {unitTitle}</h2>
                    <button
                        onClick={() => onClose()}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        // disabled={isSubmitting}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="overflow-x-auto rounded-md border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Text</TableHead>
                                    <TableHead className="w-[20%]">Meaning</TableHead>
                                    <TableHead className="w-[25%]">UK IPA</TableHead>
                                    <TableHead className="w-[25%]">US IPA</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <TableRow className="">
                                            <TableCell className="relative">
                                                <Input
                                                    ref={el => { inputRefs.current[idx] = el; }}
                                                    placeholder="e.g. notebook"
                                                    value={row.text}
                                                    onChange={(e) => handleChange(idx, "text", e.target.value)}
                                                    // onBlur={() => fetchIpaAndCheckExistence(rows[idx].text, idx)}
                                                    className={`${row.exist && 'border-red-500'}`}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            const isLastRow = idx === rows.length - 1;
                                                            const hasData = row.text.trim();

                                                            if (isLastRow) {
                                                                if (hasData) {
                                                                    // Dòng cuối cùng và có dữ liệu: fetch IPA và tạo dòng mới
                                                                    fetchIpaAndCheckExistence(row.text, idx);
                                                                    addRow();
                                                                } else {
                                                                    // Dòng cuối cùng nhưng chưa có dữ liệu: hiển thị toast cảnh báo
                                                                    toast({
                                                                        title: "Chưa nhập từ",
                                                                        description: "Vui lòng nhập từ trước khi tạo dòng mới"
                                                                    });
                                                                }
                                                            } else {
                                                                // Không phải dòng cuối: chuyển focus sang dòng tiếp theo
                                                                if (hasData) {
                                                                    fetchIpaAndCheckExistence(row.text, idx);
                                                                }
                                                                inputRefs.current[idx + 1]?.focus();
                                                            }
                                                        }
                                                    }}
                                                />
                                                {row.exist && (
                                                    <span className="absolute text-[12px] text-red-500 ml-2 mb-2">Từ này đã tồn tại trong bài học.</span>
                                                )}
                                                {row.errors?.text && row.errors.text.length > 0 && (
                                                    <div className="absolute text-[12px] text-red-500 ml-2">
                                                        {row.errors.text.map((err, i) => (<div key={i}>{err}</div>))}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="">
                                                <div className="relative">
                                                    <Input
                                                        placeholder="e.g. quyển vở"
                                                        value={row.meaning}
                                                        onChange={(e) => handleChange(idx, "meaning", e.target.value)}
                                                        className={row.errors?.meaning ? 'border-red-500' : ''}
                                                    />
                                                    {row.errors?.meaning && row.errors.meaning.length > 0 && (
                                                        <div className="absolute text-[12px] text-red-500 ml-2">
                                                            {row.errors.meaning.map((err, i) => (<div key={i}>{err}</div>))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="">
                                                <div className="relative">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            key={row.ukIpa + idx}       // ép rerender khi IPA thay đổi
                                                            placeholder="e.g. /ˈnəʊtbʊk/"
                                                            value={row.ukIpa}
                                                            onChange={(e) => handleChange(idx, "ukIpa", e.target.value)}
                                                            className={row.errors?.ukIpa ? 'border-red-500' : ''}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePlayMP3(row.text, 'uk');
                                                            }}
                                                            disabled={!row.text.trim()}
                                                            type="button"
                                                        >
                                                            <Volume2 className={!row.text.trim() ? "text-gray-300" : ""} />
                                                        </Button>
                                                    </div>
                                                    {row.errors?.ukIpa && row.errors.ukIpa.length > 0 && (
                                                        <div className="absolute text-[12px] text-red-500 ml-2">
                                                            {row.errors.ukIpa.map((err, i) => (<div key={i}>{err}</div>))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="relative">
                                                <div className="relative">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            key={row.usIpa + idx}
                                                            placeholder="e.g. /ˈnoʊtbʊk/"
                                                            value={row.usIpa}
                                                            onChange={(e) => handleChange(idx, "usIpa", e.target.value)}
                                                            className={row.errors?.usIpa ? 'border-red-500' : ''}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePlayMP3(row.text, 'us');
                                                            }}
                                                            disabled={!row.text.trim()}
                                                            type="button"
                                                        >
                                                            <Volume2 className={!row.text.trim() ? "text-gray-300" : ""} />
                                                        </Button>
                                                    </div>
                                                    {row.errors?.usIpa && row.errors.usIpa.length > 0 && (
                                                        <div className="absolute text-[12px] text-red-500 ml-2">
                                                            {row.errors.usIpa.map((err, i) => (<div key={i}>{err}</div>))}
                                                        </div>
                                                    )}
                                                </div>
                                                {rows.length > 1 && idx !== rows.length - 1 && (
                                                    <button className="w-10 h-10 absolute top-0 right-0 bg-red-500 [clip-path:polygon(0_0,100%_0,100%_100%)] z-50" onClick={() => removeRow(idx)}>
                                                        <div className="w-full h-full relative">
                                                            <X className="w-4 h-4 text-white absolute right-1 top-1" />
                                                        </div>
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-3 flex justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="hover:cursor-pointer transition-transform hover:-translate-y-0.5"
                                onClick={addRow}
                                disabled={rows.length > 0 && !rows[rows.length - 1].text.trim()}
                            >
                                Thêm dòng
                            </Button>
                            <Button
                                variant="outline"
                                className="hover:cursor-pointer transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                onClick={handleFileImport}
                                disabled={isUploading}
                            >
                                <Upload className="w-4 h-4" />
                                {isUploading ? 'Đang tải...' : 'Import File'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".json,.csv,.xlsx,.xls,.txt"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="text-sm text-gray-500">{rows.filter(r => (r.id && r.id.trim()) || (r.text && r.text.trim())).length} dòng</div>
                    </div>
                    <div>
                        <Button
                            className="mt-4 float-right bg-blue-600 text-white hover:cursor-pointer transition-transform hover:-translate-y-0.5"
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting || !rows.some(r => (r.id && r.id.trim()) || (r.text && r.text.trim()))}
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Lưu từ'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}