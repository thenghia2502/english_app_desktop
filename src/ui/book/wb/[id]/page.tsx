'use client'
import { useBookPage } from "./useWorkBookPage"
import ControlExercises from "./controlExcerises"

export default function BookPage({
  workbookId,
  onBack,
  onOpenStudentBook,
}: {
  workbookId: string
  onBack: () => void
  onOpenStudentBook: (bookId: string) => void
}) {
  const bookId = workbookId
  const { data: book, isLoading } = useBookPage(bookId)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-muted-foreground">Loading workbook...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
          <p className="text-muted-foreground">The book with ID &quot;{bookId}&quot; does not exist.</p>
        </div>
      </div>
    )
  }

  const normalizedWorkbook: { id: string; title: string; author: string; units: { id: string; title: string; link: string }[]; student_book_id: string } = {
    id: book.id,
    title: book.name,
    author: 'author',
    units: book.units,
    student_book_id: book.student_book_id ?? book.work_book_id ?? '',
  }

  return <ControlExercises book={normalizedWorkbook} onBack={onBack} onOpenStudentBook={onOpenStudentBook} />
}
