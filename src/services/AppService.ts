import { ApiUnitData, Curriculum, CurriculumPagination, LessonListResponse, Word } from "@/lib/types";
import { appRepository } from "../repository/AppRepository";
import { Lesson, Level, Unit } from "../types/models";
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

class AppService {
  init(): Promise<void> {
    return appRepository.initDb();
  }

  getCurriculumById(curriculumId: string): Promise<Curriculum | null> {
    return appRepository.getCurriculumById(curriculumId);
  }

  getCurriculums(page?: number, limit?: number, searchQuery?: string): Promise<CurriculumPagination> {
    return appRepository.getCurriculums(page, limit, searchQuery);
  }

  // Tauri command wrappers
  addWordsToUnit(unitId: string, wordIds: string[]): Promise<boolean> {
    return appRepository.addWordsToUnit(unitId, wordIds);
  }

  checkWordToUnit(unitId: string, wordId: string): Promise<boolean> {
    return appRepository.checkWordToUnit(unitId, wordId);
  }

  createLesson(
    payload: {
      name?: string; order?: number; words?: {
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
    }): Promise<Lesson> {
    return appRepository.createLessonWithUnits(payload.name, payload.order, payload.words, payload.unit_ids, payload.curriculum_original_id, payload.description, payload.duration);
  }

  deleteLessonById(lessonId: string): Promise<boolean> {
    return appRepository.deleteLesson(lessonId);
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
    return appRepository.updateLessonDetail(payload);
  }

  updateLessonProgress(
    lessonId: string,
    name: string,
    order: number,
    unitIds: string[],
    words: Array<{ word_id: string; word_progress?: number; word_pause_time?: number }>
  ): Promise<Lesson> {
    return appRepository.updateLessonProgress(lessonId, name, order, unitIds, words);
  }

  getChildrenWords(wordId: string): Promise<Array<{ word_id: string; word: string; ipa?: string; meaning?: string; parent_id?: string }>> {
    return appRepository.getChildrenWords(wordId);
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
    return appRepository.getChildrenWordsByParentId(parentWordId);
  }

  getLessonById(
    lessonId: string
  ): Promise<Lesson> {
    return appRepository.getLessonById(lessonId);
  }

  getStudentBookById(id: string): Promise<{
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    work_book_id?: string;
    units: Array<{ id: string; title: string; link?: string }>;
  }> {
    return appRepository.getStudentBookById(id);
  }

  getWorkBookById(id: string): Promise<{
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    student_book_id?: string;
    units: Array<{ id: string; title: string; link?: string }>;
  }> {
    return appRepository.getWorkBookById(id);
  }

  updateLessonWordsBulk(
    lessonId: string,
    name: string,
    duration: number,
    description: string,
    words: Array<{ word_id: string; word_progress?: number; word_max_read?: number; word_show_ipa?: number; word_show_word?: number; word_show_ipa_and_word?: number; word_reads_per_round?: number; word_pause_time?: number }>
  ): Promise<boolean> {
    return appRepository.updateLessonWordsBulk(lessonId, name, duration, description, words);
  }

  getWordsByUnitId(unitIds: string[]): Promise<ApiUnitData[]> {
    return appRepository.getWordsByUnitId(unitIds);
  }

  getLessonList(search: string, limit: number, page: number, sortBy?: string, sortOrder?: string): Promise<LessonListResponse> {
    return appRepository.getLessonList(search, limit, page, sortBy, sortOrder);
  }

  getNoteById(unit_id: string): Promise<NoteItem | null> {
    return appRepository.getNoteById(unit_id);
  }

  upsertNote(payload: UpsertNotePayload): Promise<NoteItem | null> {
    return appRepository.upsertNote(payload);
  }

  resolveAudio(word: string, accent: "uk" | "us"): Promise<string | null> {
    return appRepository.resolveAudio(word, accent);
  }

  async getIpaForWord(word: string): Promise<any> {
    return appRepository.getIpa(word);
  }

  async getIpaFromFile(filePath: string): Promise<Array<{ id?: string; meaning?: string; ukIPA?: string; usIPA?: string; ipa?: string }>> {
    return appRepository.getIpaFromFile(filePath);
  }

  async getIpaFromContent(content: string): Promise<Array<{ id?: string; meaning?: string; ukIPA?: string; usIPA?: string; ipa?: string }>> {
    return appRepository.getIpaFromContent(content);
  }

  deleteNoteById(idNote: string): Promise<unknown> {
    return appRepository.deleteNoteById(idNote);
  }

  // getStudentBookByCurriculumId(curriculumId: string): Promise<{
  //   id: string;
  //   name: string;
  //   description?: string;
  //   created_at?: string;
  //   updated_at?: string;
  //   work_book_id?: string;
  //   units: Array<{ id: string; title: string; link?: string }>;
  // } | null> {
  //   return appRepository.getStudentBookByCurriculumId(curriculumId);
  // }
}

export const appService = new AppService();
