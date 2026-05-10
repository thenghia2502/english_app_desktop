import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appService } from '../../services/AppService'

export interface NoteItem {
    id?: string
    idNote?: string
    title?: string
    content?: string
    [key: string]: unknown
}

export interface UpsertNotePayload {
    unitId: string
    content: string
}

interface ErrorResponseBody {
    message?: string | string[]
}

const getErrorMessage = (errorBody: ErrorResponseBody | null, fallback: string): string => {
    if (!errorBody?.message) return fallback
    if (Array.isArray(errorBody.message)) return errorBody.message.join(', ')
    return errorBody.message
}

const parseJsonSafe = async <T>(response: Response): Promise<T | null> => {
    const text = await response.text()
    if (!text) return null

    try {
        return JSON.parse(text) as T
    } catch {
        return null
    }
}

const fetchNoteById = async (unit_id: string): Promise<NoteItem | null> => {
    try {

        const data = await appService.getNoteById(unit_id)

        return data
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        throw new Error(errorMessage)
    }
}

const upsertNote = async (payload: UpsertNotePayload): Promise<NoteItem | null> => {
    try {
        const data = await appService.upsertNote(payload)

        return data
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        throw new Error(errorMessage)
    }
}

const deleteNoteById = async (idNote: string): Promise<unknown> => {
    try {
        const data = await appService.deleteNoteById(idNote)

        return data
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        throw new Error(errorMessage)
    }
}

export const noteKeys = {
    all: ['notes'] as const,
    details: () => [...noteKeys.all, 'detail'] as const,
    detail: (idNote: string) => [...noteKeys.details(), idNote] as const,
}

export const useNote = (unit_id?: string | null) => {
    const queryKey = unit_id ? noteKeys.detail(unit_id) : noteKeys.details()

    return useQuery({
        queryKey,
        queryFn: () => (unit_id ? fetchNoteById(unit_id) : Promise.resolve(null)),
        enabled: !!unit_id,
    })
}

export const useUpsertNote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: upsertNote,
        onSuccess: async (data, variables) => {
            const keyFromPayload = variables.unitId
            const keyFromResponse =
                typeof data?.idNote === 'string' ? data.idNote : typeof data?.id === 'string' ? data.id : undefined

            const idNote = keyFromPayload || keyFromResponse

            if (idNote) {
                queryClient.setQueryData(noteKeys.detail(idNote), data)
            }

            await queryClient.invalidateQueries({ queryKey: noteKeys.all, refetchType: 'all' })
        },
    })
}

export const useDeleteNote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteNoteById,
        onSuccess: async (_, idNote) => {
            queryClient.removeQueries({ queryKey: noteKeys.detail(idNote) })
            await queryClient.invalidateQueries({ queryKey: noteKeys.all, refetchType: 'all' })
        },
    })
}
