import { BookList } from "./bookList"
import type { BookLevel } from "./types"

const booksData: BookLevel[] = [
  {
    level: "Beginner",
    description: "Perfect for those just starting their English learning journey",
    books: [
      {
        id: "english-grammar-in-use",
        title: "American Family and Friends 3 SB 2nd Edition",
        author: "Raymond Murphy",
        description: "A self-study reference and practice book for elementary learners",
        pages: 380,
        year: 2019,
        image: "/english-grammar-book-cover-blue.jpg",
      }
    ],
  },
  {
    level: "Intermediate",
    description: "Enhance your skills and build confidence in English communication",
    books: [
      {
        id: "english-grammar-in-use",
        title: "American Family and Friends 3 SB 2nd Edition",
        author: "Michael McCarthy",
        description: "Vocabulary reference and practice for upper-intermediate learners",
        pages: 316,
        year: 2017,
        image: "/vocabulary-book-cover-green.jpg",
      }
    ],
  },
  {
    level: "Advanced",
    description: "Master complex language structures and achieve fluency",
    books: [
      {
        id: "advanced-grammar-in-use",
        title: "Advanced Grammar in Use",
        author: "Martin Hewings",
        description: "A self-study reference and practice book for advanced learners",
        pages: 304,
        year: 2020,
        image: "/advanced-grammar-book-dark-blue.jpg",
      },
      {
        id: "academic-vocabulary-in-use",
        title: "Academic Vocabulary in Use",
        author: "Michael McCarthy",
        description: "Vocabulary for academic purposes and IELTS preparation",
        pages: 176,
        year: 2018,
        image: "/academic-vocabulary-book-teal.jpg",
      },
      {
        id: "cambridge-english-advanced",
        title: "Cambridge English Advanced",
        author: "Cambridge University Press",
        description: "Complete preparation for the CAE examination",
        pages: 256,
        year: 2021,
        image: "/cambridge-cae-book-burgundy.jpg",
      },
    ],
  },
  {
    level: "Proficiency",
    description: "Achieve native-like mastery of the English language",
    books: [
      {
        id: "cambridge-english-proficiency",
        title: "Cambridge English Proficiency",
        author: "Cambridge University Press",
        description: "Comprehensive preparation for the CPE examination",
        pages: 232,
        year: 2020,
        image: "/cambridge-cpe-book-gold.jpg",
      },
      {
        id: "the-elements-of-style",
        title: "The Elements of Style",
        author: "William Strunk Jr.",
        description: "The classic guide to writing clear and elegant English",
        pages: 105,
        year: 2018,
        image: "/elements-of-style-book-classic.jpg",
      },
    ],
  },
]

export default function Home({ onOpenBook }: { onOpenBook: (bookId: string) => void }) {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-black">Book list</h1>
            {/* <Button 
                      onClick={() => router.push("/user-dashboard")} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Quản lý bài học
                    </Button> */}
          </div>
        </div>
      </nav>
      <div className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:py-16">

        <BookList levels={booksData} onOpenBook={onOpenBook} />
      </div>
    </main>
  )
}
