"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Curriculum, CurriculumPagination } from '@/lib/types'

type Props = {
  curriculumOriginal?: CurriculumPagination
  searchQuery?: string
  serverPaginated?: boolean
  routerPush: (path: string) => void
  onPageChange?: (page: number) => void
}

export default function CurriculumOriginalList({ curriculumOriginal, searchQuery = '', serverPaginated, routerPush, onPageChange }: Props) {
  const PAGE_SIZE = curriculumOriginal?.meta.limit ?? 16
  const [currentPage, setCurrentPage] = useState<number>(curriculumOriginal?.meta.page ?? 1)

  // Ensure items is always an array to avoid runtime errors
  const itemsFromProp: Curriculum[] = Array.isArray(curriculumOriginal?.data) ? curriculumOriginal!.data : []

  const isServerPaginated = typeof serverPaginated === 'boolean'
    ? serverPaginated
    : (typeof curriculumOriginal?.meta.totalPages === 'number' && curriculumOriginal!.meta.totalPages > 1)

  // For server-paginated mode, use provided data. For client-side, use all items
  const items: Curriculum[] = itemsFromProp

  // Only filter client-side if not server-paginated
  const filtered = isServerPaginated ? items : items.filter(curriculum => {
    if (!searchQuery.trim()) return true
    const searchLower = searchQuery.toLowerCase()
    return curriculum.name.toLowerCase().includes(searchLower) ||
      curriculum.description?.toLowerCase().includes(searchLower)
  })

  // Use provided totalPages or calculate from items
  const totalPages = curriculumOriginal?.totalPages ?? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // If parent provides a different page (e.g., initial load), sync local currentPage
  useEffect(() => {
    if (typeof curriculumOriginal?.meta.page === 'number') setCurrentPage(curriculumOriginal.meta.page)
  }, [curriculumOriginal?.meta.page])

  let paginated: Curriculum[] = []
  if (isServerPaginated) {
    // Backend already returned the items for the current page
    paginated = filtered
  } else {
    const start = (currentPage - 1) * PAGE_SIZE
    paginated = filtered.slice(start, start + PAGE_SIZE)
  }

  // Show loading only if we're waiting for data
  const isPageLoading = false // We don't have a loading state from the hook yet

  return (
    <>
      {/* Fixed-height grid area with internal scrolling */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-auto'>
        {isPageLoading ? (
          <div className="col-span-full text-center py-20">Đang tải trang...</div>
        ) : (
          paginated.map((curriculum, index) => (
            <Card key={`${curriculum.id}+${index}`} className="bg-white shadow-sm border border-gray-200 relative">
              {/* Note: Removed delete button since curriculum_original shouldn't be deletable */}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-black">{curriculum.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="my-2 flex items-center gap-3 text-sm text-gray-600">
                  <Image src='https://macpwgocrmlkwjjhhgzc.supabase.co/storage/v1/object/public/store2/image/Screenshot%202025-11-28%20101724.png' alt="curriculum icon" width={150} height={220}></Image>
                  <div className='flex-1 flex flex-col h-[100%]'>
                    <span>{curriculum.levels?.length || 0} trình độ</span>
                    <span>{curriculum.units?.length || 0} bài học</span>
                    <span>Mô tả: </span>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <Button
                    className='bg-green-600 hover:bg-green-700 text-white flex-1'
                    variant="ghost"
                    size="sm"
                    onClick={() => routerPush(`/lesson/create/${curriculum.id}`)}
                  >
                    Tạo bài học
                  </Button>
                  <Button
                    className='bg-blue-600 hover:bg-blue-700 text-white flex-1'
                    variant="ghost"
                    size="sm"
                    onClick={() => routerPush(`/giaotrinh/view/${curriculum.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-4 text-black">
          <Button variant="outline" size="sm" disabled={currentPage <= 1 || isPageLoading} onClick={() => handlePageChange(1)}>
            First
          </Button>
          <Button variant="outline" size="sm" disabled={currentPage <= 1 || isPageLoading} onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>
            Prev
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={page === currentPage ? 'bg-gray-200' : ''}
                  disabled={isPageLoading}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button variant="outline" size="sm" disabled={currentPage >= totalPages || isPageLoading} onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>
            Next
          </Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages || isPageLoading} onClick={() => handlePageChange(totalPages)}>
            Last
          </Button>
        </div>
      )}
    </>
  )
}