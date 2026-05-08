// /app/lib/courseData.ts

export interface CourseWord {
  wordId: string
  pauseTime: string
  maxReads: string
  showIpa: string
  showWord: string
  showIpaAndWord: string
  readsPerRound: string
  progress: string
}

export interface Course {
  id: string
  name: string
  createdAt: string
  estimatedTime: string
  done: string
  words: CourseWord[]
}

// ✅ Biến giả lập lưu tạm thời trong RAM
export const courses: Course[] = [{
    id: "test-1",
    name: "Khóa học mẫu",
    createdAt: new Date().toISOString(),
    estimatedTime: "30m",
    done: "false",
    words: [
      {
        wordId: "w1",
        pauseTime: "2",
        maxReads: "3",
        showIpa: "1",
        showWord: "1",
        showIpaAndWord: "1",
        readsPerRound: "2",
        progress: "0"
      }
    ]
  }]
