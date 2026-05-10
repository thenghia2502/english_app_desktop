import { useCurriculumOriginal } from "@/hooks";

export function useCurTab(page = 1, limit = 12, search = "") {
	const { data, isLoading, error } = useCurriculumOriginal(page, limit, search);

	return {
		data,
		isLoading,
		error: error ? String(error) : null,
	};
}