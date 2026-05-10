"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Save, ChevronLeft, ChevronRight } from "lucide-react"
import type { BookNote } from "../types"
import { useNote, useUpsertNote } from "@/hooks/use-notes"
import { useGetWorkbook, useStudentBookById } from "@/hooks/use-curriculum"
import { PDFViewer } from "./PDFViewer"
import { NotesEditor } from "./NotesEditor"

interface BookReaderProps {
  book: {
    id: string
    name: string
    created_at: string
    updated_at: string
    description: string
    work_book_id: string
    units: { id: string, title: string, link: string }[]
  }
  onBack: () => void
  onOpenWorkbook: (workbookId: string) => void
}

export function BookReader({ book, onBack, onOpenWorkbook }: BookReaderProps) {
  const upsertNoteMutation = useUpsertNote()
  // const workbookQuery = useStudentBookById(book?.id)
  const [selectedUnit, setSelectedUnit] = useState<{ id: string, title: string, link: string } | null>(book?.units?.[0] ?? null)
  const noteQuery = useNote(selectedUnit?.id)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [savedNotes, setSavedNotes] = useState<BookNote[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!selectedUnit && Array.isArray(book?.units) && book.units.length > 0) {
      setSelectedUnit(book.units[0])
    }
  }, [book, selectedUnit])

  // Load note from query when unit changes
  useEffect(() => {
    if (noteQuery.isLoading) return

    if (noteQuery.isError) {
      console.error('Failed to load notes:', noteQuery.error)
      return
    }

    const data = noteQuery.data as
      | {
        data?: { title?: string; content?: string }
        title?: string
        content?: string
      }
      | null
      | undefined

    const noteData = data?.data ?? data
    const loadedText = noteData?.content || ""
    const loadedTitle = noteData?.title || ""

    setText(loadedText)
    setTitle(loadedTitle)
    if (!selectedUnit) return
    setNotes((prev) => ({
      ...prev,
      [selectedUnit.id]: loadedText,
    }))
  }, [noteQuery.data, noteQuery.error, noteQuery.isError, noteQuery.isLoading, selectedUnit?.id])

  const handleSaveNote = async () => {
    if (!selectedUnit) return
    if (!text.trim()) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const result = await upsertNoteMutation.mutateAsync({
        unitId: selectedUnit.id,
        content: text,
      })

      if ((result as { success?: boolean } | null)?.success !== false) {
        const newNote: BookNote = {
          id: Date.now().toString(),
          unitId: selectedUnit.id,
          content: text,
          timestamp: new Date(),
          title: title
        }
        setSavedNotes([...savedNotes, newNote])
        setSaveMessage({ type: 'success', text: `Note saved for ${selectedUnit.title}!` })

        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({
          type: 'error',
          text: (result as { error?: string } | null)?.error || 'Failed to save note',
        })
      }
    } catch (error) {
      console.error('Error saving note:', error)
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGetWorkbook = () => {
    // const workbook = workbookQuery.data

    const rawRef = book.work_book_id

    if (!rawRef) {
      console.error('Workbook id/url is not available')
      return
    }

    const match = rawRef.match(/\/book\/wb\/([^/?#]+)/)
    const workbookId = match?.[1] || rawRef.split('/').filter(Boolean).pop() || rawRef

    onOpenWorkbook(workbookId)
  }

  if (!book || !Array.isArray(book.units) || book.units.length === 0 || !selectedUnit) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-muted-foreground">No units available for this book.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{book.name}</h1>
              <p className="text-sm text-muted-foreground">author</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toggle Button for Left Panel */}
        {!isLeftPanelOpen && (
          <Button
            variant="outline"
            size="icon"
            className="mt-4 z-10 bg-white shadow-lg hover:bg-primary "
            onClick={() => setIsLeftPanelOpen(true)}
          >
            <ChevronRight className="" />
          </Button>
        )}

        {/* Left Panel - Units List */}
        {isLeftPanelOpen && (
          <aside className="w-64 flshrink-0 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-4 pt-0">
                <div className="flex items-center">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Units</h2>
                  <button
                    // variant="ghost"
                    // size="icon"
                    className="flex-1 justify-end h-10 w-10"
                    onClick={() => setIsLeftPanelOpen(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {book.units.map((unit) => (
                    <React.Fragment key={unit.id}>
                      <Button
                        key={unit.id}
                        variant={selectedUnit?.id === unit.id ? "default" : "ghost"}
                        className={`w-full justify-start text-left hover:bg-gray-300 cursor-pointer ${selectedUnit?.id === unit.id ? "bg-primary text-white" : ""}`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <span className="line-clamp-2 text-sm">{unit.title}</span>
                      </Button>
                      {/* <Button
                      variant={"default"}
                      className="w-full justify-start text-left hover:bg-gray-300 cursor-pointer"
                      onClick={() => router.push(`/book/wb/${book.id_wb}`)}
                    >
                      Xem bài tập
                    </Button> */}
                    </React.Fragment>
                  ))}
                  <Button
                    variant={"ghost"}
                    className="w-full justify-start text-left hover:bg-gray-300 cursor-pointer"
                    onClick={handleGetWorkbook}
                  // disabled={workbookQuery.isLoading}
                  >
                    {/* {workbookQuery.isLoading ? 'Đang tải sách bài tập...' : 'Xem sách bài tập'} */}
                    {'Xem sách bài tập'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Middle Panel - PDF Viewer
        <main className="w-[1100px] bg-muted/10">
          <div className="h-full p-4">
            <Card className="h-full">
              <CardContent className="h-[calc(100%)] p-0">
                <PDFViewer pdfUrl={selectedUnit.pdfUrl} title={selectedUnit.title} />
              </CardContent>
            </Card>
          </div>
        </main> */}

        {/* Middle Panel - PDF Viewer - Fixed width */}
        <main className="flex-1 shrink-0 bg-muted/10">
          <div className="h-full p-4">
            <Card className="h-full">
              <CardContent className="h-[calc(100%)] p-0">
                <PDFViewer pdfUrl={selectedUnit.link} title={selectedUnit.title} />
              </CardContent>
            </Card>
          </div>
        </main>

        {!isRightPanelOpen && (
          <Button
            variant="outline"
            size="icon"
            className="mt-4 z-10 bg-white shadow-lg hover:bg-primary "
            onClick={() => setIsRightPanelOpen(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Right Panel - Notes */}
        {isRightPanelOpen && (
          <aside className="flex-1 max-w-1/3 shrink-0 border-l bg-background flex flex-col">
            <div className="flex h-full flex-col">
              <div className="border-b flex justify-end">
                <Button
                  variant="default"
                  size="icon"
                  className=" justify-center cursor-pointer"
                  onClick={() => setIsRightPanelOpen(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Note Input */}
              <div className="border-b p-4 h-full flex flex-col">
                <div className="mb-3 flex-1">
                  <NotesEditor
                    value={text}
                    onChange={(content: string) => {
                      setText(content)
                      setNotes((prev) => ({
                        ...prev,
                        [selectedUnit.id]: content,
                      }))
                    }}
                    placeholder="Write your notes here..."
                    className="bg-white "
                  />
                </div>

                <Button
                  onClick={handleSaveNote}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  disabled={!text.trim() || isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Note'}
                </Button>
              </div>

            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
