"use client"
import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookUnit } from "../../types";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { PDFViewer } from "../../[id]/PDFViewer";
import { Card, CardContent } from "@/components/ui/card";
import SpeechToText from "@/book/speechToText";
// Mock data - in production this would come from a database

interface BookReaderProps {
  book: {
    id: string
    title: string
    author: string
    units: BookUnit[]
    student_book_id: string
  }
  onBack: () => void
  onOpenStudentBook: (bookId: string) => void
}

export default function ControlExercises({ book, onBack, onOpenStudentBook }: BookReaderProps) {
  const [spokenText, setSpokenText] = useState("");
  const [title, setTitle] = useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<BookUnit>(book.units[0])
  const [isSwitchingUnit, setIsSwitchingUnit] = useState(false);

  // Ref để gọi hàm saveNotes từ SpeechToText component
  const saveNotesRef = useRef<(() => Promise<boolean>) | null>(null);

  const handleUnitChange = async (unit: BookUnit) => {
    if (isSwitchingUnit) return; // Prevent multiple clicks

    setIsSwitchingUnit(true);

    // Auto save notes before switching
    if (saveNotesRef.current) {
      console.log('🔄 Đang lưu notes trước khi chuyển unit...');
      const saved = await saveNotesRef.current();

      if (saved) {
        console.log('✅ Đã lưu notes, chuyển sang unit mới');
        setSelectedUnit(unit);
      } else {
        console.log('❌ Không lưu được notes');
        // Still allow switching even if save failed (user might not have content)
        setSelectedUnit(unit);
      }
    } else {
      // No save function available, just switch
      setSelectedUnit(unit);
    }

    setIsSwitchingUnit(false);
  };

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{book.title}</h1>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden relative">
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
          <aside className="w-64 shrink-0 border-r bg-muted/30 ">
            {/* Close Button */}
            <ScrollArea className="h-full">
              <div className="pt-0">
                <div className="flex items-center hover:bg-primary hover:text-white">
                  <h2 className="pl-4 text-sm font-semibold uppercase tracking-wide">Units</h2>
                  <button
                    // variant="ghost"
                    // size="icon"
                    className="flex-1 justify-end cursor-pointer h-10 w-10"
                    onClick={() => setIsLeftPanelOpen(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="">
                  {book.units.map((unit) => (
                    <Button
                      key={unit.id}
                      variant={selectedUnit.id === unit.id ? "default" : "ghost"}
                      className={`w-full justify-start text-left hover:bg-gray-300 cursor-pointer ${selectedUnit.id === unit.id ? "bg-primary text-white" : ""}`}
                      onClick={() => handleUnitChange(unit)}
                      disabled={isSwitchingUnit}
                    >
                      <span className="line-clamp-2 text-sm ">{unit.title}</span>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-300 cursor-pointer"
                    onClick={() => onOpenStudentBook(book.student_book_id)}
                  >
                    <span className="line-clamp-2 text-sm">Xem sách bài học</span>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Spacer - takes remaining space when left panel closed */}
        {/* {!isLeftPanelOpen && <div className="w-16" />} */}

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

        {/* Toggle Button for Right Panel */}
        {!isRightPanelOpen && (
          <Button
            variant="outline"
            size="icon"
            className="mt-4 z-10 bg-white shadow-lg hover:bg-primary "
            onClick={() => setIsRightPanelOpen(true)}
          >
            <ChevronLeft className="" />
          </Button>
        )}

        {/* Right Panel - Speech to Text */}
        {isRightPanelOpen && (
          <aside className="flex-1 max-w-1/3 shrink-0 border-l bg-background flex flex-col">
            <div className="pl-4 border-b flex items-center justify-end">
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
            <div className="border-b w-full flex-1 flex flex-col">
              <SpeechToText
                title={title}
                setTitle={setTitle}
                onTextChange={setSpokenText}
                bookId={book.id}
                unitId={selectedUnit.id}
                saveNotesRef={saveNotesRef}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}