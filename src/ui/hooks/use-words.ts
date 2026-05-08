import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Word } from '@/lib/types'
import { appService } from '../../services/AppService'

// API functions
const fetchWords = async (): Promise<Word[]> => {
  return await appService.getWords()
}

const fetchWordById = async (id: string): Promise<Word | null> => {
  return await appService.getWordById(id)
}

const fetchWordsByLevel = async (levelId: string): Promise<Word[]> => {
  return appService.getWordsByLevel(levelId)
}

const createWord = async (data: Omit<Word, 'id'>): Promise<Word> => {
  return appService.createWord(data)
}

// const updateWord = async ({ id, ...data }: Partial<Word> & { id: string }): Promise<Word> => {
//   return appService.updateWord({ ...data, wordId: id })
// }

// const deleteWord = async (id: string): Promise<void> => {
//   return appService.deleteWordById(id)
// }

// Query keys
export const wordKeys = {
  all: ['words'] as const,
  lists: () => [...wordKeys.all, 'list'] as const,
  list: (filters: string) => [...wordKeys.lists(), { filters }] as const,
  details: () => [...wordKeys.all, 'detail'] as const,
  detail: (id: string) => [...wordKeys.details(), id] as const,
  byLevel: (levelId: string) => [...wordKeys.all, 'level', levelId] as const,
  byLevelList: (levelId: string) => [...wordKeys.all, 'level-list', levelId] as const,
}

// Hooks
export const useWords = () => {
  return useQuery({
    queryKey: wordKeys.lists(),
    queryFn: fetchWords,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useWord = (id: string) => {
  return useQuery({
    queryKey: wordKeys.detail(id),
    queryFn: () => fetchWordById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useWordsByLevel = (levelId: string) => {
  return useQuery({
    queryKey: wordKeys.byLevel(levelId),
    queryFn: () => fetchWordsByLevel(levelId),
    enabled: !!levelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useWordsListByLevel = (levelId: string) => {
  return useQuery({
    queryKey: wordKeys.byLevelList(levelId),
    queryFn: () => fetchWordsByLevel(levelId),
    enabled: !!levelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateWord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wordKeys.lists() })
    },
  })
}

// export const useUpdateWord = () => {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: updateWord,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: wordKeys.lists() })
//       if (data.id) {
//         queryClient.setQueryData(wordKeys.detail(data.id), data)
//       }
//     },
//   })
// }

// export const useDeleteWord = () => {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: deleteWord,
//     onSuccess: (_, deletedId) => {
//       queryClient.invalidateQueries({ queryKey: wordKeys.lists() })
//       queryClient.removeQueries({ queryKey: wordKeys.detail(deletedId) })
//       // Invalidate all level queries since we don't know which level the deleted word belonged to
//       queryClient.invalidateQueries({ queryKey: wordKeys.all })
//     },
//   })
// }
