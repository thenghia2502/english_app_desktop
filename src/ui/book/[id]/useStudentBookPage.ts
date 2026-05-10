
import { useStudentBookById, useWorkBookById } from "@/hooks";

export function useBookPage(bookId: string) {
    const studentBookQuery = useStudentBookById(bookId)
    return {
        data: studentBookQuery.data as any,
        isLoading: studentBookQuery.isLoading,
        error: studentBookQuery.error,
    }
}
