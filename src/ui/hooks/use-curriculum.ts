import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Curriculum, CurriculumPagination } from '@/lib/types'
import { app } from '@tauri-apps/api'
import { appService } from '../../services/AppService'

const normalizeCurriculumPagination = (raw: unknown): CurriculumPagination => {
    const payload = (raw && typeof raw === 'object' && 'data' in raw)
        ? (raw as { data?: unknown }).data
        : raw

    const rows = Array.isArray(payload)
        ? payload
        : (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown }).data)
            ? (payload as { data: unknown[] }).data
            : [])

    const safeRows = rows
        .filter((item): item is Curriculum => !!item && typeof item === 'object')
        .map((item) => ({
            ...item,
            levels: Array.isArray(item.levels) ? item.levels : [],
            units: Array.isArray(item.units) ? item.units : [],
            list_level: Array.isArray(item.list_level) ? item.list_level : [],
            list_unit: Array.isArray(item.list_unit) ? item.list_unit : [],
        }))

    const source = (raw && typeof raw === 'object') ? (raw as Partial<CurriculumPagination>) : {}
    const total = typeof source.meta?.total === 'number' ? source.meta.total : safeRows.length
    const limit = typeof source.meta?.limit === 'number' && source.meta.limit > 0 ? source.meta.limit : Math.max(safeRows.length, 1)
    const page = typeof source.meta?.page === 'number' && source.meta.page > 0 ? source.meta.page : 1
    const totalPages = typeof source.meta?.totalPages === 'number' && source.meta.totalPages > 0
        ? source.meta.totalPages
        : Math.max(1, Math.ceil(total / limit))

    return {
        data: safeRows,
        // total,
        // page,
        // limit,
        // totalPages,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    }
}

const fetchCurriculumOriginalList = async (page?: number, limit?: number, searchQuery?: string): Promise<CurriculumPagination> => {

    const data = await appService.getCurriculums(page, limit, searchQuery) // Thay vì fetch trực tiếp, gọi service để tận dụng caching


    // If the proxy already returned a pagination object
    // if (data && Array.isArray(data.items) && typeof data.page === 'number') return data as CurriculumPagination

    // If wrapped under data.data
    // if (data && data.data && Array.isArray(data.data.items)) return data.data as CurriculumPagination

    // If backend returned a plain array, wrap it
    // if (Array.isArray(data)) {
    //   return {
    //     data: data as Curriculum[],
    //     total: data.length,
    //     page: 1,
    //     limit: data.length,
    //     totalPages: 1,
    //     meta: data.meta
    //   }
    // }

    // If payload contains items but missing metadata, fill defaults
    // if (data && Array.isArray(data.items)) {
    //   const items = data.items as Curriculum[]
    //   const total = data.total ?? items.length
    //   const limit = data.limit ?? items.length
    //   const page = data.page ?? 1
    //   const totalPages = data.totalPages ?? Math.max(1, Math.ceil(total / limit))
    //   return { data, total, page, limit, totalPages, meta: data.meta }
    // }

    // return { data: [], total: 0, page: 1, limit: 0, totalPages: 0, meta: undefined }
    return normalizeCurriculumPagination(data)
}

// const fetchCurriculumCustomList = async (page?: number, limit?: number, searchQuery?: string, curriculumOriginalIds?: string[]): Promise<CurriculumPagination> => {
//   const qs: string[] = []
//   if (typeof page === 'number') qs.push(`page=${page}`)
//   if (typeof limit === 'number') qs.push(`limit=${limit}`)
//   if (searchQuery) qs.push(`search_text=${encodeURIComponent(searchQuery)}`)
//   // include curriculum_original_id multiple times when provided
//   if (Array.isArray(curriculumOriginalIds) && curriculumOriginalIds.length > 0) {
//     curriculumOriginalIds.forEach(id => qs.push(`curriculum_original_id=${encodeURIComponent(id)}`))
//   }
//   const url = `/api/proxy/curriculum_custom${qs.length ? '?' + qs.join('&') : ''}`
//   const response = await apiFetch(url)
//   if (!response.ok) {
//     throw new Error('Failed to fetch curriculums')
//   }
//   const data = await response.json()

