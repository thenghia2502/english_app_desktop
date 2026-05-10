"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useLessonById } from "@/hooks"
import { Lesson, LessonWord, Word, Curriculum, Level, Unit, LocalWord, ApiWordData, ApiUnitData } from "@/lib/types"
import Loading from "@/components/ui/loading"

// Components
import TopNavigation from "@/components/lesson-builder/TopNavigation"
import UnitFilter from "@/components/lesson-builder/UnitFilter"
import WordSelectionPanel from "@/components/lesson-builder/WordSelectionPanel"
import TransferControl from "@/components/lesson-builder/TransferControl"
import LessonHeader from "@/components/lesson-builder/LessonHeader"
import EmptyLessonState from "@/components/lesson-builder/EmptyLessonState"
import LessonWordsTable from "@/components/lesson-builder/LessonWordsTable"
import { useLessonBuilderLogic } from "@/components/lesson-builder/useLessonBuilderLogic"
import Modal from "./Modal"
import { useFetchUnitsByIds } from "@/hooks"
// import ModalAddWords from "./ModalAddWords"

export default function TaoBaiHocPage({ mode, id }: { mode?: 'create' | 'update', id?: string }) {
    // URL parameters
    const { curriculumId } = useParams<{ curriculumId?: string }>()
    const lessonId = id

    // State management
    const isEditMode = mode === 'update'
    const [units, setUnits] = useState<ApiUnitData[]>([]) // Units từ API cho cả create và edit mode
    const [data, setData] = useState<{ [key: string]: LocalWord[] }>({})
    const [lessonWords, setLessonWords] = useState<LessonWord[]>([])
    const [courseName, setCourseName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
    const [selectedUnitsFromModal, setSelectedUnitsFromModal] = useState<string[]>([])
    const [expandedChildGroups, setExpandedChildGroups] = useState<Set<string>>(new Set())
    const [isModalOpen, setIsModalOpen] = useState(mode === 'create')
    const [curriculumOriginalId, setCurriculumOriginalId] = useState<string>('')  // NEW

    // React Query hooks
    const { data: lessonById, isLoading: lessonByIdLoading } = useLessonById(lessonId)

    // Hook: fetch units by ids
    const { fetchUnitsByIds, isLoadingUnits, refetchLast } = useFetchUnitsByIds()

    // ===== HELPER: Load edit mode data =====
    const loadEditModeData = useCallback(async () => {
        try {
            const lb = lessonById as Lesson;

            // API trả về units array, không unit_ids
            // Nếu có units array, extract IDs từ đó
            let unitIdsFromLesson: string[] = [];

            const unitsFromLesson = (lb as unknown as Record<string, unknown>)['units'];
            if (Array.isArray(unitsFromLesson) && unitsFromLesson.length > 0) {
                unitIdsFromLesson = unitsFromLesson
                    .map((u: unknown) => (u as Record<string, unknown>)['id'])
                    .filter((id): id is string => typeof id === 'string');
            }

            // Fallback: kiểm tra unit_ids field nếu units không có
            if (unitIdsFromLesson.length === 0) {
                const fallbackUnitIds = (lb as unknown as Record<string, unknown>)['unit_ids'];
                if (Array.isArray(fallbackUnitIds)) {
                    unitIdsFromLesson = fallbackUnitIds.map(String);
                }
            }

            if (!Array.isArray(unitIdsFromLesson) || unitIdsFromLesson.length === 0) {
                console.warn('⚠️ No unit_ids found in lesson');
                return;
            }

            setSelectedUnitsFromModal(unitIdsFromLesson.map(String));
            // Call fetchUnitsByIds directly without including it in dependencies
            const { units: fetchedUnits, initialData } = await fetchUnitsByIds(unitIdsFromLesson.map(String))
            setUnits(fetchedUnits)
            setSelectedUnitIds(unitIdsFromLesson.map(String))
            setData(initialData)

            // Set course name
            const toStr = (v: unknown) => (v === undefined || v === null) ? '' : String(v);
            const lessonName = toStr((lb as unknown as Record<string, unknown>)['name'] ?? (lb as unknown as Record<string, unknown>)['lesson_name'] ?? '');
            const curriculum = (lb as unknown as Record<string, unknown>)['curriculum'] as Record<string, unknown>;

            if (curriculum && curriculum.curriculum_name) {
                setCourseName(`${lessonName}`);
            } else {
                setCourseName(lessonName);
            }

            // Set description if available
            const desc = toStr((lb as unknown as Record<string, unknown>)['description'] ?? '');
            setDescription(desc);

            // Set lesson words
            const incomingWords: LessonWord[] = Array.isArray(lb.words)
                ? (lb.words as unknown as Record<string, unknown>[]).map((w) => ({
                    id: toStr(w['id'] ?? ''),
                    word: toStr(w['word']),
                    word_meaning: toStr(w['meaning'] ?? w['word_meaning'] ?? ''),
                    word_pause_time: toStr(w['word_pause_time'] ?? '1.5'),
                    word_max_read: toStr(w['word_max_read'] ?? '6'),
                    word_show_ipa: toStr(w['word_show_ipa'] ?? '3'),
                    word_show_word: toStr(w['word_show_word'] ?? '1'),
                    word_show_ipa_and_word: toStr(w['word_show_ipa_and_word'] ?? '2'),
                    word_reads_per_round: toStr(w['word_reads_per_round'] ?? '6'),
                    word_progress: toStr(w['word_progress'] ?? '0'),
                    word_parent_id: toStr(w['word_parent_id'] ?? ''),
                    word_popularity: Number(w['word_popularity'] ?? 0),
                    uk_ipa: toStr(w['uk_ipa'] ?? ''),
                    us_ipa: toStr(w['us_ipa'] ?? ''),
                }))
                : [];

            setLessonWords(incomingWords);

            // Mark selected words
            setTimeout(() => {
                const selectedIds = new Set(incomingWords.map((w) => w.id));
                setData((prev) => {
                    const out: typeof prev = {};
                    for (const key of Object.keys(prev)) {
                        out[key] = prev[key].map((lw) => ({ ...lw, selected: selectedIds.has(lw.id) }));
                    }
                    return out;
                });
            }, 100);
        } catch (error) {
            console.error('❌ Error loading edit mode data:', error);
            alert('Lỗi khi tải dữ liệu bài học. Vui lòng thử lại.');
        }
    }, [lessonById]);

    // Create mode: nhận curriculum_id từ Modal
    const handleModalSuccess = async (modalData: {
        selectedUnits: string[]
        curriculum: Curriculum
        level: Level | undefined
    }) => {
        try {
            const ccId =
                (modalData.curriculum as unknown as Record<string, unknown>)['curriculum_id'] ??
                (modalData.curriculum as unknown as Record<string, unknown>)['id'] ??
                ''
            setCurriculumOriginalId(String(ccId))                             // NEW
            if (!modalData.selectedUnits || modalData.selectedUnits.length === 0) {
                alert('Không có unit nào được chọn')
                return
            }

            setSelectedUnitsFromModal(modalData.selectedUnits)
            const { units: fetchedUnits, initialData } = await fetchUnitsByIds(modalData.selectedUnits)
            setUnits(fetchedUnits)
            setSelectedUnitIds(modalData.selectedUnits)
            setData(initialData)
        } catch (error) {
            console.error('❌ Error fetching words:', error)
            alert(`Lỗi khi tải dữ liệu từ vựng. Vui lòng thử lại.${error instanceof Error ? ` ${error.message}` : error}`)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    // ===== EDIT MODE: Call loadEditModeData when in edit mode =====
    useEffect(() => {
        if (!isEditMode || !lessonById) return;
        loadEditModeData();
    }, [isEditMode, lessonById])

    // Business logic hook
    const {
        getSelectedCount,
        transferSelectedWords,
        updateLessonWord,
        updateMaxReadsLessonWord,
        removeLessonWord,
        calculateEstimatedTime,
        formatEstimatedTime,
        handleCreateLesson,
        handleUpdateLesson
    } = useLessonBuilderLogic({
        data,
        lessonWords,
        courseName,
        selectedUnitsFromModal,
        lessonById,
        setLessonWords,
        setData,
        curriculumOriginalId,
        description
    })

    // Loading state
    // if (mounted && isLoading) {
    //     return (
    //         <Loading
    //             message="Đang tải dữ liệu bài học..."
    //             variant="full-page"
    //         />
    //     )
    // }


    // const [isModalAddWordsOpen, setIsModalAddWordsOpen] = useState(false);
    // const handleOpenModalAddWords = () => {
    //     setIsModalAddWordsOpen(true);
    // }
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Chỉ render Modal trong create mode để tránh fetch không cần thiết */}
            {mode === 'create' && (
                <Modal
                    id={curriculumId}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSuccess={handleModalSuccess}
                />
            )}
            {/* {
                isModalAddWordsOpen && (
                    <ModalAddWords unitId={""} />
                )
            } */}
            <TopNavigation
                isEditMode={isEditMode}
                onOpenModal={() => setIsModalOpen(true)}
            />

            <div className="pt-20 h-screen flex">
                <div className="w-1/3 bg-gray-100 border-r border-gray-300 overflow-y-auto">
                    {lessonByIdLoading ?
                        <div className="h-full flex justify-center items-center"><Loading message="Đang tải dữ liệu..." /></div> : (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Chọn từ vựng</h2>

                                <UnitFilter
                                    units={units}
                                    selectedUnitIds={selectedUnitIds}
                                    setSelectedUnitIds={setSelectedUnitIds}
                                />

                                <WordSelectionPanel
                                    units={units}
                                    selectedUnitIds={selectedUnitIds}
                                    data={data}
                                    expandedChildGroups={expandedChildGroups}
                                    setData={setData}
                                    setExpandedChildGroups={setExpandedChildGroups}
                                    onWordsAdded={async () => {
                                        const result = await refetchLast()
                                        if (result) {
                                            setUnits(result.units)
                                            setData(result.initialData)
                                        }
                                    }}
                                // onOpenModalAddWords={handleOpenModalAddWords}
                                />
                            </div>
                        )}
                </div>

                {/* Middle Panel - Transfer Control */}
                <TransferControl
                    selectedCount={getSelectedCount()}
                    onTransfer={transferSelectedWords}
                />

                {/* Right Panel - Lesson Building */}
                <div className="flex-1 border-l border-gray-300 bg-gray-100 overflow-y-auto">
                    {lessonByIdLoading ?
                        <div className="h-full flex justify-center items-center"><Loading message="Đang tải danh sách từ vựng..." /></div> : (
                            <div className="p-6 flex flex-col gap-6">
                                <LessonHeader
                                    lessonWordsCount={lessonWords.length}
                                    courseName={courseName}
                                    setCourseName={setCourseName}
                                    estimatedTime={formatEstimatedTime(calculateEstimatedTime(lessonWords))}
                                    isEditMode={isEditMode}
                                    onSave={isEditMode ? handleUpdateLesson : handleCreateLesson}
                                    canSave={lessonWords.length > 0 && courseName.trim() !== ''}
                                    description={description}
                                    setDescription={setDescription}
                                />

                                {lessonWords.length === 0 ? (
                                    <EmptyLessonState />
                                ) : (
                                    <LessonWordsTable
                                        lessonWords={lessonWords}
                                        setLessonWords={setLessonWords}
                                        updateLessonWord={updateLessonWord}
                                        updateMaxReadsLessonWord={updateMaxReadsLessonWord}
                                        removeLessonWord={removeLessonWord}
                                    />
                                )}
                            </div>)}
                </div>
            </div>
        </div>
    )
}