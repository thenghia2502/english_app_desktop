export interface Book {
  title: string
  author: string
  description: string
  pages: number
  year: number
  image: string
  id?: string
  units?: BookUnit[]
}

export interface BookLevel {
  level: string
  description: string
  books: Book[]
}

export interface BookUnit {
  id: string
  title: string
  link: string // Google Drive PDF link
}

export interface BookNote {
  id: string
  unitId: string
  content: string
  timestamp: Date
  title?: string
}