//   // If the proxy already returned a pagination object
//   if (data && Array.isArray(data.items) && typeof data.page === 'number') return data as CurriculumPagination

//   // If wrapped under data.data
//   if (data && data.data && Array.isArray(data.data.items)) return data.data as CurriculumPagination

//   // If backend returned a plain array, wrap it
//   if (Array.isArray(data)) {
//     return {
//       data: data as Curriculum[],
//       total: data.length,
//       page: 1,
//       limit: data.length,
//       totalPages: 1,
//       meta: data.meta
//     }
//   }

//   // If payload contains items but missing metadata, fill defaults
//   if (data && Array.isArray(data.items)) {
//     const items = data.items as Curriculum[]
//     const total = data.total ?? items.length
//     const limit = data.limit ?? items.length
//     const page = data.page ?? 1
//     const totalPages = data.totalPages ?? Math.max(1, Math.ceil(total / limit))
//     return { data, total, page, limit, totalPages, meta: data.meta }
//   }

//   return { data: [], total: 0, page: 1, limit: 0, totalPages: 0, meta: undefined }
// }

// const fetchCurriculumCustomById = async (id: string): Promise<Curriculum> => {
//   const response = await fetch(`/api/proxy/curriculum_custom/${id}`)
//   if (!response.ok) {
//     throw new Error(`Failed to fetch custom curriculum ${id}`)
//   }
//   return response.json()
// }

// const fetchCurriculumOriginalById = async (id: string): Promise<{id: string,
//    name: string, 
//    description: string | null, 
//    created_at: string, 
//    updated_at: string, 
//    work_book_id: string, 
//    units: {id: string, title: string, link: string}[]
//   }> => {
//   const data = await appService.getCurriculumById(id) 

//   return data
// }

const fetchCurriculumOriginalById = async (id: string): Promise<Curriculum | null> => {
    const data = await appService.getCurriculumById(id)

    return data
}

// const fetchStudentBookById = async (id: string): Promise<Curriculum | null> => {
//     const data = await appService.getStudentBookByCurriculumId(id)

//     return data
// }

// const fetchWorkBookById = async (id: string): Promise<Curriculum | null> => {
//     const data = await appService.getStudentBookByCurriculumId(id)

//     return data
// }

// Create/update/delete operate on curriculum_custom endpoints
// For creation we accept list_unit as an array of unit ids (string[])
// type CreateCurriculumPayload = { curriculum_original_id: string, name: string, level_id: string, list_unit: string[] }
// const createCurriculumCustom = async (data: CreateCurriculumPayload): Promise<Curriculum> => {
//     const response = await fetch('/api/proxy/curriculum_custom/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//     })
//     if (!response.ok) throw new Error('Failed to create curriculum')
//     return response.json()
// }
// type UpdateCurriculumPayload = { id: string, curriculum_original_id: string, name: string, level_id: string, list_unit: string[] }
// const updateCurriculumCustom = async (data: UpdateCurriculumPayload): Promise<Curriculum> => {
//     const response = await fetch('/api/proxy/curriculum_custom/update', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//     })
//     if (!response.ok) throw new Error('Failed to update curriculum')
//     return response.json()
// }

// const deleteCurriculumCustom = async (id: string): Promise<void> => {
//     const response = await fetch('/api/proxy/curriculum_custom/delete', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id }),
//     })
//     if (!response.ok) throw new Error('Failed to delete curriculum')
// }

export interface WorkbookResponse {
    workbookUrl?: string
    workbookId?: string
    workbook_id?: string
    id_wb?: string
    url?: string
    id: string
    [key: string]: unknown
}

// const getWorkbookById = async (curriculumId: string): Promise<Curriculum> => {
//     const data = await appService.getStudentBookByCurriculumId(curriculumId)

//     return data
// }


