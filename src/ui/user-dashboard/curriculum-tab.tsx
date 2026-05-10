import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, CheckCircle2, Circle, Book, Menu, BookOpenText, EllipsisVertical, Search, ChevronFirst, ChevronLeft } from "lucide-react"
import { useCurriculumOriginalManagement } from "@/components/curriculum-original/useCurriculumOriginalManagement"
import { AppPagination } from "./pagination"
import { useNavigate } from "react-router-dom"

export default function CurriculumTab({
  onCreateLesson,
  onViewCurriculum,
}: {
  onCreateLesson?: (curriculumId: string) => void
  onViewCurriculum?: (curriculumId: string) => void
}) {
  const navigate = useNavigate()
  const {
    isLoading,
    error,
    curriculums,
    stats,
    currentPage,
    pageSize,
    totalPages,
    handlePageChange,
    handleSearch,
    searchTerm
  } = useCurriculumOriginalManagement()

  const safeCurriculums = Array.isArray(curriculums) ? curriculums : []

  // const getLessonCount = (curriculum: (typeof safeCurriculums)[number]) => {
  //   const units = Array.isArray(curriculum.units) ? curriculum.units : []
  //   const listUnits = Array.isArray(curriculum.list_unit) ? curriculum.list_unit : []
  //   return units.length > 0 ? units.length : listUnits.length
  // }


  return (
    <div className="">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Learning Curriculum</h2>
        <p className="text-muted-foreground">Follow our structured path from beginner to advanced</p>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-500">
            Loading curriculums...
          </div>
        ) : error ? (
          <div className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error.message || "An error occurred while fetching curriculums."}
          </div>
        ) : safeCurriculums.length > 0 ? (
          safeCurriculums.map((curriculum) => (
            <div key={curriculum.id} className="group bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img alt="React coding" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" data-alt="Computer screen showing modern react programming code" src={curriculum.link_image || undefined} />
                {/* <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full backdrop-blur-md border border-green-500/20">Published</span>
              </div> */}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {/* <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">CS-401</p> */}
                    <h3 className="text-lg font-bold leading-tight">{curriculum.name}</h3>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-600">
                    <span className="material-symbols-outlined"><EllipsisVertical /></span>
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">Intermediate</span>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-500 text-sm">
                    <span className="material-symbols-outlined text-base"><BookOpenText /></span>
                    <span>{curriculum.units.length} Lessons</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-600 line-clamp-2 mb-4">
                  {curriculum.description}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-400 mb-6">Created {curriculum.created_at ?? "N/A"}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-100">
                  <button className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 rounded-lg transition-colors" onClick={() => onCreateLesson?.(curriculum.id)}>Create Lesson</button>
                  <button className="flex-1 bg-slate-100 dark:bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-200 text-slate-700 dark:text-slate-700 text-sm font-bold py-2 rounded-lg transition-colors" onClick={() => navigate(`/book/${curriculum.id}`)}>View Details</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-500">
            No curriculums found.
          </div>
        )}
      </div>
      <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-200 pt-6">
        <div className="">
          {totalPages >= 1 && (
            <AppPagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
