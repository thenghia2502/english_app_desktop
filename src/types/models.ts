export interface Word {
  word_id?: string
  id?: string
  word?: string
  word_text?: string
  text?: string
  word_meaning?: string
  meaning?: string
  word_ipa?: string
  ipa_uk?: string
  ipa_us?: string
  selected?: boolean
  done?: boolean
  word_popularity?: number
  belong?: string
  word_parent_id?: string
  lesson_ids?: string[]
  lesson_names?: string[]
  children?: Word[]
  children_count: number
}

export interface Lesson {
  id: string
  name: string
  words: LessonWord[]
  order: number
  created_at: string
  updated_at: string
  description?: string
  estimatedTime?: string
  progress: string
  curriculum: {
    curriculum_name: string
  }
  curriculum_custom_id: string
  units: {
    // level: {
    //     level_id: string
    //     level_name: string
    //     level_code: string
    // }
    // words: {
    //     word_id: string
    //     word: string
    //     word_meaning: string
    // }[]
    id: string
    name: string
  }[],
  unit_ids?: string[]  // Support for old API format
}

export interface LessonWord {
  id: string
  word: string,
  word_meaning: string,
  word_pause_time: string
  word_max_read: string
  word_show_ipa: string
  word_show_word: string
  word_show_ipa_and_word: string
  word_reads_per_round: string
  word_progress: string
  word_popularity: number
  word_parent_id: string
  uk_ipa: string
  us_ipa: string
  example?: string
  audioUrl?: string
  meaning?: string  // Fallback field từ API response
}

export interface UpdateLessonPayload {
  lesson_id: string
  name: string
  order: number
  unit_ids: string[]
  words: {
    word_id: string
    word_progress: number
    word_pause_time: number
  }[]
}
export interface CourseWord {
  id: string
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
  words: CourseWord[]
  createdAt: string
  estimatedTime: string
  done: string
  lessonListId: string
}

export type FormValues = {
  name: string
  curriculum: string
  levelId: string
  listSelectedUnit: string[] // hoặc number[]
}

export type Unit = {
  unit_id: string
  unit_name: string
  unit_title?: string
  unit_words: {
    original: {
      word_id: string;
      word_text: string;
      word_meaning?: string;
      word_ipa?: string;
      word_popularity?: number;
      word_parent_id?: string | null;
      children_count: number;
    }[]
    custom: {
      word_id: string;
      word_text: string;
      word_meaning?: string;
      word_ipa?: string;
      word_popularity?: number;
      word_parent_id?: string | null;
      children_count: number;
    }[]
  }
}

export interface Level {
  // id: string
  // name: string
  // description?: string
  // units?: Array<{
  //     id: string
  //     name: string
  //     content?: string
  // }>
  level_id: string
  level_name: string
  // level_code: string
  // level_description?: string
}

export interface LevelShort {
  id: string
  name: string
}

export interface Curriculum {
  id: string
  name: string
  work_book_id: string
  description?: string
  list_level?: Level[]
  list_unit?: Unit[]
  created_at?: string
  updated_at?: string
  link_image?: string
  level?: {
    level_id: string
    level_name: string
    level_code: string
    level_description?: string
  }
  levels: {
    level_id: string
    level_name: string
    level_code: string
    level_description?: string
  }[]
  units: {
    unit_title: string
    unit_id: string
    unit_name: string
    unit_description?: string
    unit_order?: number
    level_id: string
    level_name: string
    level_code: string
    level_description?: string
    words: {
      word_id: string
      word: string
      word_meaning: string
      word_ipa?: string
      word_parent_id?: string
      word_popularity?: number
    }[]
  }[]
  unit_count?: number
}

export interface LessonList {
  id: string
  name: string
  id_curriculum: string
  id_level: string
  list_exercise: string[]
}

export interface CurriculumPagination {
  data: Curriculum[]
  total: number
  page: number
  limit: number
  totalPages: number
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface LocalWord extends Word {
  selected: boolean
  done: boolean
  word_popularity?: number
  belong?: string
  word_ipa?: string
}

export interface LessonWithWords {
  id: string
  title: string
  words: LocalWord[]
}

export interface LessonBuilderHookReturn {
  // Selection logic
  getSelectedCount: () => number
  transferSelectedWords: () => void

  // Word management
  updateLessonWord: (wordId: string, field: keyof LessonWord, value: string) => void
  updateMaxReadsLessonWord: (wordId: string, value: string) => void
  removeLessonWord: (wordId: string) => void

  // Lesson operations
  handleCreateLesson: () => Promise<void>
  handleUpdateLesson: () => Promise<void>

  // Utilities
  calculateEstimatedTime: () => string
}

export interface LessonBuilderState {
  // Data states
  data: { [key: string]: LocalWord[] }
  lessonsFiltered: LessonWithWords[]
  lessonWords: LessonWord[]

  // UI states
  courseName: string
  selectedUnitIds: string[]
  expandedChildGroups: Set<string>

  // Flags
  isEditMode: boolean
  mounted: boolean
}