// Query keys
export const curriculumKeys = {
    all: ['curriculums'] as const,
    lists: () => [...curriculumKeys.all, 'list'] as const,
    list: (filters?: string) => [...curriculumKeys.lists(), { filters }] as const,
    details: () => [...curriculumKeys.all, 'detail'] as const,
    detail: (id: string) => [...curriculumKeys.details(), id] as const,
    customLists: () => [...curriculumKeys.all, 'custom_list'] as const,
    levels: () => [...curriculumKeys.all, 'levels'] as const,
}

// Hooks
export const useCurriculumOriginal = (
    page?: number,
    limit?: number,
    searchQuery?: string,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["curriculums", page, limit, searchQuery],
        queryFn: () =>
            fetchCurriculumOriginalList(page, limit, searchQuery),
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};

// Hook: get list of curriculum_custom
// export const useCurriculumCustomList = (page?: number, limit?: number, searchQuery?: string, curriculumOriginalIds?: string[], enabled: boolean = true) => {
//   const setCustom = useCurriculumCustomStore(s => s.setPagination)

//   const query = useQuery<CurriculumPagination, Error>({
//     // include searchQuery and curriculumOriginalIds so the query refetches when filters change
//     queryKey: [...curriculumKeys.customLists(), { page, limit, searchQuery, curriculumOriginalIds }],
//     queryFn: ({ queryKey }) => {
//       // queryKey shape: [..., { page, limit, searchQuery, curriculumOriginalIds }]
//       const last = queryKey[queryKey.length - 1] as { page?: number; limit?: number; searchQuery?: string; curriculumOriginalIds?: string[] }
//       return fetchCurriculumCustomList(last?.page, last?.limit, last?.searchQuery, last?.curriculumOriginalIds)
//     },
//     enabled,
//     staleTime: 2 * 60 * 1000, // Increase stale time to 2 minutes to reduce unnecessary refetches
//     retry: 1, // Only retry once on failure
//     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
//   })

//   useEffect(() => {
//     if (query.data) {
//       setCustom(query.data)
//     }
//   }, [query.data, setCustom])

//   return query
// }

// export const useCurriculumOriginalById = (id: string) => {
//     return useQuery<{
//         id: string,
//         name: string,
//         description: string | null,
//         created_at: string,
//         updated_at: string,
//         work_book_id: string,
//         units: { id: string, title: string, link: string }[]
//     }, Error>({
//         queryKey: curriculumKeys.detail(id),
//         queryFn: () => fetchCurriculumOriginalById(id),
//         enabled: !!id,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//     })
// }

