import type { Book } from "./types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, ArrowRight } from "lucide-react"

interface BookCardProps {
  book: Book
  onOpenBook?: (bookId: string) => void
}

export function BookCard({ book, onOpenBook }: BookCardProps) {
  const bookId = book.id || book.title.toLowerCase().replace(/\s+/g, "-")

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={book.image || "/placeholder.svg"}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-balance text-lg font-semibold leading-tight">{book.title}</h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
        <p className="line-clamp-3 text-pretty text-sm text-muted-foreground">{book.description}</p>

        <Button variant="outline" className="w-full bg-transparent" size="sm" onClick={() => onOpenBook?.(bookId)}>
          Read Book
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
      <CardFooter className="flex items-center gap-4 border-t p-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{book.pages} pages</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{book.year}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
