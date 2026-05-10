
import { useWorkBookById } from "@/hooks";

export function useBookPage(bookId: string) {
    const workbookQuery = useWorkBookById(bookId)
    return {
        data: workbookQuery.data as any,
        isLoading: workbookQuery.isLoading,
        error: workbookQuery.error,
    }
}
