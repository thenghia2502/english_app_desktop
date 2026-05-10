import { useState, useMemo, useEffect } from 'react'
import { useCurriculumOriginal } from '../../hooks'


export function useCurriculumOriginalManagement() {

    // State for search and filtering
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedIds, setSelectedIds] = useState<String[]>([])

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(16)

    // Fetch data using existing hook with pagination
    const { data, isLoading: curriculumsLoading, error: curriculumsError, refetch } = useCurriculumOriginal(currentPage, pageSize, searchTerm)
    // const { data, isLoading: curriculumsLoading, error: curriculumsError } = useGetCurriculums(searchTerm, currentPage, pageSize)

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const safeCurriculumData = data?.data ?? []

    // Initialize selected IDs with all curriculums when data loads
    useEffect(() => {
        if (safeCurriculumData.length > 0 && selectedIds.length === 0) {
            setSelectedIds(safeCurriculumData.map(c => c.id))
        }
    }, [safeCurriculumData, selectedIds.length])

    // Since we're using server-side search, don't filter again client-side
    const filteredCurriculums = safeCurriculumData

    // Get selected curriculums
    const selectedCurriculums = useMemo(() => {
        return filteredCurriculums.filter(curriculum =>
            selectedIds.includes(curriculum.id)
        )
    }, [filteredCurriculums, selectedIds])

    // Actions
    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSelectAll = () => {
        setSelectedIds(filteredCurriculums.map(c => c.id))
    }

    const handleDeselectAll = () => {
        setSelectedIds([])
    }

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        )
    }

    const handleEdit = (id: string) => {

    }

    const handleView = (id: string) => {

    }

    const handleCreateLesson = (id: string) => {

    }

    const handleRefresh = () => {
        refetch()
    }

    // Computed stats
    const stats = useMemo(() => {
        const total = data?.meta.total
        const selected = selectedIds.length
        const filtered = filteredCurriculums.length

        return {
            total,
            selected,
            filtered,
            // totalUnits: filteredCurriculums.reduce((sum: number, c) => sum + (c.list_unit?.length || 0), 0),
            totalUnits: data?.data ? data.data.reduce((sum: number, c) => sum + ((c as any).unit_count || 0), 0) : 0,
            totalLevels: data?.data ? data.data.reduce((sum: number, c) => sum + (c.levels?.length || 0), 0) : 0,
            totalPages: data?.meta.totalPages
        }
    }, [data?.meta.total, data?.meta.totalPages, selectedIds.length, filteredCurriculums.length, filteredCurriculums])

    const meta = data?.meta
    return {
        // Data
        curriculums: filteredCurriculums,
        selectedCurriculums,
        stats,
        meta,

        // Pagination
        currentPage,
        pageSize,
        totalPages: data?.meta.totalPages || 1,

        // State
        searchTerm,
        selectedIds,
        isLoading: curriculumsLoading,
        error: curriculumsError,

        // Actions
        handleSearch,
        handlePageChange,
        handleSelectAll,
        handleDeselectAll,
        handleToggleSelect,
        handleEdit,
        handleView,
        handleCreateLesson,
        handleRefresh,

        // Utilities
        isSelected: (id: string) => selectedIds.includes(id),
        isAllSelected: selectedIds.length === filteredCurriculums.length && filteredCurriculums.length > 0,
        isPartiallySelected: selectedIds.length > 0 && selectedIds.length < filteredCurriculums.length
    }
}