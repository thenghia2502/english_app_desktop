import { useQuery, useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { ApiUnitData, ApiWordData, Unit, Word } from "@/lib/types";
import { LocalWord } from "../lib/types";
import { appService } from '../../services/AppService';

interface FetchUnitsResult {
    units: ApiUnitData[];
    initialData: { [key: string]: LocalWord[] };
}

const fetchUnitsByIds = async (unitIds: string[]): Promise<FetchUnitsResult> => {
    const response = await appService.getWordsByUnitId(unitIds);

    const wordsData = Array.isArray(response) ? response : [];

    if (wordsData.length === 0) {
        throw new Error('No words data returned from API');
    }

    const transformedUnits: ApiUnitData[] = [];
    const initialDataLocal: { [key: string]: LocalWord[] } = {};

    wordsData.forEach((unitData: ApiUnitData) => {
        // Handle both array format (from /api/words/by_units) and object format (from backend)
        const unitWords = unitData.unit_words;
        const original: ApiWordData[] = Array.isArray(unitWords)
            ? unitWords
            : (unitWords.original || []);
        const custom: ApiWordData[] = Array.isArray(unitWords)
            ? []
            : (unitWords.custom || []);

        const root_original = original.map((w: ApiWordData): Word => ({
            id: w.id,
            word: (w as unknown as { word?: string }).word ?? w.word,
            meaning: w.meaning || '-',
            ipa: w.ipa,
            popularity: w.popularity || 0,
            parent_id: undefined,
            children_count: w.children_count
        }));

        const root_custom = custom.map((w: ApiWordData): Word => ({
            id: w.id,
            word: (w as unknown as { word?: string }).word ?? w.word,
            meaning: w.meaning || '-',
            ipa: w.ipa,
            popularity: w.popularity || 0,
            parent_id: undefined,
            children_count: w.children_count
        }));

        transformedUnits.push({
            unit_id: unitData.unit_id,
            unit_name: unitData.unit_name,
            unit_words: {
                original: root_original,
                custom: root_custom
            }
        });

        const list: LocalWord[] = [];
        const allRoots: ApiWordData[] = [...original, ...custom];

        allRoots.forEach((w: ApiWordData) => {
            list.push({
                id: w.id,
                word: (w as unknown as { word?: string }).word ?? w.word,
                meaning: w.meaning || '-',
                ipa: w.ipa || '-',
                popularity: w.popularity || 0,
                parent_id: undefined,
                selected: false,
                done: false,
                belong: '',
                children_count: w.children_count
            });
        });

        const uniqueMap = new Map<string, LocalWord>();
        for (const lw of list) {
            if (!uniqueMap.has(lw.id)) uniqueMap.set(lw.id, lw);
        }
        initialDataLocal[unitData.unit_id] = Array.from(uniqueMap.values());
    });

    return { units: transformedUnits, initialData: initialDataLocal };
};

export function useFetchUnitsByIds(unitIds?: string[], enabled: boolean = true) {
    const lastUnitIdsRef = useRef<string[] | null>(null);

    // Use mutation for on-demand fetching
    const mutation = useMutation({
        mutationFn: (ids: string[]) => {
            lastUnitIdsRef.current = ids;
            return fetchUnitsByIds(ids);
        },
    });

    // Use query for automatic fetching when unitIds is provided
    const query = useQuery({
        queryKey: ['units', unitIds],
        queryFn: () => {
            if (unitIds) {
                lastUnitIdsRef.current = unitIds;
            }
            return fetchUnitsByIds(unitIds!);
        },
        enabled: enabled && !!unitIds && unitIds.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // If unitIds is provided, use query mode
    if (unitIds && unitIds.length > 0) {
        return {
            units: query.data?.units || [],
            initialData: query.data?.initialData || {},
            isLoadingUnits: query.isLoading,
            unitsError: query.error?.message || null,
            refetch: query.refetch,
            fetchUnitsByIds: (ids: string[]) => fetchUnitsByIds(ids),
            refetchLast: async (): Promise<FetchUnitsResult | null> => {
                const result = await query.refetch();
                return result.data || null;
            }
        };
    }

    // Otherwise, use mutation mode for manual fetching
    return {
        units: mutation.data?.units || [],
        initialData: mutation.data?.initialData || {},
        isLoadingUnits: mutation.isPending,
        unitsError: mutation.error?.message || null,
        refetch: () => { },
        fetchUnitsByIds: async (ids: string[]) => {
            const result = await mutation.mutateAsync(ids);
            return result;
        },
        refetchLast: async (): Promise<FetchUnitsResult | null> => {
            if (!lastUnitIdsRef.current) return null;
            const result = await mutation.mutateAsync(lastUnitIdsRef.current);
            return result;
        }
    };
}
