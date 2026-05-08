"use client"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Props = {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function AppPagination({ totalPages, currentPage, onPageChange }: Props) {
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)
  }

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={(event) => {
              event.preventDefault()
              if (prevDisabled) return
              goToPage(currentPage - 1)
            }}
            className={prevDisabled ? "pointer-events-none opacity-50" : undefined}
            aria-disabled={prevDisabled}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1

          return (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(page)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={(event) => {
              event.preventDefault()
              if (nextDisabled) return
              goToPage(currentPage + 1)
            }}
            className={nextDisabled ? "pointer-events-none opacity-50" : undefined}
            aria-disabled={nextDisabled}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}