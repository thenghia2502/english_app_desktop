import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Search } from "lucide-react"
import { useLessonTab } from "./use-lesson-tab"
import { AppPagination } from "./pagination"
import { LessonWord } from "@/lib/types"

type LessonLevel = {
    id: string
    name: string
}

type DashboardLesson = {
    id: string
    name: string
    category?: string
    description?: string
    levels: LessonLevel[]
    words: LessonWord[]
    duration: number
    created_at: string
    updated_at: string
    progress: number | string
}

function msToHMSLabel(s: number): string {
    if (s <= 0) return '0 sec';


    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} min`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec`);

    return parts.join(' ');
}


const getLevelColor = (level: string) => {
    switch (level) {
        case "Beginner":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        case "Intermediate":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        case "Advanced":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
}

export default function LessonsTab() {
    const {
        // lessons,
        isLoading,
        error,
        startLearning,
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        setPage,
        page,
        data,
        totalPages
    } = useLessonTab()

    const lessons = Array.isArray(data?.data) ? data.data : []

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">Your Lessons</h2>
                <p className="text-muted-foreground">Continue your learning journey and master new skills</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="space-y-4 mb-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search lessons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Sort Options */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={sortOption === "newest" ? "default" : "outline"}
                        onClick={() => setSortOption("newest")}
                        size="sm"
                    >
                        Newest
                    </Button>
                    <Button
                        variant={sortOption === "oldest" ? "default" : "outline"}
                        onClick={() => setSortOption("oldest")}
                        size="sm"
                    >
                        Oldest
                    </Button>
                    <Button
                        variant={sortOption === "progress-asc" ? "default" : "outline"}
                        onClick={() => setSortOption("progress-asc")}
                        size="sm"
                    >
                        Progress: Low to High
                    </Button>
                    <Button
                        variant={sortOption === "progress-desc" ? "default" : "outline"}
                        onClick={() => setSortOption("progress-desc")}
                        size="sm"
                    >
                        Progress: High to Low
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">Loading lessons...</p>
                    </div>
                ) : lessons.map((lesson) => {
                    // const levels = Array.isArray(lesson.levels) ? lesson.levels : []
                    // const words = Array.isArray(lesson.words) ? lesson.words : []

                    return (
                        <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-1">{lesson.name}</CardTitle>
                                        {/* <div className="flex gap-2">
                                            {levels.map((level: LessonLevel) => (
                                                <Badge key={level.id} className={`${getLevelColor(level.name)} border-0`}>{level.name}</Badge>
                                            ))}
                                        </div> */}
                                    </div>
                                    <span className="text-xs bg-prima mt-6ry/10 text-primary px-2 py-1 rounded font-semibold">
                                        {lesson.category}
                                    </span>
                                </div>
                                <CardDescription>description:{lesson.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {/* <div>
                                        Từ:
                                        {(() => {
                                            return words.slice(0, 2).map((cw: LessonWord) => (
                                                <Badge key={cw.id} variant="outline" className="text-xs text-gray-900">
                                                    {cw.word}
                                                </Badge>
                                            ))
                                        })()}
                                        {(() => {
                                            return words.length > 2 ? (
                                                <Badge variant="outline" className="text-xs text-gray-900">
                                                    +{words.length - 2} từ khác
                                                </Badge>
                                            ) : null
                                        })()}
                                    </div> */}
                                    Số từ: <span className="font-medium text-foreground">{lesson.words_count}</span>
                                    <Clock className="w-4 h-4" />
                                    <span>{msToHMSLabel(lesson.duration)}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Created at: </span>
                                    <span className="text-sm font-medium text-foreground">{new Date(lesson.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Updated at: </span>
                                    <span className="text-sm font-medium text-foreground">{new Date(lesson.updated_at).toLocaleDateString()}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-semibold text-foreground">{lesson.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all"
                                            style={{ width: `${lesson.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full gap-2 mt-2" onClick={() => startLearning({ id: lesson.id } as any)}>
                                    <Play className="w-4 h-4" />
                                    {Number(lesson.progress) === 100 ? "Review" : Number(lesson.progress) === 0 ? "Start" : "Continue"}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            <div className="mt-6">
                {totalPages > 1 && (
                    <AppPagination
                        totalPages={totalPages}
                        currentPage={page}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    )
}
