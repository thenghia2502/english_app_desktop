import { invoke } from "@tauri-apps/api/core";
import { Lesson, Unit } from "../types/models";
import { ApiUnitData, Curriculum, CurriculumPagination, LessonListResponse, Word } from "@/lib/types";
import { NoteItem, UpsertNotePayload } from "@/hooks/use-notes";

interface UpdateLessonPayload {
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

export class AppRepository {
  initDb(): Promise<void> {
    return invoke("init_db");
  }

  getCurriculums(page?: number, limit?: number, searchQuery?: string): Promise<CurriculumPagination> {
    return invoke("get_curriculums", { page, limit, searchQuery });
  }

  getCurriculumById(curriculumId: string): Promise<Curriculum | null> {
    return invoke("get_curriculum_by_id", { curriculumId });
  }

  addWordsToUnit(unitId: string, wordIds: string[]): Promise<boolean> {
    return invoke("add_words_to_unit", { unitId, wordIds });
  }

  checkWordToUnit(unitId: string, wordId: string): Promise<boolean> {
    return invoke("check_word_to_unit", { unitId, wordId });
  }

  createLessonWithUnits(
    name?: string,
    order?: number,
    words?: {
      "word_id": string,
      "word_max_read": number,
      "word_show_ipa": number,
      "word_show_word": number,
      "word_show_ipa_and_word": number,
      "word_reads_per_round": number,
      "word_pause_time": number
    }[], unit_ids?: string[], curriculum_original_id?: string,
    description?: string,
    duration?: number
  ): Promise<Lesson> {
    return invoke("create_lesson_with_units", {
      name,
      words,
      unitIds: unit_ids,
      curriculumId: curriculum_original_id,
      category: "Vocabulary",
      description: description || "",
      duration: duration || 0,
    });
  }

  deleteLesson(lessonId: string): Promise<boolean> {
    return invoke("delete_lesson", { lessonId });
  }

  updateLessonDetail(
    payload: {
      lessonId: string,
      words: {
        word_id: string,
        word_progress: string,
        word_max_read: string,
        word_show_ipa: string,
        word_show_word: string,
        word_show_ipa_and_word: string,
        word_reads_per_round: string,
        word_pause_time: string
      }[]
    }): Promise<Lesson> {
    return invoke("update_lesson_detail", {
      lessonId: payload.lessonId,
      words: payload.words
    });
  }

  updateLessonProgress(
    lessonId: string,
    name: string,
    order: number,
    unitIds: string[],
    words: Array<{ word_id: string; word_progress?: number; word_pause_time?: number }>
  ): Promise<Lesson> {
    return invoke("update_lesson_progress", {
      lessonId,
      name,
      order,
      unitIds,
      words
    });
  }

  getChildrenWords(
    wordId: string
  ): Promise<Array<{ word_id: string; word: string; ipa?: string; meaning?: string; parent_id?: string }>> {
    return invoke("get_children_words", { wordId });
  }

  getChildrenWordsByParentId(
    parentWordId: string
  ): Promise<Array<{
    word_id: string;
    word: string;
    ipa?: string;
    meaning?: string;
    parent_id?: string;
    word_popularity: number;
    children_count: number;
    custom: number;
  }>> {
    return invoke("get_children_words_by_parent_id", { parentWordId });
  }

  getLessonById(
    lessonId: string,
  ): Promise<Lesson> {
    return invoke("get_lesson_by_id", { lessonId });
  }

  getStudentBookById(
    id: string
  ): Promise<{
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    work_book_id?: string;
    units: Array<{ id: string; title: string; link?: string }>;
  }> {
    return invoke("get_student_book_by_id", { id });
  }

  updateLessonWordsBulk(
    lessonId: string,
    name: string,
    duration: number,
    description: string,
    words: Array<{ word_id: string; word_progress?: number; word_max_read?: number; word_show_ipa?: number; word_show_word?: number; word_show_ipa_and_word?: number; word_reads_per_round?: number; word_pause_time?: number }>
  ): Promise<boolean> {
    return invoke("update_lesson_words_bulk", {
      lesson_id: lessonId,
      name,
      duration,
      description,
      words
    });
  }

  resolveAudio(word: string, accent: "uk" | "us"): Promise<string | null> {
    return invoke("resolve_audio", { word, accent });
  }

  getWordsByUnitId(unitIds: string[]): Promise<ApiUnitData[]> {
    return invoke("get_words_by_units", { unitIds });
  }

  getLessonList(search: string, limit: number, page: number, sortBy?: string, sortOrder?: string): Promise<LessonListResponse> {
    return invoke("get_lesson_list", { search, limit, page, sortBy, sortOrder });
  }

  getNoteById(idNote: string): Promise<NoteItem | null> {
    return invoke("get_note_by_id", { noteId: idNote });
  }

  upsertNote(payload: UpsertNotePayload): Promise<NoteItem | null> {
    return invoke("upsert_unit_note", { unitId: payload.unitId, content: payload.content });
  }

  deleteNoteById(idNote: string): Promise<unknown> {
    return invoke("delete_note", { noteId: idNote });
  }

  getStudentBookByCurriculumId(curriculumId: string): Promise<{
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    work_book_id?: string;
    units: Array<{ id: string; title: string; link?: string }>;
  } | null> {
    return invoke("get_student_book_by_curriculum_id", { curriculumId });
  }
}

export const appRepository = new AppRepository();
