import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Curriculum, CurriculumPagination } from '@/lib/types';
import { appService } from '../../services/AppService';

const extractErrorMessage = (error: unknown): string => {
  if (!error) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || error.name;
  }

  if (typeof error === 'object') {
    const maybeError = error as { message?: unknown; error?: unknown; cause?: unknown };

    if (typeof maybeError.message === 'string' && maybeError.message.trim() !== '') {
      return maybeError.message;
    }
    if (typeof maybeError.error === 'string' && maybeError.error.trim() !== '') {
      return maybeError.error;
    }
    if (typeof maybeError.cause === 'string' && maybeError.cause.trim() !== '') {
      return maybeError.cause;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }

  return String(error);
};

const normalizeCurriculum = (raw: Curriculum | null | undefined): Curriculum | null => {
  if (!raw) {
    return null;
  }

  return {
    ...raw,
    levels: Array.isArray(raw.levels) ? raw.levels : [],
    units: Array.isArray(raw.units) ? raw.units : [],
    list_level: Array.isArray(raw.list_level) ? raw.list_level : [],
    list_unit: Array.isArray(raw.list_unit) ? raw.list_unit : [],
  };
};

// Import fetch functions từ use-curriculum
const fetchCurriculumOriginalList = async (): Promise<CurriculumPagination> => {
  const data = await appService.getCurriculums()
  return data
}

const fetchCurriculumOriginalById = async (id: string): Promise<Curriculum | null> => {
  const data = await appService.getCurriculumById(id)
  return data
}

/**
 * Hook tối ưu thực sự - chỉ fetch data cần thiết
 */
export const useCurriculumConditional = (id?: string) => {
  const normalizedId = typeof id === 'string' ? id.trim() : '';
  const shouldFetchById = !!(normalizedId && normalizedId !== 'undefined' && normalizedId !== 'null');

  // Debug: Track when this hook is called
  console.log('🔍 useCurriculumConditional called with:', { id, shouldFetchById });

  // Chỉ fetch by ID khi có id
  const byIdQuery = useQuery<Curriculum | null, Error>({
    queryKey: ['curriculum', 'detail', normalizedId],
    queryFn: () => fetchCurriculumOriginalById(normalizedId),
    enabled: shouldFetchById,
    staleTime: 5 * 60 * 1000,
  });

  // Chỉ fetch list khi không có id
  const listQuery = useQuery<CurriculumPagination, Error>({
    queryKey: ['curriculum', 'list'],
    queryFn: fetchCurriculumOriginalList,
    enabled: !shouldFetchById,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    if (shouldFetchById) {
      const normalized = normalizeCurriculum(byIdQuery.data);
      const error = byIdQuery.error as unknown;
      return {
        curriculum: normalized,
        curriculums: normalized ? [normalized] : [],
        isLoading: byIdQuery.isLoading,
        error,
        errorMessage: extractErrorMessage(error),
      };
    }

    const normalizedList = (listQuery.data?.data || [])
      .map((item) => normalizeCurriculum(item))
      .filter((item): item is Curriculum => !!item);
    const error = listQuery.error as unknown;

    return {
      curriculum: normalizedList[0] || null,
      curriculums: normalizedList,
      isLoading: listQuery.isLoading,
      error,
      errorMessage: extractErrorMessage(error),
    };
  }, [shouldFetchById, byIdQuery, listQuery]);
};