export const useCurriculumOriginalById = (id: string) => {
    return useQuery<Curriculum | null, Error>({
        queryKey: curriculumKeys.detail(id),
        queryFn: () => fetchCurriculumOriginalById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useStudentBookById = (id: string) => {
    return useQuery<Curriculum | null, Error>({
        queryKey: [...curriculumKeys.details(), 'student-book', id],
        queryFn: async () => {
            const data = await appService.getStudentBookById(id)
            return data as unknown as Curriculum | null
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

export const useWorkBookById = (id: string) => {
    return useQuery<Curriculum | null, Error>({
        queryKey: [...curriculumKeys.details(), 'work-book', id],
        queryFn: async () => {
            const data = await appService.getWorkBookById(id)
            return data as unknown as Curriculum | null
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

export const useGetWorkbook = (curriculumId: string) => {
    return useQuery<WorkbookResponse | null, Error>({
        queryKey: [...curriculumKeys.detail(curriculumId), 'workbook'],
        queryFn: () => appService.getWorkBookById(curriculumId) as Promise<WorkbookResponse | null>,
        enabled: !!curriculumId,
    })
}

// export const useStudentBookById = (id: string) => {
//     return useQuery<Curriculum | null, Error>({
//         queryKey: curriculumKeys.detail(id),
//         queryFn: () => fetchStudentBookById(id),
//         enabled: !!id,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//     })
// }

// export const useWorkBookById = (id: string) => {
//     return useQuery<Curriculum | null, Error>({
//         queryKey: curriculumKeys.detail(id),
//         queryFn: () => fetchWorkBookById(id),
//         enabled: !!id,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//     })
// }

// export const useCurriculumCustomById = (id: string) => {
//     return useQuery<Curriculum, Error>({
//         queryKey: [...curriculumKeys.details(), 'custom', id],
//         queryFn: () => fetchCurriculumCustomById(id),
//         enabled: !!id,
//         staleTime: 0, // Always refetch to ensure fresh data for edit mode
//         gcTime: 0, // Don't cache data
//         refetchOnMount: true, // Force refetch when component mounts
//         refetchOnWindowFocus: true, // Refetch when window gets focus
//     })
// }

// export const useCreateCurriculumCustom = () => {
//     const queryClient = useQueryClient()
//     const store = useCurriculumCustomStore()

//     return useMutation({
//         mutationFn: createCurriculumCustom,
//         onSuccess: (created: Curriculum) => {
//             // Update store first for immediate UI feedback
//             const currentCurriculums = store.curriculums
//             const next = [...currentCurriculums, created]
//             store.setCurriculums(next)

//             // Invalidate queries to ensure fresh data
//             queryClient.invalidateQueries({
//                 queryKey: curriculumKeys.customLists(),
//                 refetchType: 'all'
//             })
//         },
//         retry: 1, // Only retry once on failure
//     })
// }

// export const useUpdateCurriculumCustom = () => {
//     const queryClient = useQueryClient()
//     const store = useCurriculumCustomStore()

//     return useMutation({
//         mutationFn: updateCurriculumCustom,
//         onSuccess: (data: Curriculum) => {
//             // Update store first for immediate UI feedback
//             store.updateCurriculum(data.id, data)

//             // Update the specific query data in cache
//             queryClient.setQueryData([...curriculumKeys.details(), 'custom', data.id], data)

//             // Invalidate list queries to ensure consistency
//             queryClient.invalidateQueries({
//                 queryKey: curriculumKeys.customLists(),
//                 refetchType: 'all'
//             })
//         },
//         retry: 1, // Only retry once on failure
//     })
// }

// export const useDeleteCurriculumCustom = () => {
//     const queryClient = useQueryClient()
//     const store = useCurriculumCustomStore()

//     return useMutation({
//         mutationFn: deleteCurriculumCustom,
//         onMutate: async (deletedId: string) => {
//             // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
//             await queryClient.cancelQueries({ queryKey: curriculumKeys.customLists() })

//             // Snapshot the previous value
//             const previousData = queryClient.getQueriesData({ queryKey: curriculumKeys.customLists() })

//             // Optimistically update to the new value
//             queryClient.setQueriesData({ queryKey: curriculumKeys.customLists() }, (old: unknown) => {
//                 if (!old) return old
//                 const oldData = old as CurriculumPagination
//                 if (Array.isArray(oldData.data)) {
//                     return { ...oldData, data: oldData.data.filter((item: Curriculum) => item.id !== deletedId) }
//                 }
//                 return old
//             })

//             // Update store immediately
//             store.deleteCurriculum(deletedId)

//             // Return a context object with the snapshotted value
//             return { previousData }
//         },
//         onError: (err, deletedId, context) => {
//             // If the mutation fails, use the context returned from onMutate to roll back
//             if (context?.previousData) {
//                 context.previousData.forEach(([queryKey, data]) => {
//                     queryClient.setQueryData(queryKey, data)
//                 })
//             }
//         },
//         onSettled: () => {
//             // Always refetch after error or success to ensure we have correct data
//             queryClient.invalidateQueries({
//                 queryKey: curriculumKeys.customLists()
//             })
//         },
//         retry: 1, // Only retry once on failure
//     })

// }

// export const useGetWorkbook = (curriculumId: string) => {
//     return useQuery<Curriculum, Error>({
//         queryKey: [...curriculumKeys.detail(curriculumId), 'workbook'],
//         queryFn: () => getWorkbook(curriculumId),
//         enabled: !!curriculumId,
//     })
// }

