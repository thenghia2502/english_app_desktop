#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use reqwest::blocking::Client;
use scraper::{ Html, Selector };
use rusqlite::{ params, Connection, OptionalExtension };
use serde::{ Deserialize, Serialize };
use std::collections::{ HashMap, HashSet };
use std::fs;
use std::path::{ Path, PathBuf };
use tauri::{ Manager, State };
// use rusqlite::{params};
// use tauri::State;

const DEFAULT_AUDIO_BASE_URL: &str = "https://api.example.com/audio";

#[derive(Clone)]
struct AppState {
    db_path: PathBuf,
    audio_root: PathBuf,
}

#[derive(Debug, Serialize)]
struct Unit {
    id: String,
    name: String,
    book_id: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
struct Book {
    id: String,
    name: String,
    type_: String,
    curriculum_id: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
struct Lesson {
    id: String,
    name: String,
    order: i32,
    progress: i64,
}

#[derive(Debug, Serialize)]
struct Word {
    id: String,
    word: String,
    meaning: String,
    ipa_uk: String,
    ipa_us: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
struct Curriculum {
    id: String,
    name: String,
    description: Option<String>,
    created_at: String,
    updated_at: String,
    link_image: String,
    level: Option<LevelInfo>,
    unit_count: i64,
}

#[derive(Debug, Serialize)]
struct CurriculumPaginationMeta {
    total: i64,
    page: i64,
    limit: i64,
    total_pages: i64,
}

#[derive(Debug, Serialize)]
struct CurriculumPagination {
    data: Vec<Curriculum>,
    meta: CurriculumPaginationMeta,
}

#[derive(serde::Serialize)]
struct CurriculumFull {
    id: String,
    name: String,
    description: Option<String>,
    created_at: String,
    updated_at: String,
    unit_count: i64,
    levels: Vec<LevelInfo>,
    link_image: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct LevelInfo {
    id: String,
    name: String,
    code_name: String,
}

#[derive(Debug, Serialize)]
struct LegacyNote {
    id: String,
    content: String,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize)]
struct WordItem {
    id: String,
    word: String,
    meaning: Option<String>,
    ipa: Option<String>,
    // popularity: Option<i64>,
    parent_id: Option<String>,
    children_count: i64,
}

#[derive(Serialize)]
struct UnitWords {
    original: Vec<WordItem>,
    custom: Vec<WordItem>,
}

#[derive(Serialize)]
struct UnitWithWords {
    unit_id: String,
    unit_name: String,
    unit_order: i32,
    unit_words: UnitWords,
}
#[derive(Debug, Deserialize)]
struct SeedLevel {
    id: String,
    name: String,
    code: i64,
    description: Option<String>,
    order_index: i64,
    category: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
struct SeedLevelCode {
    id: i64,
    code: String,
}

#[derive(Debug, Deserialize)]
struct SeedData {
    curriculums: Vec<SeedCurriculum>,
    books: Vec<SeedBook>,
    units: Vec<SeedUnit>,
    lessons: Vec<SeedLesson>,
    words: Vec<SeedWord>,
    words_units: Vec<SeedWordUnit>,
    lessons_units: Vec<SeedLessonUnit>,
    lessons_words: Vec<SeedLessonWord>,
    curriculum_units: Vec<SeedCurriculumUnit>,
    levels_code: Vec<SeedLevelCode>,
    levels: Vec<SeedLevel>,
    #[serde(default)]
    notes: Vec<SeedNote>,
}

#[derive(Debug, Deserialize)]
struct SeedCurriculum {
    id: String,
    name: String,
    description: Option<String>,
    created_at: String,
    updated_at: String,
    #[serde(default)]
    level_id: Option<String>,
    #[serde(default)]
    student_book_id: Option<String>,
    #[serde(rename = "type", default)]
    type_: Option<String>,
    #[serde(default)]
    work_book_id: Option<String>,
    link_image: String,
}

#[derive(Debug, Deserialize)]
struct SeedBook {
    id: String,
    #[serde(alias = "title", alias = "name")]
    name: String,
    #[serde(rename = "type")]
    type_: String,
    #[serde(default)]
    level_id: String,
    curriculum_id: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
struct SeedUnit {
    id: String,
    title: String,
    level_id: String,
    #[serde(default)]
    book_id: Option<String>,
    created_at: String,
    updated_at: String,
    order: i32,
    link: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SeedCurriculumUnit {
    curriculum_id: String,
    unit_id: String,
}

#[derive(Debug, Deserialize)]
struct SeedLesson {
    id: String,
    name: String,
    progress: i64,
    created_at: String,
    updated_at: String,
    curriculum_id: Option<String>,
    #[serde(default)]
    order: Option<i32>,
    #[serde(default)]
    category: Option<String>,
    #[serde(default)]
    duration: Option<i32>,
    #[serde(default)]
    description: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SeedWord {
    id: String,
    word: String,
    meaning: String,
    #[serde(alias = "uk_ipa")]
    ipa_uk: Option<String>,
    #[serde(alias = "us_ipa")]
    ipa_us: Option<String>,
    ipa: Option<String>,
    #[serde(default)]
    popularity: Option<i64>,
    #[serde(default)]
    parent_id: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
struct SeedWordUnit {
    word_id: String,
    unit_id: String,
}

#[derive(Debug, Deserialize)]
struct SeedLessonUnit {
    lesson_id: String,
    unit_id: String,
}

#[derive(Debug, Deserialize)]
struct SeedLessonWord {
    lesson_id: String,
    word_id: String,
    word_max_read: i64,
    word_show_ipa: i64,
    word_show_word: i64,
    word_show_ipa_and_word: i64,
    word_progress: i64,
}

#[derive(Debug, Deserialize)]
struct SeedNote {
    id: String,
    unit_id: String,
    content: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
struct LessonWordInput {
    id: String,
    word_max_read: Option<String>,
    word_show_ipa: Option<String>,
    word_show_word: Option<String>,
    word_show_ipa_and_word: Option<String>,
    word_progress: Option<String>,
}

fn next_id(prefix: &str) -> String {
    let millis = std::time::SystemTime
        ::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    format!("{prefix}-{millis}")
}

fn parse_i64_or_default(value: Option<&String>, default: i64) -> i64 {
    value.and_then(|v| v.parse::<i64>().ok()).unwrap_or(default)
}

fn open_connection(db_path: &Path) -> Result<Connection, String> {
    Connection::open(db_path).map_err(|e| format!("failed to open sqlite db: {e}"))
}

fn table_has_column(
    conn: &Connection,
    table_name: &str,
    column_name: &str
) -> Result<bool, String> {
    let mut stmt = conn
        .prepare(&format!("PRAGMA table_info({table_name})"))
        .map_err(|e| format!("prepare table info error: {e}"))?;

    let rows = stmt
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|e| format!("table info query error: {e}"))?;

    for row in rows {
        let column = row.map_err(|e| format!("table info row error: {e}"))?;
        if column == column_name {
            return Ok(true);
        }
    }

    Ok(false)
}

fn create_schema(conn: &Connection) -> Result<(), String> {
    conn
        .execute_batch(
            "
        PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS curriculums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
    level_id TEXT NOT NULL DEFAULT '',
  student_book_id TEXT,
  type TEXT NOT NULL DEFAULT '',
  work_book_id TEXT,
  link_image TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS levels_code (
  id INTEGER PRIMARY KEY,
    code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
    code INTEGER NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (code) REFERENCES levels_code(id)
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  curriculum_id TEXT NOT NULL,
  level_id TEXT NOT NULL DEFAULT '',
  type_ TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (curriculum_id) REFERENCES curriculums(id)
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  book_id TEXT NOT NULL,
  level_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '',
  'order' INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
    curriculum_id TEXT NOT NULL DEFAULT '',
    'order' INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT '',
    duration INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
    FOREIGN KEY (curriculum_id) REFERENCES curriculums(id)
);

CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
    ipa TEXT NOT NULL DEFAULT '',
    uk_ipa TEXT NOT NULL DEFAULT '',
    us_ipa TEXT NOT NULL DEFAULT '',
  ipa_uk TEXT NOT NULL,
  ipa_us TEXT NOT NULL,
    popularity INTEGER NOT NULL DEFAULT 0,
    parent_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS curriculum_units (
  curriculum_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  PRIMARY KEY (curriculum_id, unit_id),
  FOREIGN KEY (curriculum_id) REFERENCES curriculums(id),
  FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE IF NOT EXISTS words_units (
  word_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
    custom INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (word_id, unit_id),
  FOREIGN KEY (word_id) REFERENCES words(id),
  FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE IF NOT EXISTS lessons_units (
  lesson_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  PRIMARY KEY (lesson_id, unit_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE IF NOT EXISTS lessons_words (
  lesson_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  word_max_read INTEGER NOT NULL DEFAULT 0,
  word_show_ipa INTEGER NOT NULL DEFAULT 0,
  word_show_word INTEGER NOT NULL DEFAULT 0,
  word_show_ipa_and_word INTEGER NOT NULL DEFAULT 0,
    word_reads_per_round INTEGER NOT NULL DEFAULT 0,
    word_pause_time INTEGER NOT NULL DEFAULT 0,
  word_progress INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (lesson_id, word_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  FOREIGN KEY (word_id) REFERENCES words(id)
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
        "
        )
        .map_err(|e| format!("failed to create schema: {e}"))?;

    if !table_has_column(conn, "curriculums", "link_image")? {
        conn
            .execute("ALTER TABLE curriculums ADD COLUMN link_image TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate curriculums.link_image: {e}"))?;
    }

    if !table_has_column(conn, "curriculums", "level_id")? {
        conn
            .execute("ALTER TABLE curriculums ADD COLUMN level_id TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate curriculums.level_id: {e}"))?;
    }

    if !table_has_column(conn, "books", "level_id")? {
        conn
            .execute("ALTER TABLE books ADD COLUMN level_id TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate books.level_id: {e}"))?;
    }

    if !table_has_column(conn, "units", "level_id")? {
        conn
            .execute("ALTER TABLE units ADD COLUMN level_id TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate units.level_id: {e}"))?;
    }

    if !table_has_column(conn, "lessons", "curriculum_id")? {
        conn
            .execute("ALTER TABLE lessons ADD COLUMN curriculum_id TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate lessons.curriculum_id: {e}"))?;
    }

    if !table_has_column(conn, "lessons", "order")? {
        conn
            .execute("ALTER TABLE lessons ADD COLUMN \"order\" INTEGER NOT NULL DEFAULT 0", [])
            .map_err(|e| format!("failed to migrate lessons.order: {e}"))?;
    }

    if !table_has_column(conn, "lessons", "category")? {
        conn
            .execute("ALTER TABLE lessons ADD COLUMN category TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate lessons.category: {e}"))?;
    }

    if !table_has_column(conn, "lessons", "duration")? {
        conn
            .execute("ALTER TABLE lessons ADD COLUMN duration INTEGER NOT NULL DEFAULT 0", [])
            .map_err(|e| format!("failed to migrate lessons.duration: {e}"))?;
    }

    if !table_has_column(conn, "lessons", "description")? {
        conn
            .execute("ALTER TABLE lessons ADD COLUMN description TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate lessons.description: {e}"))?;
    }

    if !table_has_column(conn, "lessons", "deleted_at")? {
        conn
            .execute("ALTER TABLE lessons ADD COLUMN deleted_at TEXT", [])
            .map_err(|e| format!("failed to migrate lessons.deleted_at: {e}"))?;
    }

    if !table_has_column(conn, "levels_code", "code")? {
        conn
            .execute("ALTER TABLE levels_code ADD COLUMN code TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate levels_code.code: {e}"))?;

        if table_has_column(conn, "levels_code", "name")? {
            conn
                .execute("UPDATE levels_code SET code = name WHERE code = ''", [])
                .map_err(|e| format!("failed to backfill levels_code.code: {e}"))?;
        }
    }

    if !table_has_column(conn, "levels", "description")? {
        conn
            .execute("ALTER TABLE levels ADD COLUMN description TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate levels.description: {e}"))?;
    }

    if !table_has_column(conn, "levels", "order_index")? {
        conn
            .execute("ALTER TABLE levels ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0", [])
            .map_err(|e| format!("failed to migrate levels.order_index: {e}"))?;
    }

    if !table_has_column(conn, "levels", "category")? {
        conn
            .execute("ALTER TABLE levels ADD COLUMN category TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate levels.category: {e}"))?;
    }

    if !table_has_column(conn, "levels", "created_at")? {
        conn
            .execute("ALTER TABLE levels ADD COLUMN created_at TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate levels.created_at: {e}"))?;
    }

    if !table_has_column(conn, "levels", "updated_at")? {
        conn
            .execute("ALTER TABLE levels ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate levels.updated_at: {e}"))?;
    }

    if !table_has_column(conn, "words", "ipa")? {
        conn
            .execute("ALTER TABLE words ADD COLUMN ipa TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate words.ipa: {e}"))?;
    }

    if !table_has_column(conn, "words", "uk_ipa")? {
        conn
            .execute("ALTER TABLE words ADD COLUMN uk_ipa TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate words.uk_ipa: {e}"))?;
    }

    if !table_has_column(conn, "words", "us_ipa")? {
        conn
            .execute("ALTER TABLE words ADD COLUMN us_ipa TEXT NOT NULL DEFAULT ''", [])
            .map_err(|e| format!("failed to migrate words.us_ipa: {e}"))?;
    }

    if !table_has_column(conn, "words", "popularity")? {
        conn
            .execute("ALTER TABLE words ADD COLUMN popularity INTEGER NOT NULL DEFAULT 0", [])
            .map_err(|e| format!("failed to migrate words.popularity: {e}"))?;
    }

    if !table_has_column(conn, "words", "parent_id")? {
        conn
            .execute("ALTER TABLE words ADD COLUMN parent_id TEXT", [])
            .map_err(|e| format!("failed to migrate words.parent_id: {e}"))?;
    }

    if !table_has_column(conn, "words_units", "custom")? {
        conn
            .execute("ALTER TABLE words_units ADD COLUMN custom INTEGER NOT NULL DEFAULT 0", [])
            .map_err(|e| format!("failed to migrate words_units.custom: {e}"))?;
    }

    if !table_has_column(conn, "lessons_words", "word_reads_per_round")? {
        conn
            .execute(
                "ALTER TABLE lessons_words ADD COLUMN word_reads_per_round INTEGER NOT NULL DEFAULT 0",
                []
            )
            .map_err(|e| format!("failed to migrate lessons_words.word_reads_per_round: {e}"))?;
    }

    if !table_has_column(conn, "lessons_words", "word_pause_time")? {
        conn
            .execute(
                "ALTER TABLE lessons_words ADD COLUMN word_pause_time INTEGER NOT NULL DEFAULT 0",
                []
            )
            .map_err(|e| format!("failed to migrate lessons_words.word_pause_time: {e}"))?;
    }

    conn
        .execute(
            "UPDATE words
             SET uk_ipa = CASE WHEN uk_ipa = '' THEN ipa_uk ELSE uk_ipa END,
                 us_ipa = CASE WHEN us_ipa = '' THEN ipa_us ELSE us_ipa END,
                 ipa = CASE WHEN ipa = '' THEN ipa_uk ELSE ipa END",
            []
        )
        .map_err(|e| format!("failed to backfill words ipa fields: {e}"))?;

    // Ensure notes table has unit_id column for linking notes to units
    // Only try if the notes table already exists (created via seed)
    if table_has_column(conn, "notes", "id")? {
        if !table_has_column(conn, "notes", "unit_id")? {
            conn
                .execute("ALTER TABLE notes ADD COLUMN unit_id TEXT NOT NULL DEFAULT ''", [])
                .map_err(|e| format!("failed to migrate notes.unit_id: {e}"))?;
        }
    }

    Ok(())
}

fn database_has_seed_data(conn: &Connection) -> Result<bool, String> {
    for table in [
        "curriculums",
        "levels_code",
        "levels",
        "books",
        "units",
        "lessons",
        "words",
        "curriculum_units",
        "words_units",
        "lessons_units",
        "lessons_words",
        "notes",
    ] {
        let sql = format!("SELECT EXISTS(SELECT 1 FROM {table} LIMIT 1)");
        let has_rows: i64 = conn
            .query_row(&sql, [], |row| row.get(0))
            .map_err(|e| format!("failed to inspect {table}: {e}"))?;

        if has_rows != 0 {
            return Ok(true);
        }
    }

    Ok(false)
}

fn backfill_curriculum_level_ids(conn: &mut Connection, seed: &SeedData) -> Result<(), String> {
    if !table_has_column(conn, "curriculums", "level_id")? {
        return Ok(());
    }

    let tx = conn
        .transaction()
        .map_err(|e| format!("failed to start curriculum level backfill: {e}"))?;

    for item in &seed.curriculums {
        let Some(level_id) = item.level_id.clone() else {
            continue;
        };

        if level_id.is_empty() {
            continue;
        }

        tx
            .execute(
                "UPDATE curriculums SET level_id = ?2 WHERE id = ?1 AND (level_id IS NULL OR level_id = '')",
                params![item.id, level_id]
            )
            .map_err(|e| format!("failed to backfill curriculums.level_id: {e}"))?;
    }

    tx.commit().map_err(|e| format!("failed to commit curriculum level backfill: {e}"))?;

    Ok(())
}

fn maybe_seed(conn: &mut Connection) -> Result<(), String> {
    let raw_seed = include_str!("../../data/seed.json");
    let seed: SeedData = serde_json
        ::from_str(raw_seed)
        .map_err(|e| format!("invalid seed json: {e}"))?;

    if database_has_seed_data(conn)? {
        backfill_curriculum_level_ids(conn, &seed)?;
        return Ok(());
    }

    let expected_curriculums = seed.curriculums.len();
    let expected_books = seed.books.len();
    let expected_units = seed.units
        .iter()
        .map(|item| item.id.clone())
        .collect::<HashSet<_>>()
        .len();
    let expected_lessons = seed.lessons.len();
    let expected_words = seed.words.len();
    let expected_levels_code = seed.levels_code.len();
    let expected_levels = seed.levels.len();
    let expected_curriculum_units = seed.curriculum_units.len();
    let expected_words_units = seed.words_units.len();
    let expected_lessons_units = seed.lessons_units.len();
    let expected_lessons_words = seed.lessons_words.len();
    let expected_notes = seed.notes.len();

    let seed_curriculum_ids: HashSet<String> = seed.curriculums
        .iter()
        .map(|item| item.id.clone())
        .collect();
    let seed_book_ids: HashSet<String> = seed.books
        .iter()
        .map(|item| item.id.clone())
        .collect();
    let seed_unit_ids: HashSet<String> = seed.units
        .iter()
        .map(|item| item.id.clone())
        .collect();
    let seed_word_ids: HashSet<String> = seed.words
        .iter()
        .map(|item| item.id.clone())
        .collect();
    let seed_lesson_ids: HashSet<String> = seed.lessons
        .iter()
        .map(|item| item.id.clone())
        .collect();

    let seed_curriculum_unit_pairs: HashSet<String> = seed.curriculum_units
        .iter()
        .map(|item| format!("{}|{}", item.curriculum_id, item.unit_id))
        .collect();
    let seed_word_unit_pairs: HashSet<String> = seed.words_units
        .iter()
        .map(|item| format!("{}|{}", item.word_id, item.unit_id))
        .collect();
    let seed_lesson_unit_pairs: HashSet<String> = seed.lessons_units
        .iter()
        .map(|item| format!("{}|{}", item.lesson_id, item.unit_id))
        .collect();
    let seed_lesson_word_pairs: HashSet<String> = seed.lessons_words
        .iter()
        .map(|item| format!("{}|{}", item.lesson_id, item.word_id))
        .collect();
    let seed_note_ids: HashSet<String> = seed.notes
        .iter()
        .map(|item| item.id.clone())
        .collect();
    let seed_level_ids: HashSet<String> = seed.books
        .iter()
        .map(|item| item.level_id.clone())
        .chain(seed.curriculums.iter().filter_map(|item| item.level_id.clone()))
        .chain(seed.units.iter().map(|item| item.level_id.clone()))
        .filter(|level_id| !level_id.is_empty())
        .collect();
    let existing_curriculum_ids: HashSet<String> = conn
        .prepare("SELECT id FROM curriculums ORDER BY id")
        .map_err(|e| format!("failed to inspect existing curriculums: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing curriculums: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing curriculums: {e}"))?;

    let mut existing_level_ids: HashSet<String> = HashSet::new();

    if table_has_column(conn, "books", "level_id")? {
        existing_level_ids.extend(
            conn
                .prepare(
                    "SELECT DISTINCT level_id FROM books WHERE level_id <> '' ORDER BY level_id"
                )
                .map_err(|e| format!("failed to inspect existing levels: {e}"))?
                .query_map([], |row| row.get::<_, String>(0))
                .map_err(|e| format!("failed to query existing levels: {e}"))?
                .collect::<Result<HashSet<_>, _>>()
                .map_err(|e| format!("failed to read existing levels: {e}"))?
        );
    }

    if table_has_column(conn, "curriculums", "level_id")? {
        existing_level_ids.extend(
            conn
                .prepare(
                    "SELECT DISTINCT level_id FROM curriculums WHERE level_id <> '' ORDER BY level_id"
                )
                .map_err(|e| format!("failed to inspect existing curriculum levels: {e}"))?
                .query_map([], |row| row.get::<_, String>(0))
                .map_err(|e| format!("failed to query existing curriculum levels: {e}"))?
                .collect::<Result<HashSet<_>, _>>()
                .map_err(|e| format!("failed to read existing curriculum levels: {e}"))?
        );
    }

    if table_has_column(conn, "units", "level_id")? {
        existing_level_ids.extend(
            conn
                .prepare(
                    "SELECT DISTINCT level_id FROM units WHERE level_id <> '' ORDER BY level_id"
                )
                .map_err(|e| format!("failed to inspect existing unit levels: {e}"))?
                .query_map([], |row| row.get::<_, String>(0))
                .map_err(|e| format!("failed to query existing unit levels: {e}"))?
                .collect::<Result<HashSet<_>, _>>()
                .map_err(|e| format!("failed to read existing unit levels: {e}"))?
        );
    }

    let existing_book_ids: HashSet<String> = conn
        .prepare("SELECT id FROM books ORDER BY id")
        .map_err(|e| format!("failed to inspect existing books: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing books: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing books: {e}"))?;

    let existing_unit_ids: HashSet<String> = conn
        .prepare("SELECT id FROM units ORDER BY id")
        .map_err(|e| format!("failed to inspect existing units: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing units: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing units: {e}"))?;

    let existing_word_ids: HashSet<String> = conn
        .prepare("SELECT id FROM words ORDER BY id")
        .map_err(|e| format!("failed to inspect existing words: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing words: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing words: {e}"))?;

    let existing_lesson_ids: HashSet<String> = conn
        .prepare("SELECT id FROM lessons ORDER BY id")
        .map_err(|e| format!("failed to inspect existing lessons: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing lessons: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing lessons: {e}"))?;

    let existing_curriculum_unit_pairs: HashSet<String> = conn
        .prepare(
            "SELECT curriculum_id || '|' || unit_id FROM curriculum_units ORDER BY curriculum_id, unit_id"
        )
        .map_err(|e| format!("failed to inspect existing curriculum_units: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing curriculum_units: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing curriculum_units: {e}"))?;

    let existing_word_unit_pairs: HashSet<String> = conn
        .prepare("SELECT word_id || '|' || unit_id FROM words_units ORDER BY word_id, unit_id")
        .map_err(|e| format!("failed to inspect existing words_units: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing words_units: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing words_units: {e}"))?;

    let existing_lesson_unit_pairs: HashSet<String> = conn
        .prepare(
            "SELECT lesson_id || '|' || unit_id FROM lessons_units ORDER BY lesson_id, unit_id"
        )
        .map_err(|e| format!("failed to inspect existing lessons_units: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing lessons_units: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing lessons_units: {e}"))?;

    let existing_lesson_word_pairs: HashSet<String> = conn
        .prepare(
            "SELECT lesson_id || '|' || word_id FROM lessons_words ORDER BY lesson_id, word_id"
        )
        .map_err(|e| format!("failed to inspect existing lessons_words: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing lessons_words: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing lessons_words: {e}"))?;

    let existing_note_ids: HashSet<String> = conn
        .prepare("SELECT id FROM notes ORDER BY id")
        .map_err(|e| format!("failed to inspect existing notes: {e}"))?
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("failed to query existing notes: {e}"))?
        .collect::<Result<HashSet<_>, _>>()
        .map_err(|e| format!("failed to read existing notes: {e}"))?;

    let needs_reseed =
        existing_curriculum_ids != seed_curriculum_ids ||
        existing_level_ids != seed_level_ids ||
        existing_book_ids != seed_book_ids ||
        existing_unit_ids != seed_unit_ids ||
        existing_word_ids != seed_word_ids ||
        existing_lesson_ids != seed_lesson_ids ||
        existing_curriculum_unit_pairs != seed_curriculum_unit_pairs ||
        existing_word_unit_pairs != seed_word_unit_pairs ||
        existing_lesson_unit_pairs != seed_lesson_unit_pairs ||
        existing_lesson_word_pairs != seed_lesson_word_pairs ||
        existing_note_ids != seed_note_ids;

    let tx = conn.transaction().map_err(|e| format!("failed to start transaction: {e}"))?;
    println!("needs_reseed: {}", needs_reseed);
    if needs_reseed {
        tx
            .execute_batch(
                "DELETE FROM lessons_words;
                DELETE FROM lessons_units;
                DELETE FROM words_units;
                DELETE FROM curriculum_units;
                DELETE FROM notes;
                DELETE FROM lessons;
                DELETE FROM words;
                DELETE FROM units;
                DELETE FROM books;
                DELETE FROM levels;
                DELETE FROM levels_code;
                DELETE FROM curriculums;"
            )
            .map_err(|e| format!("failed to clear curriculum data: {e}"))?;
    }

    let books_has_type_column = table_has_column(&tx, "books", "type_")?;

    for item in seed.levels_code {
        tx
            .execute(
                "INSERT INTO levels_code (id, code) VALUES (?1, ?2)
         ON CONFLICT(id) DO UPDATE SET
            code = excluded.code",
                params![
                    item.id, // INT
                    item.code // string
                ]
            )
            .map_err(|e| format!("seed levels_code error: {e}"))?;
    }

    for item in seed.levels {
        tx
            .execute(
                "INSERT INTO levels (id, name, code, description, order_index, category, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            code = excluded.code,
            description = excluded.description,
            order_index = excluded.order_index,
            category = excluded.category,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at",
                params![
                    item.id, // TEXT
                    item.name,
                    item.code, // INT (FK → levels_code.id)
                    item.description.unwrap_or_default(),
                    item.order_index,
                    item.category.unwrap_or_default(),
                    item.created_at,
                    item.updated_at
                ]
            )
            .map_err(|e| format!("seed levels error: {e}"))?;
    }

    for item in seed.curriculums {
        tx
            .execute(
                "INSERT INTO curriculums (id, name, description, created_at, updated_at, level_id, student_book_id, type, work_book_id, link_image) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
                 ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    description = excluded.description,
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at,
                    level_id = excluded.level_id,
                    student_book_id = excluded.student_book_id,
                    type = excluded.type,
                    work_book_id = excluded.work_book_id,
                    link_image = excluded.link_image",
                params![
                    item.id,
                    item.name,
                    item.description.unwrap_or_default(),
                    item.created_at,
                    item.updated_at,
                    item.level_id.unwrap_or_default(),
                    item.student_book_id.unwrap_or_default(),
                    item.type_.unwrap_or_default(),
                    item.work_book_id.unwrap_or_default(),
                    item.link_image
                ]
            )
            .map_err(|e| format!("seed curriculums error: {e}"))?;
    }

    for item in seed.books {
        if books_has_type_column {
            tx
                .execute(
                    "INSERT INTO books (id, name, curriculum_id, level_id, type_, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                     ON CONFLICT(id) DO UPDATE SET
                        name = excluded.name,
                        curriculum_id = excluded.curriculum_id,
                        level_id = excluded.level_id,
                        type_ = excluded.type_,
                        created_at = excluded.created_at,
                        updated_at = excluded.updated_at",
                    params![
                        item.id,
                        item.name,
                        item.curriculum_id,
                        item.level_id,
                        item.type_,
                        item.created_at,
                        item.updated_at
                    ]
                )
                .map_err(|e| format!("seed books error: {e}"))?;
        } else {
            tx
                .execute(
                    "INSERT INTO books (id, name, curriculum_id, level_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                     ON CONFLICT(id) DO UPDATE SET
                        name = excluded.name,
                        curriculum_id = excluded.curriculum_id,
                        level_id = excluded.level_id,
                        created_at = excluded.created_at,
                        updated_at = excluded.updated_at",
                    params![
                        item.id,
                        item.name,
                        item.curriculum_id,
                        item.level_id,
                        item.created_at,
                        item.updated_at
                    ]
                )
                .map_err(|e| format!("seed books error: {e}"))?;
        }
    }

    for item in seed.units {
        tx
            .execute(
                "INSERT INTO units (id, title, book_id, level_id, \"order\", created_at, updated_at, link) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
                 ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    book_id = excluded.book_id,
                    level_id = excluded.level_id,
                    \"order\" = excluded.\"order\",
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at,
                    link = excluded.link",
                params![
                    item.id,
                    item.title,
                    item.book_id.unwrap_or_default(),
                    item.level_id,
                    item.order,
                    item.created_at,
                    item.updated_at,
                    item.link.unwrap_or_default()
                ]
            )
            .map_err(|e| format!("seed units error: {e}"))?;
    }

    for item in seed.curriculum_units {
        tx
            .execute(
                "INSERT OR IGNORE INTO curriculum_units (curriculum_id, unit_id) VALUES (?1, ?2)",
                params![item.curriculum_id, item.unit_id]
            )
            .map_err(|e| format!("seed curriculum_units error: {e}"))?;
    }

    for item in seed.lessons {
        tx
            .execute(
                "INSERT INTO lessons (id, name, progress, created_at, updated_at, curriculum_id, \"order\", category, duration, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
                 ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    progress = excluded.progress,
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at,
                    curriculum_id = excluded.curriculum_id,
                    \"order\" = excluded.\"order\",
                    category = excluded.category,
                    duration = excluded.duration,
                    description = excluded.description",
                params![
                    item.id,
                    item.name,
                    item.progress,
                    item.created_at,
                    item.updated_at,
                    item.curriculum_id.unwrap_or_default(),
                    item.order.unwrap_or(0),
                    item.category.unwrap_or_default(),
                    item.duration.unwrap_or(0),
                    item.description.unwrap_or_default()
                ]
            )
            .map_err(|e| format!("seed lessons error: {e}"))?;
    }

    for item in seed.words {
        let ipa_fallback = item.ipa.unwrap_or_default();
        let ipa_uk = item.ipa_uk.unwrap_or_else(|| ipa_fallback.clone());
        let ipa_us = item.ipa_us.unwrap_or_else(|| ipa_fallback.clone());
        let popularity = item.popularity.unwrap_or(0);

        tx
            .execute(
                "INSERT INTO words (id, word, meaning, ipa, uk_ipa, us_ipa, ipa_uk, ipa_us, popularity, parent_id, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
                 ON CONFLICT(id) DO UPDATE SET
                    word = excluded.word,
                    meaning = excluded.meaning,
                    ipa = excluded.ipa,
                    uk_ipa = excluded.uk_ipa,
                    us_ipa = excluded.us_ipa,
                    ipa_uk = excluded.ipa_uk,
                    ipa_us = excluded.ipa_us,
                    popularity = excluded.popularity,
                    parent_id = excluded.parent_id,
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at",
                params![
                    item.id,
                    item.word,
                    item.meaning,
                    ipa_fallback,
                    ipa_uk.clone(),
                    ipa_us.clone(),
                    ipa_uk,
                    ipa_us,
                    popularity,
                    item.parent_id,
                    item.created_at,
                    item.updated_at
                ]
            )
            .map_err(|e| format!("seed words error: {e}"))?;
    }

    for item in seed.words_units {
        tx
            .execute(
                "INSERT OR IGNORE INTO words_units (word_id, unit_id) VALUES (?1, ?2)",
                params![item.word_id, item.unit_id]
            )
            .map_err(|e| format!("seed words_units error: {e}"))?;
    }

    for item in seed.lessons_units {
        tx
            .execute(
                "INSERT OR IGNORE INTO lessons_units (lesson_id, unit_id) VALUES (?1, ?2)",
                params![item.lesson_id, item.unit_id]
            )
            .map_err(|e| format!("seed lessons_units error: {e}"))?;
    }

    for item in seed.lessons_words {
        tx
            .execute(
                "INSERT INTO lessons_words (lesson_id, word_id, word_max_read, word_show_ipa, word_show_word, word_show_ipa_and_word, word_progress) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                 ON CONFLICT(lesson_id, word_id) DO UPDATE SET
                    word_max_read = excluded.word_max_read,
                    word_show_ipa = excluded.word_show_ipa,
                    word_show_word = excluded.word_show_word,
                    word_show_ipa_and_word = excluded.word_show_ipa_and_word,
                    word_progress = excluded.word_progress",
                params![
                    item.lesson_id,
                    item.word_id,
                    item.word_max_read,
                    item.word_show_ipa,
                    item.word_show_word,
                    item.word_show_ipa_and_word,
                    item.word_progress
                ]
            )
            .map_err(|e| format!("seed lessons_words error: {e}"))?;
    }

    for item in seed.notes {
        tx
            .execute(
                "INSERT INTO notes (id, unit_id, content, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)
                 ON CONFLICT(id) DO UPDATE SET
                    unit_id = excluded.unit_id,
                    content = excluded.content,
                    created_at = excluded.created_at,
                    updated_at = excluded.updated_at",
                params![item.id, item.unit_id, item.content, item.created_at, item.updated_at]
            )
            .map_err(|e| format!("seed notes error: {e}"))?;
    }

    tx.commit().map_err(|e| format!("seed commit error: {e}"))?;

    let actual_curriculums: i64 = conn
        .query_row("SELECT COUNT(*) FROM curriculums", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify curriculums count: {e}"))?;
    let actual_books: i64 = conn
        .query_row("SELECT COUNT(*) FROM books", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify books count: {e}"))?;
    let actual_units: i64 = conn
        .query_row("SELECT COUNT(*) FROM units", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify units count: {e}"))?;
    let actual_lessons: i64 = conn
        .query_row("SELECT COUNT(*) FROM lessons", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify lessons count: {e}"))?;
    let actual_words: i64 = conn
        .query_row("SELECT COUNT(*) FROM words", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify words count: {e}"))?;
    let actual_levels_code: i64 = conn
        .query_row("SELECT COUNT(*) FROM levels_code", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify levels_code count: {e}"))?;
    let actual_levels: i64 = conn
        .query_row("SELECT COUNT(*) FROM levels", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify levels count: {e}"))?;
    let actual_curriculum_units: i64 = conn
        .query_row("SELECT COUNT(*) FROM curriculum_units", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify curriculum_units count: {e}"))?;
    let actual_words_units: i64 = conn
        .query_row("SELECT COUNT(*) FROM words_units", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify words_units count: {e}"))?;
    let actual_lessons_units: i64 = conn
        .query_row("SELECT COUNT(*) FROM lessons_units", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify lessons_units count: {e}"))?;
    let actual_lessons_words: i64 = conn
        .query_row("SELECT COUNT(*) FROM lessons_words", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify lessons_words count: {e}"))?;
    let actual_notes: i64 = conn
        .query_row("SELECT COUNT(*) FROM notes", [], |row| row.get(0))
        .map_err(|e| format!("failed to verify notes count: {e}"))?;

    let mismatches = [
        ("curriculums", actual_curriculums, expected_curriculums as i64),
        ("books", actual_books, expected_books as i64),
        ("units", actual_units, expected_units as i64),
        ("lessons", actual_lessons, expected_lessons as i64),
        ("words", actual_words, expected_words as i64),
        ("levels_code", actual_levels_code, expected_levels_code as i64),
        ("levels", actual_levels, expected_levels as i64),
        ("curriculum_units", actual_curriculum_units, expected_curriculum_units as i64),
        ("words_units", actual_words_units, expected_words_units as i64),
        ("lessons_units", actual_lessons_units, expected_lessons_units as i64),
        ("lessons_words", actual_lessons_words, expected_lessons_words as i64),
        ("notes", actual_notes, expected_notes as i64),
    ]
        .into_iter()
        .filter(|(_, actual, expected)| actual != expected)
        .map(|(name, actual, expected)| format!("{name}: actual {actual}, expected {expected}"))
        .collect::<Vec<_>>();

    if !mismatches.is_empty() {
        return Err(format!("seed verification failed: {}", mismatches.join("; ")));
    }

    Ok(())
}

fn normalize_word_to_filename(word: &str) -> String {
    word.to_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| (c.is_ascii_alphanumeric() || *c == '-'))
        .collect::<String>()
}

fn initialize_database(db_path: &Path) -> Result<(), String> {
    let mut conn = open_connection(db_path)?;
    create_schema(&conn)?;
    maybe_seed(&mut conn)
}

#[tauri::command]
fn init_db(state: State<AppState>) -> Result<(), String> {
    initialize_database(&state.db_path)
}

#[tauri::command]
fn get_curriculums(
    state: State<AppState>,
    page: Option<u32>,
    limit: Option<u32>,
    search_query: Option<String>
) -> Result<CurriculumPagination, String> {
    let conn = open_connection(&state.db_path)?;

    let page = page.unwrap_or(1).max(1) as i64;
    let limit = limit.unwrap_or(20).max(1) as i64;
    let offset = (page - 1) * limit;

    let search_pattern = search_query.as_ref().map(|search| format!("%{}%", search.trim()));

    let total: i64 = if let Some(pattern) = search_pattern.as_ref() {
        conn
            .query_row(
                "SELECT COUNT(*) FROM curriculums WHERE name LIKE ?1 OR description LIKE ?1",
                [pattern],
                |row| row.get(0)
            )
            .map_err(|e| format!("count query error: {e}"))?
    } else {
        conn
            .query_row("SELECT COUNT(*) FROM curriculums", [], |row| row.get(0))
            .map_err(|e| format!("count query error: {e}"))?
    };

    let total_pages = ((total as f64) / (limit as f64)).ceil() as i64;

    let mut query =
        "SELECT c.id, c.name, c.description, c.created_at, c.updated_at, c.link_image, l.id, l.name, lc.code, (SELECT COUNT(*) FROM curriculum_units cu WHERE cu.curriculum_id = c.id) AS unit_count FROM curriculums c LEFT JOIN levels l ON l.id = c.level_id LEFT JOIN levels_code lc ON lc.id = l.code".to_string();
    let mut param_values: Vec<rusqlite::types::Value> = Vec::new();

    if let Some(search_pattern) = search_pattern {
        query.push_str(" WHERE c.type = 'sb' AND (c.name LIKE ? OR c.description LIKE ?)");
        param_values.push(rusqlite::types::Value::Text(search_pattern.clone()));
        param_values.push(rusqlite::types::Value::Text(search_pattern));
    }

    query.push_str(" ORDER BY c.name");

    query.push_str(" LIMIT ?");
    param_values.push(rusqlite::types::Value::Integer(limit));
    query.push_str(" OFFSET ?");
    param_values.push(rusqlite::types::Value::Integer(offset));

    let mut stmt = conn.prepare(&query).map_err(|e| format!("query prepare error: {e}"))?;

    let rows = stmt
        .query_map(rusqlite::params_from_iter(param_values), |row| {
            Ok(Curriculum {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                link_image: row.get(5)?,
                level: {
                    let level_id: Option<String> = row.get(6)?;
                    let level_name: Option<String> = row.get(7)?;
                    let level_code: Option<String> = row.get(8)?;

                    match (level_id, level_name, level_code) {
                        (Some(level_id), Some(level_name), Some(level_code)) =>
                            Some(LevelInfo {
                                id: level_id,
                                name: level_name,
                                code_name: level_code,
                            }),
                        _ => None,
                    }
                },
                unit_count: row.get(9)?,
            })
        })
        .map_err(|e| format!("query error: {e}"))?;

    let data = rows.collect::<Result<Vec<_>, _>>().map_err(|e| format!("map rows error: {e}"))?;

    Ok(CurriculumPagination {
        data,
        meta: CurriculumPaginationMeta {
            total,
            page,
            limit,
            total_pages: total_pages.max(1),
        },
    })
}

// #[tauri::command]
// fn get_curriculum_by_id(
//     state: State<AppState>,
//     curriculum_id: String
// ) -> Result<Option<Curriculum>, String> {
//     let conn = open_connection(&state.db_path)?;

//     let mut stmt = conn
//         .prepare(
//             "SELECT id, name, description, created_at, updated_at, link_image
//              FROM curriculums
//              WHERE id = ?1"
//         )
//         .map_err(|e| format!("prepare error: {e}"))?;

//     let result = stmt
//         .query_row(params![curriculum_id], |row| {
//             Ok(Curriculum {
//                 id: row.get(0)?,
//                 name: row.get(1)?,
//                 description: row.get(2)?,
//                 created_at: row.get(3)?,
//                 updated_at: row.get(4)?,
//                 link_image: row.get(5)?,
//             })
//         })
//         .optional()
//         .map_err(|e| format!("query error: {e}"))?;

//     Ok(result)
// }

#[derive(Serialize)]
struct CurriculumDetail {
    id: String,
    name: String,
    description: String,
    created_at: String,
    updated_at: String,
    link_image: String,
    units: Vec<UnitResponse>,
    levels: Vec<LevelResponse>, // 👈 thêm
}

#[derive(Serialize)]
struct LevelResponse {
    level_id: String,
    level_code: Option<String>,
    level_name: Option<String>,
    level_description: Option<String>,
}

fn get_levels_by_curriculum(
    conn: &Connection,
    curriculum_id: &str
) -> Result<Vec<LevelResponse>, String> {
    let mut stmt = conn
        .prepare(
            "
        SELECT DISTINCT
            l.id,
            lc.code,
            l.name,
            '' as description
        FROM curriculum_units cu
        JOIN units u ON cu.unit_id = u.id
        LEFT JOIN levels l ON u.level_id = l.id
        LEFT JOIN levels_code lc ON l.code = lc.id
        WHERE cu.curriculum_id = ?1
        "
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([curriculum_id], |row| {
            Ok(LevelResponse {
                level_id: row.get(0)?,
                level_code: row.get(1)?,
                level_name: row.get(2)?,
                level_description: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[derive(Serialize)]
struct UnitResponse {
    unit_id: String,
    unit_name: String,
    unit_order: i32,
    link: String,

    level_id: Option<String>,
    level_name: Option<String>,
    level_description: Option<String>,
    level_code: Option<String>,
}

fn get_units_by_curriculum(
    conn: &Connection,
    curriculum_id: &str
) -> Result<Vec<UnitResponse>, String> {
    let mut stmt = conn
        .prepare(
            "
        SELECT 
            u.id,
            u.title,
            u.\"order\",
            u.link,

            l.id,
            l.name,
            '' as level_description,
            lc.code

        FROM curriculum_units cu
        JOIN units u ON cu.unit_id = u.id

        LEFT JOIN levels l ON u.level_id = l.id
        LEFT JOIN levels_code lc ON l.code = lc.id

        WHERE cu.curriculum_id = ?1
        ORDER BY u.\"order\"
        "
        )
        .map_err(|e| format!("prepare error: {e}"))?;

    let rows = stmt
        .query_map([curriculum_id], |row| {
            Ok(UnitResponse {
                unit_id: row.get(0)?,
                unit_name: row.get(1)?,
                unit_order: row.get(2)?,
                link: row.get(3)?,

                level_id: row.get(4).ok(),
                level_name: row.get(5).ok(),
                level_description: row.get(6).ok(),
                level_code: row.get(7).ok(),
            })
        })
        .map_err(|e| format!("query error: {e}"))?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| format!("map error: {e}"))
}

#[tauri::command]
fn get_curriculum_by_id(
    state: State<AppState>,
    curriculum_id: String
) -> Result<Option<CurriculumDetail>, String> {
    let conn = open_connection(&state.db_path)?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, description, created_at, updated_at, link_image
             FROM curriculums
             WHERE id = ?1"
        )
        .map_err(|e| format!("prepare error: {e}"))?;

    let curriculum = stmt
        .query_row([&curriculum_id], |row| {
            Ok(CurriculumDetail {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                link_image: row.get(5)?,
                units: vec![],
                levels: vec![], // 👈 thêm
            })
        })
        .optional()
        .map_err(|e| format!("query error: {e}"))?;

    if let Some(mut c) = curriculum {
        c.units = get_units_by_curriculum(&conn, &curriculum_id)?;
        c.levels = get_levels_by_curriculum(&conn, &curriculum_id)?; // 👈 thêm
        Ok(Some(c))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn add_words_to_unit(
    state: State<AppState>,
    unit_id: String,
    word_ids: Vec<String>
) -> Result<bool, String> {
    let mut conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let tx = conn.transaction().map_err(|e| format!("transaction error: {e}"))?;

    // 1. check unit tồn tại
    let exists: bool = tx
        .query_row("SELECT EXISTS(SELECT 1 FROM units WHERE id = ?1)", params![unit_id], |row|
            row.get(0)
        )
        .map_err(|e| format!("check unit error: {e}"))?;

    if !exists {
        return Ok(false);
    }

    let mut inserted_count = 0;

    for word_id in word_ids {
        // 2. check word tồn tại
        let word_exists: bool = tx
            .query_row("SELECT EXISTS(SELECT 1 FROM words WHERE id = ?1)", params![word_id], |row|
                row.get(0)
            )
            .map_err(|e| format!("check word error: {e}"))?;

        if !word_exists {
            continue;
        }

        // 3. check đã tồn tại trong words_units chưa
        let exists_in_unit: bool = tx
            .query_row(
                "SELECT EXISTS(
                    SELECT 1 FROM words_units 
                    WHERE unit_id = ?1 AND word_id = ?2
                )",
                params![unit_id, word_id],
                |row| row.get(0)
            )
            .map_err(|e| format!("check words_units error: {e}"))?;

        if exists_in_unit {
            continue;
        }

        // 4. insert
        tx
            .execute(
                "INSERT INTO words_units (unit_id, word_id) VALUES (?1, ?2)",
                params![unit_id, word_id]
            )
            .map_err(|e| format!("insert error: {e}"))?;

        inserted_count += 1;
    }

    tx.commit().map_err(|e| format!("commit error: {e}"))?;

    Ok(inserted_count > 0)
}

#[tauri::command]
fn check_word_to_unit(state: State<AppState>, payload: serde_json::Value) -> Result<bool, String> {
    let mut conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    // Support both snake_case and camelCase keys from frontend
    let unit_id = payload
        .get("unit_id")
        .or_else(|| payload.get("unitId"))
        .and_then(|v| v.as_str())
        .ok_or("missing unit id")?;
    let word_id = payload
        .get("word_id")
        .or_else(|| payload.get("wordId"))
        .and_then(|v| v.as_str())
        .ok_or("missing word id")?;

    let exists: bool = conn
        .query_row(
            "
            SELECT EXISTS (
                SELECT 1
                FROM words_units
                WHERE unit_id = ?1
                  AND word_id = ?2
            )
            ",
            params![unit_id, word_id],
            |row| row.get(0)
        )
        .map_err(|e| format!("query error: {e}"))?;

    Ok(exists)
}

#[derive(serde::Serialize)]
pub struct LessonUnit {
    pub unit_id: String,
    pub unit_title: String,
}

#[derive(serde::Serialize)]
pub struct LessonWord {
    pub word_id: String,
    pub word_text: String,
    pub word_max_read: i32,
    pub word_show_ipa: bool,
    pub word_show_word: bool,
    pub word_show_ipa_and_word: bool,
    pub word_pause_time: i32,
    pub word_reads_per_round: i32,
}

#[derive(serde::Serialize)]
pub struct LessonFull {
    pub lesson: Lesson,
    pub lesson_units: Vec<LessonUnit>,
    pub lesson_words: Vec<LessonWord>,
}

#[derive(serde::Deserialize)]
pub struct WordPayload {
    pub word_id: String,
    pub word_max_read: i32,
    pub word_show_ipa: i32,
    pub word_show_word: i32,
    pub word_show_ipa_and_word: i32,
    pub word_pause_time: i32,
    pub word_reads_per_round: i32,
}

#[tauri::command]
fn create_lesson_with_units(
    state: State<AppState>,
    name: String,
    curriculum_id: String,
    // order: i32,
    category: String,
    duration: i32,
    description: String,
    unit_ids: Vec<String>,
    words: Vec<WordPayload>
    // user_id: String
) -> Result<LessonFull, String> {
    let mut conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;
    let order = 0;
    let progress = 0;
    let lesson_id = next_id("lesson");

    let tx = conn.transaction().map_err(|e| format!("tx error: {e}"))?;

    // 1. insert lesson
    tx
        .execute(
            "
        INSERT INTO lessons (
            id, name, curriculum_id, \"order\",
            progress, category, duration, description,
            created_at, updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ",
            params![
                lesson_id,
                name,
                curriculum_id,
                order,
                progress,
                category,
                duration,
                description
            ]
        )
        .map_err(|e| format!("insert lesson error: {e}"))?;

    // 2. lesson_units
    for unit_id in &unit_ids {
        tx
            .execute(
                "INSERT INTO lessons_units (lesson_id, unit_id) VALUES (?1, ?2)",
                params![lesson_id, unit_id]
            )
            .map_err(|e| format!("insert lesson_units error: {e}"))?;
    }

    // 3. lessons_words
    for w in &words {
        tx
            .execute(
                "
            INSERT INTO lessons_words (
                lesson_id,
                word_id,
                word_max_read,
                word_show_ipa,
                word_show_word,
                word_show_ipa_and_word,
                word_pause_time,
                word_reads_per_round,
                word_progress
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0)
            ",
                params![
                    lesson_id,
                    w.word_id,
                    w.word_max_read,
                    w.word_show_ipa,
                    w.word_show_word,
                    w.word_show_ipa_and_word,
                    w.word_pause_time,
                    w.word_reads_per_round
                ]
            )
            .map_err(|e| format!("insert lesson_words error: {e}"))?;
    }

    // 4. build units response
    let lesson_units = unit_ids
        .iter()
        .map(|id| {
            LessonUnit {
                unit_id: id.clone(),
                unit_title: "".to_string(), // 👉 bạn có thể query lại nếu cần
            }
        })
        .collect::<Vec<_>>();

    // 5. query words
    let lesson_words = {
        let mut stmt = tx
            .prepare(
                "
        SELECT w.id, w.word,
               lw.word_max_read,
               lw.word_show_ipa,
               lw.word_show_word,
               lw.word_show_ipa_and_word,
               lw.word_pause_time,
               lw.word_reads_per_round
        FROM lessons_words lw
        JOIN words w ON w.id = lw.word_id
        WHERE lw.lesson_id = ?1
        "
            )
            .map_err(|e| format!("prepare words error: {e}"))?;

        let rows = stmt
            .query_map(params![lesson_id], |row| {
                Ok(LessonWord {
                    word_id: row.get(0)?,
                    word_text: row.get(1)?,
                    word_max_read: row.get(2)?,
                    word_show_ipa: row.get(3)?,
                    word_show_word: row.get(4)?,
                    word_show_ipa_and_word: row.get(5)?,
                    word_pause_time: row.get(6)?,
                    word_reads_per_round: row.get(7)?,
                })
            })
            .map_err(|e| format!("query words error: {e}"))?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| format!("map words error: {e}"))?;

        rows
    };

    tx.commit().map_err(|e| format!("commit error: {e}"))?;

    Ok(LessonFull {
        lesson: Lesson {
            id: lesson_id,
            name,
            order,
            progress: 0,
        },
        lesson_units,
        lesson_words,
    })
}

#[tauri::command]
fn delete_lesson(state: State<AppState>, lesson_id: String) -> Result<bool, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let affected = conn
        .execute(
            "
        UPDATE lessons
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ?1
        ",
            params![lesson_id]
        )
        .map_err(|e| format!("delete lesson error: {e}"))?;

    Ok(affected > 0)
}

#[derive(serde::Deserialize)]
pub struct WordUpdatePayload {
    pub word_id: String,
    pub word_progress: Option<i32>,
    pub word_max_read: Option<i32>,
    pub word_show_ipa: Option<i32>,
    pub word_show_word: Option<i32>,
    pub word_show_ipa_and_word: Option<i32>,
    pub word_reads_per_round: Option<i32>,
    pub word_pause_time: Option<i32>,
}

#[tauri::command]
fn update_lesson_detail(
    state: State<AppState>,
    lesson_id: String,
    name: String,
    duration: i32,
    description: String,
    words: Vec<WordUpdatePayload>
) -> Result<bool, String> {
    let mut conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let tx = conn.transaction().map_err(|e| format!("tx error: {e}"))?;

    // 1. update lesson
    tx
        .execute(
            "
        UPDATE lesson
        SET name = ?1,
            duration = ?2,
            description = ?3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?4
        ",
            params![name, duration, description, lesson_id]
        )
        .map_err(|e| format!("update lesson error: {e}"))?;

    // 2. upsert lesson_words
    for w in &words {
        tx
            .execute(
                "
            INSERT INTO lessons_words (
                lesson_id,
                word_id,
                word_progress,
                word_max_read,
                word_show_ipa,
                word_show_word,
                word_show_ipa_and_word,
                word_reads_per_round,
                word_pause_time,
                created_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP)
            ON CONFLICT(lesson_id, word_id)
            DO UPDATE SET
                word_progress = excluded.word_progress,
                word_max_read = excluded.word_max_read,
                word_show_ipa = excluded.word_show_ipa,
                word_show_word = excluded.word_show_word,
                word_show_ipa_and_word = excluded.word_show_ipa_and_word,
                word_reads_per_round = excluded.word_reads_per_round,
                word_pause_time = excluded.word_pause_time,
                updated_at = CURRENT_TIMESTAMP
            ",
                params![
                    lesson_id,
                    w.word_id,
                    w.word_progress.unwrap_or(0),
                    w.word_max_read.unwrap_or(0),
                    w.word_show_ipa.unwrap_or(0),
                    w.word_show_word.unwrap_or(0),
                    w.word_show_ipa_and_word.unwrap_or(0),
                    w.word_reads_per_round.unwrap_or(0),
                    w.word_pause_time.unwrap_or(0)
                ]
            )
            .map_err(|e| format!("upsert lesson_words error: {e}"))?;
    }

    tx.commit().map_err(|e| format!("commit error: {e}"))?;

    Ok(true)
}

#[derive(serde::Deserialize)]
pub struct WordProgressPayload {
    pub word_id: String,
    pub word_progress: Option<i32>,
    pub word_pause_time: Option<i32>,
}

#[tauri::command]
fn update_lesson_progress(
    state: State<AppState>,
    lesson_id: String,
    // user_id: String,
    name: Option<String>,
    order: Option<i32>,
    unit_ids: Option<Vec<String>>,
    words: Option<Vec<WordProgressPayload>>
) -> Result<Lesson, String> {
    let mut conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let tx = conn.transaction().map_err(|e| format!("tx error: {e}"))?;

    // --------------------------------------------------
    // 1. UPDATE lesson + check ownership
    // --------------------------------------------------
    let affected = tx
        .execute(
            "
        UPDATE lessons
        SET name = COALESCE(?1, name),
            \"order\" = COALESCE(?2, \"order\"),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?3 
        ",
            params![name, order, lesson_id]
        )
        .map_err(|e| format!("update lesson error: {e}"))?;

    if affected == 0 {
        return Err("lesson not found or access denied".into());
    }

    // --------------------------------------------------
    // 2. UPDATE lesson_units
    // --------------------------------------------------
    if let Some(unit_ids) = unit_ids {
        tx
            .execute("DELETE FROM lessons_units WHERE lesson_id = ?1", params![lesson_id])
            .map_err(|e| format!("delete lesson_units error: {e}"))?;

        for unit_id in unit_ids {
            tx
                .execute(
                    "INSERT INTO lessons_units (lesson_id, unit_id) VALUES (?1, ?2)",
                    params![lesson_id, unit_id]
                )
                .map_err(|e| format!("insert lesson_units error: {e}"))?;
        }
    }

    // --------------------------------------------------
    // 3. UPDATE lessons_words
    // --------------------------------------------------
    if let Some(words) = words {
        for w in words {
            tx
                .execute(
                    "
                UPDATE lessons_words
                SET word_progress = ?1,
                    word_pause_time = ?2
                WHERE lesson_id = ?3 AND word_id = ?4
                ",
                    params![
                        w.word_progress.unwrap_or(0),
                        w.word_pause_time.unwrap_or(0),
                        lesson_id,
                        w.word_id
                    ]
                )
                .map_err(|e| format!("update lessons_words error: {e}"))?;
        }
    }

    // --------------------------------------------------
    // 4. UPDATE progress
    // --------------------------------------------------
    tx
        .execute(
            "
        UPDATE lessons
        SET progress = COALESCE(
            (
                SELECT
                    CASE
                        WHEN SUM(word_max_read) > 0 THEN
                            (SUM(word_progress) * 100.0 / SUM(word_max_read))
                        ELSE 0
                    END
                FROM lessons_words
                WHERE lesson_id = ?1
            ),
            0
        )
        WHERE id = ?1
        ",
            params![lesson_id]
        )
        .map_err(|e| format!("update progress error: {e}"))?;

    // --------------------------------------------------
    // 5. RETURN lesson
    // --------------------------------------------------
    let lesson = tx
        .query_row(
            "SELECT id, name, \"order\", progress FROM lessons WHERE id = ?1",
            params![lesson_id],
            |row| {
                Ok(Lesson {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    order: row.get(2)?,
                    progress: row.get(3)?,
                })
            }
        )
        .map_err(|e| format!("fetch lesson error: {e}"))?;

    tx.commit().map_err(|e| format!("commit error: {e}"))?;

    Ok(lesson)
}

#[derive(serde::Serialize)]
pub struct ChildWord {
    pub word_id: String,
    pub word: String,
    pub ipa: Option<String>,
    pub meaning: Option<String>,
    pub parent_id: Option<String>,
}

#[derive(serde::Serialize)]
pub struct UnitChildWord {
    pub word_id: String,
    pub word: String,
    pub ipa: Option<String>,
    pub meaning: Option<String>,
    pub parent_id: Option<String>,
    pub word_popularity: i64,
    pub children_count: i64,
    pub custom: i64,
}

#[tauri::command]
fn get_children_words(state: State<AppState>, word_id: String) -> Result<Vec<ChildWord>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let mut stmt = conn
        .prepare(
            "
        SELECT id, word, ipa, meaning, parent_id
        FROM words
        WHERE parent_id = ?1
        "
        )
        .map_err(|e| format!("prepare error: {e}"))?;

    let rows = stmt
        .query_map(params![word_id], |row| {
            Ok(ChildWord {
                word_id: row.get(0)?,
                word: row.get(1)?,
                ipa: row.get(2).ok(),
                meaning: row.get(3).ok(),
                parent_id: row.get(4).ok(),
            })
        })
        .map_err(|e| format!("query error: {e}"))?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| format!("map error: {e}"))
}

#[tauri::command]
fn get_children_words_by_parent_id(
    state: State<AppState>,
    parent_word_id: String
) -> Result<Vec<UnitChildWord>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let mut stmt = conn
        .prepare(
            "
        SELECT
            w.id,
            w.word,
            COALESCE(NULLIF(w.ipa, ''), NULLIF(w.uk_ipa, ''), NULLIF(w.us_ipa, ''), NULLIF(w.ipa_uk, ''), NULLIF(w.ipa_us, '')) AS ipa,
            w.meaning,
            w.parent_id,
            COALESCE(w.popularity, 0) AS word_popularity,
            (
                SELECT COUNT(*)
                FROM words c
                WHERE c.parent_id = w.id
            ) AS children_count,
            COALESCE(MAX(wu.custom), 0) AS custom
        FROM words w
        LEFT JOIN words_units wu ON wu.word_id = w.id
        WHERE w.parent_id = ?1
        GROUP BY w.id, w.word, w.ipa, w.uk_ipa, w.us_ipa, w.ipa_uk, w.ipa_us, w.meaning, w.parent_id, w.popularity
        ORDER BY w.word
        "
        )
        .map_err(|e| format!("prepare error: {e}"))?;

    let rows = stmt
        .query_map(params![parent_word_id], |row| {
            Ok(UnitChildWord {
                word_id: row.get(0)?,
                word: row.get(1)?,
                ipa: row.get(2).ok(),
                meaning: row.get(3).ok(),
                parent_id: row.get(4).ok(),
                word_popularity: row.get(5)?,
                children_count: row.get(6)?,
                custom: row.get(7)?,
            })
        })
        .map_err(|e| format!("query error: {e}"))?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| format!("map error: {e}"))
}

#[derive(serde::Serialize)]
pub struct LessonDetail {
    pub id: String,
    pub name: String,
    pub order: i32,
    pub created_at: Option<String>,
    pub description: Option<String>,
    pub words: Vec<LessonWordDetail>,
    pub units: Vec<LessonUnitDetail>,
}

#[derive(serde::Serialize)]
pub struct LessonWordDetail {
    pub id: String,
    pub word: String,
    pub uk_ipa: Option<String>,
    pub us_ipa: Option<String>,
    pub meaning: Option<String>,
    pub word_max_read: i32,
    pub word_show_ipa: i32,
    pub word_show_word: i32,
    pub word_show_ipa_and_word: i32,
    pub word_progress: i32,
    pub word_reads_per_round: i32,
    pub word_pause_time: i32,
}

#[derive(serde::Serialize)]
pub struct LessonUnitDetail {
    pub id: String,
    pub name: String,
}

#[tauri::command]
fn get_lesson_by_id(state: State<AppState>, lesson_id: String) -> Result<LessonDetail, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    // --------------------------------------------------
    // 1. GET lesson (check ownership)
    // --------------------------------------------------
    let lesson = conn
        .query_row(
            "
        SELECT id, name, \"order\", created_at, description
        FROM lessons
        WHERE id = ?1
        ",
            params![lesson_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i32>(2)?,
                    row.get::<_, Option<String>>(3)?,
                    row.get::<_, Option<String>>(4)?,
                ))
            }
        )
        .map_err(|_| "lesson not found or access denied".to_string())?;

    // --------------------------------------------------
    // 2. GET words
    // --------------------------------------------------
    let mut stmt_words = conn
        .prepare(
            "
        SELECT 
            w.id, w.word, w.uk_ipa, w.us_ipa, w.meaning,
            lw.word_max_read,
            lw.word_show_ipa,
            lw.word_show_word,
            lw.word_show_ipa_and_word,
            lw.word_progress,
            lw.word_reads_per_round,
            lw.word_pause_time
        FROM lessons_words lw
        JOIN words w ON w.id = lw.word_id
        WHERE lw.lesson_id = ?1
        "
        )
        .map_err(|e| format!("prepare words error: {e}"))?;

    let words = stmt_words
        .query_map(params![lesson_id], |row| {
            Ok(LessonWordDetail {
                id: row.get(0)?,
                word: row.get(1)?,
                uk_ipa: row.get(2).ok(),
                us_ipa: row.get(3).ok(),
                meaning: row.get(4).ok(),
                word_max_read: row.get(5)?,
                word_show_ipa: row.get(6)?,
                word_show_word: row.get(7)?,
                word_show_ipa_and_word: row.get(8)?,
                word_progress: row.get(9)?,
                word_reads_per_round: row.get(10)?,
                word_pause_time: row.get(11)?,
            })
        })
        .map_err(|e| format!("query words error: {e}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("map words error: {e}"))?;

    // --------------------------------------------------
    // 3. GET units
    // --------------------------------------------------
    let mut stmt_units = conn
        .prepare(
            "
        SELECT u.id, u.title
        FROM lessons_units lu
        JOIN units u ON u.id = lu.unit_id
        WHERE lu.lesson_id = ?1
        ORDER BY u.\"order\"
        "
        )
        .map_err(|e| format!("prepare units error: {e}"))?;

    let units = stmt_units
        .query_map(params![lesson_id], |row| {
            Ok(LessonUnitDetail {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })
        .map_err(|e| format!("query units error: {e}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("map units error: {e}"))?;

    // --------------------------------------------------
    // 4. BUILD RESULT
    // --------------------------------------------------
    Ok(LessonDetail {
        id: lesson.0,
        name: lesson.1,
        order: lesson.2,
        created_at: lesson.3,
        description: lesson.4,
        words,
        units,
    })
}

#[derive(serde::Serialize)]
pub struct StudentBookDetail {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub work_book_id: Option<String>,
    pub units: Vec<UnitBasic>,
}

#[derive(serde::Serialize)]
pub struct WorkBookDetail {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub student_book_id: Option<String>,
    pub units: Vec<UnitBasic>,
}

#[derive(serde::Serialize)]
pub struct UnitBasic {
    pub id: String,
    pub title: String,
    pub link: Option<String>,
}

#[tauri::command]
fn get_student_book_by_id(state: State<AppState>, id: String) -> Result<StudentBookDetail, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    // --------------------------------------------------
    // 1. GET curriculum
    // --------------------------------------------------
    let book = conn
        .query_row(
            "
        SELECT id, name, description, created_at, updated_at, work_book_id
        FROM curriculums
        WHERE id = ?1
        ",
            params![id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?,
                    row.get::<_, Option<String>>(3)?,
                    row.get::<_, Option<String>>(4)?,
                    row.get::<_, Option<String>>(5)?,
                ))
            }
        )
        .map_err(|_| "student book not found".to_string())?;

    // --------------------------------------------------
    // 2. GET units
    // --------------------------------------------------
    let mut stmt = conn
        .prepare(
            "
        SELECT u.id, u.title, u.link
        FROM curriculum_units cu
        JOIN units u ON u.id = cu.unit_id
        WHERE cu.curriculum_id = ?1
        ORDER BY u.\"order\"
        "
        )
        .map_err(|e| format!("prepare units error: {e}"))?;

    let units = stmt
        .query_map(params![id], |row| {
            Ok(UnitBasic {
                id: row.get(0)?,
                title: row.get(1)?,
                link: row.get(2).ok(),
            })
        })
        .map_err(|e| format!("query units error: {e}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("map units error: {e}"))?;

    // --------------------------------------------------
    // 3. BUILD RESULT
    // --------------------------------------------------
    Ok(StudentBookDetail {
        id: book.0,
        name: book.1,
        description: book.2,
        created_at: book.3,
        updated_at: book.4,
        work_book_id: book.5,
        units,
    })
}

#[tauri::command]
fn get_work_book_by_id(state: State<AppState>, id: String) -> Result<WorkBookDetail, String> {
    println!("🔍 get_work_book_by_id called with id: {:?}", id);

    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    // --------------------------------------------------
    // 1. GET curriculum
    // --------------------------------------------------
    let book = conn
        .query_row(
            "
        SELECT id, name, description, created_at, updated_at, student_book_id
        FROM curriculums
        WHERE id = ?1
        ",
            params![id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?,
                    row.get::<_, Option<String>>(3)?,
                    row.get::<_, Option<String>>(4)?,
                    row.get::<_, Option<String>>(5)?,
                ))
            }
        )
        .map_err(|e| {
            let error_msg = format!("query error for id '{}': {}", id, e);
            println!("❌ {}", error_msg);
            error_msg
        })?;

    println!("✅ Found curriculum: {}", book.1);

    // --------------------------------------------------
    // 2. GET units
    // --------------------------------------------------
    let mut stmt = conn
        .prepare(
            "
        SELECT u.id, u.title, u.link
        FROM curriculum_units cu
        JOIN units u ON u.id = cu.unit_id
        WHERE cu.curriculum_id = ?1
        ORDER BY u.\"order\"
        "
        )
        .map_err(|e| format!("prepare units error: {e}"))?;

    let units = stmt
        .query_map(params![id], |row| {
            Ok(UnitBasic {
                id: row.get(0)?,
                title: row.get(1)?,
                link: row.get(2).ok(),
            })
        })
        .map_err(|e| format!("query units error: {e}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("map units error: {e}"))?;

    // --------------------------------------------------
    // 3. BUILD RESULT
    // --------------------------------------------------
    Ok(WorkBookDetail {
        id: book.0,
        name: book.1,
        description: book.2,
        created_at: book.3,
        updated_at: book.4,
        student_book_id: book.5,
        units,
    })
}

#[derive(serde::Deserialize)]
pub struct WordBulkPayload {
    pub word_id: String,
    pub word_progress: Option<i32>,
    pub word_max_read: Option<i32>,
    pub word_show_ipa: Option<i32>,
    pub word_show_word: Option<i32>,
    pub word_show_ipa_and_word: Option<i32>,
    pub word_reads_per_round: Option<i32>,
    pub word_pause_time: Option<i32>,
}

#[tauri::command]
fn update_lesson_words_bulk(
    state: State<AppState>,
    lesson_id: String,
    name: String,
    duration: i32,
    description: String,
    words: Vec<WordBulkPayload>
) -> Result<bool, String> {
    let mut conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let tx = conn.transaction().map_err(|e| format!("tx error: {e}"))?;

    // --------------------------------------------------
    // 1. UPDATE lesson
    // --------------------------------------------------
    tx
        .execute(
            "
        UPDATE lessons
        SET name = ?1,
            duration = ?2,
            description = ?3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?4
        ",
            params![name, duration, description, lesson_id]
        )
        .map_err(|e| format!("update lesson error: {e}"))?;

    // --------------------------------------------------
    // 2. UPSERT lesson_words (bulk)
    // --------------------------------------------------
    {
        let mut stmt = tx
            .prepare(
                "
        INSERT INTO lessons_words (
            lesson_id,
            word_id,
            word_progress,
            word_max_read,
            word_show_ipa,
            word_show_word,
            word_show_ipa_and_word,
            word_reads_per_round,
            word_pause_time,
            created_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP)
        ON CONFLICT(lesson_id, word_id)
        DO UPDATE SET
            word_progress = excluded.word_progress,
            word_max_read = excluded.word_max_read,
            word_show_ipa = excluded.word_show_ipa,
            word_show_word = excluded.word_show_word,
            word_show_ipa_and_word = excluded.word_show_ipa_and_word,
            word_reads_per_round = excluded.word_reads_per_round,
            word_pause_time = excluded.word_pause_time,
            updated_at = CURRENT_TIMESTAMP
        "
            )
            .map_err(|e| format!("prepare error: {e}"))?;

        for w in words {
            stmt
                .execute(
                    params![
                        lesson_id,
                        w.word_id,
                        w.word_progress.unwrap_or(0),
                        w.word_max_read.unwrap_or(0),
                        w.word_show_ipa.unwrap_or(0),
                        w.word_show_word.unwrap_or(0),
                        w.word_show_ipa_and_word.unwrap_or(0),
                        w.word_reads_per_round.unwrap_or(0),
                        w.word_pause_time.unwrap_or(0)
                    ]
                )
                .map_err(|e| format!("upsert error: {e}"))?;
        }
    }

    tx.commit().map_err(|e| format!("commit error: {e}"))?;

    Ok(true)
}

fn count_children(conn: &Connection, word_id: &str) -> Result<i32, String> {
    conn.query_row("SELECT COUNT(*) FROM words WHERE parent_id = ?1", [word_id], |row|
        row.get(0)
    ).map_err(|e| e.to_string())
}

fn validate_unit_ids(unit_ids: &Vec<String>) -> Result<(), String> {
    if unit_ids.is_empty() {
        return Err("unit_ids is empty".into());
    }
    Ok(())
}

fn build_get_words_query(unit_ids: &Vec<String>) -> String {
    let placeholders = unit_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(",");

    format!(r#"
        SELECT 
            u.id,
            u.title,
            u."order",

            w.id,
            w.word,
            w.meaning,
            COALESCE(NULLIF(w.ipa, ''), NULLIF(w.uk_ipa, ''), NULLIF(w.us_ipa, ''), NULLIF(w.ipa_uk, ''), NULLIF(w.ipa_us, '')) AS ipa,
            w.popularity,
            wu.custom,
            w.parent_id,

            (
                SELECT COUNT(*) 
                FROM words lw2 
                WHERE lw2.parent_id = w.id
            ) as children_count

        FROM units u
        LEFT JOIN words_units wu ON wu.unit_id = u.id
        LEFT JOIN words w ON w.id = wu.word_id

        WHERE u.id IN ({})
        "#, placeholders)
}

fn fetch_words(
    conn: &Connection,
    query: &str,
    unit_ids: &Vec<String>
) -> Result<Vec<UnitWithWords>, String> {
    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params_from_iter(unit_ids), |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, i32>(2)?,
                row.get::<_, Option<String>>(3)?,
                row.get::<_, Option<String>>(4)?,
                row.get::<_, Option<String>>(5)?,
                row.get::<_, Option<String>>(6)?,
                row.get::<_, Option<i64>>(7)?,
                row.get::<_, Option<i64>>(8)?,
                row.get::<_, Option<String>>(9)?,
                row.get::<_, i64>(10)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut grouped: HashMap<String, UnitWithWords> = HashMap::new();
    for r in rows {
        let (
            unit_id,
            unit_name,
            unit_order,
            word_id,
            word_text,
            word_meaning,
            word_ipa,
            word_popularity,
            word_custom,
            word_parent_id,
            children_count,
        ) = r.map_err(|e| e.to_string())?;

        let entry = grouped.entry(unit_id.clone()).or_insert_with(|| UnitWithWords {
            unit_id: unit_id.clone(),
            unit_name: unit_name.clone(),
            unit_order,
            unit_words: UnitWords {
                original: Vec::new(),
                custom: Vec::new(),
            },
        });

        let Some(id) = word_id else {
            continue;
        };

        let word_item = WordItem {
            id,
            word: word_text.unwrap_or_default(),
            meaning: word_meaning,
            ipa: word_ipa,
            // popularity: word_popularity,
            parent_id: word_parent_id.clone(),
            children_count,
        };

        let is_custom = word_custom.unwrap_or(0) != 0;
        if is_custom {
            entry.unit_words.custom.push(word_item);
        } else {
            entry.unit_words.original.push(word_item);
        }
    }

    let mut result: Vec<UnitWithWords> = grouped.into_values().collect();
    result.sort_by(|left, right| {
        left.unit_order.cmp(&right.unit_order).then_with(|| left.unit_name.cmp(&right.unit_name))
    });

    Ok(result)
}

#[tauri::command]
fn get_words_by_units(
    state: State<AppState>,
    unit_ids: Vec<String>
) -> Result<Vec<UnitWithWords>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| e.to_string())?;

    validate_unit_ids(&unit_ids)?;

    let query = build_get_words_query(&unit_ids);

    let words = fetch_words(&conn, &query, &unit_ids)?;
    println!("Fetched {} words for units {:?}", words.len(), unit_ids);
    Ok(words)
}

#[derive(serde::Serialize)]
pub struct LessonListItem {
    pub id: String,
    pub name: String,
    pub order: i32,
    pub duration: Option<i32>,
    pub progress: i32,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub description: Option<String>,
    pub words_count: i64,
    pub category: Option<String>,
}

#[derive(serde::Serialize)]
pub struct LessonListResponse {
    pub data: Vec<LessonListItem>,
    pub meta: LessonListMeta,
}

#[derive(serde::Serialize)]
pub struct LessonListMeta {
    pub page: i64,
    pub limit: i64,
    pub total: i64,
    pub total_pages: i64,
}

#[tauri::command]
fn get_lesson_list(
    state: State<AppState>,
    search: String,
    limit: i64,
    page: i64,
    sort_by: Option<String>,
    sort_order: Option<String>
) -> Result<LessonListResponse, String> {
    let conn = open_connection(&state.db_path).map_err(|e| e.to_string())?;

    // 👉 normalize
    let limit = if limit <= 0 { 10 } else { limit };
    let page = if page <= 0 { 1 } else { page };
    let offset = (page - 1) * limit;

    let search_value = format!("%{}%", search.trim());

    // 👉 whitelist sort field (TRÁNH SQL injection)
    let sort_by = match sort_by.as_deref() {
        Some("name") => "name",
        Some("created_at") => "created_at",
        Some("order") => "\"order\"",
        Some("progress") => "progress",
        Some("duration") => "duration",
        _ => "created_at",
    };

    let sort_order = match sort_order.as_deref() {
        Some("asc") => "ASC",
        Some("desc") => "DESC",
        _ => "DESC",
    };

    // =========================
    // 🔢 COUNT TOTAL
    // =========================
    let total: i64 = conn
        .query_row(
            "
        SELECT COUNT(*)
        FROM lessons
        WHERE deleted_at IS NULL
          AND name LIKE ?1
        ",
            [&search_value],
            |row| row.get(0)
        )
        .map_err(|e| e.to_string())?;

    let total_pages = ((total as f64) / (limit as f64)).ceil() as i64;
    let meta = LessonListMeta {
        page,
        limit,
        total,
        total_pages,
    };
    // =========================
    // 📦 DATA
    // =========================
    let query = format!(
        "
        SELECT 
            id,
            name,
            \"order\",
            duration,
            progress,
            created_at,
            updated_at,
            description,
            (SELECT COUNT(*) FROM lessons_words WHERE lessons_words.lesson_id = lessons.id) AS words_count,
            category
        FROM lessons
        WHERE deleted_at IS NULL
          AND name LIKE ?1
        ORDER BY {} {}
        LIMIT ?2 OFFSET ?3
        ",
        sort_by,
        sort_order
    );

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![search_value, limit, offset], |row| {
            Ok(LessonListItem {
                id: row.get(0)?,
                name: row.get(1)?,
                order: row.get(2)?,
                duration: row.get(3)?,
                progress: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                description: row.get(7)?,
                words_count: row.get(8)?,
                category: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let data = rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;

    Ok(LessonListResponse { data, meta })
}

#[derive(serde::Serialize)]
pub struct Note {
    pub id: String,
    pub unit_id: String,
    pub content: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[tauri::command]
fn get_note_by_id(
    state: State<AppState>,
    payload: serde_json::Value
) -> Result<Option<Note>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let unit_id = payload
        .get("unit_id")
        .or_else(|| payload.get("unitId"))
        .and_then(|v| v.as_str())
        .ok_or("missing unit id")?;

    let mut stmt = conn
        .prepare(
            "
            SELECT 
                id,
                unit_id,
                content,
                created_at,
                updated_at
            FROM notes
            WHERE unit_id = ?1
            LIMIT 1
            "
        )
        .map_err(|e| format!("prepare error: {e}"))?;

    let result = stmt
        .query_row([unit_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                unit_id: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .optional() // 👈 QUAN TRỌNG
        .map_err(|e| format!("query error: {e}"))?;

    Ok(result)
}

#[tauri::command]
fn delete_note(state: State<AppState>, note_id: String) -> Result<bool, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let affected = conn
        .execute("DELETE FROM notes WHERE id = ?1", rusqlite::params![note_id])
        .map_err(|e| format!("delete error: {e}"))?;

    Ok(affected > 0)
}

#[derive(serde::Deserialize)]
pub struct UpsertUnitNotePayload {
    pub unit_id: String,
    pub content: String,
}

#[derive(serde::Serialize)]
pub struct UnitNoteRow {
    pub id: String,
    pub unit_id: String,
    pub content: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[tauri::command]
fn upsert_unit_note(
    state: State<AppState>,
    payload: UpsertUnitNotePayload
) -> Result<UnitNoteRow, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let now = chrono::Utc::now().to_rfc3339();

    // Replace the existing note for the unit, if any.
    conn
        .execute("DELETE FROM notes WHERE unit_id = ?1", rusqlite::params![payload.unit_id])
        .map_err(|e| format!("delete before upsert error: {e}"))?;

    conn
        .execute(
            "
        INSERT INTO notes (id, unit_id, content, created_at, updated_at)
        VALUES (lower(hex(randomblob(16))), ?1, ?2, ?3, ?3)
        ",
            rusqlite::params![payload.unit_id, payload.content, now]
        )
        .map_err(|e| format!("insert error: {e}"))?;

    // 🔥 SELECT lại giống `.select().single()`
    let mut stmt = conn
        .prepare(
            "
        SELECT id, unit_id, content, created_at, updated_at
        FROM notes
        WHERE unit_id = ?1
        LIMIT 1
        "
        )
        .map_err(|e| e.to_string())?;

    let note = stmt
        .query_row(rusqlite::params![payload.unit_id], |row| {
            Ok(UnitNoteRow {
                id: row.get(0)?,
                unit_id: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| format!("select error: {e}"))?;

    Ok(note)
}

#[tauri::command]
fn resolve_audio(
    state: State<AppState>,
    word: String,
    accent: String
) -> Result<Option<String>, String> {
    let normalized = normalize_word_to_filename(&word);
    if normalized.is_empty() {
        return Ok(None);
    }

    let accent_normalized = match accent.to_ascii_lowercase().as_str() {
        "uk" => "uk",
        "us" => "us",
        _ => {
            return Ok(None);
        }
    };

    let accent_dir = state.audio_root.join(accent_normalized);
    fs::create_dir_all(&accent_dir).map_err(|e| format!("failed to ensure accent dir: {e}"))?;

    let file_path = accent_dir.join(format!("{normalized}.mp3"));
    if file_path.exists() {
        return Ok(Some(file_path.to_string_lossy().into_owned()));
    }

    let base_url = std::env
        ::var("AUDIO_BASE_URL")
        .unwrap_or_else(|_| DEFAULT_AUDIO_BASE_URL.to_string());
    let remote_url = format!(
        "{}/{}/{}.mp3",
        base_url.trim_end_matches('/'),
        accent_normalized,
        normalized
    );

    let google_tl = if accent_normalized == "uk" { "en-GB" } else { "en-US" };
    let google_tts_url = format!(
        "https://translate.google.com/translate_tts?ie=UTF-8&q={}&tl={}&client=tw-ob",
        urlencoding::encode(&word),
        google_tl
    );

    let client = Client::new();
    let mut downloaded_body = None;

    for url in [remote_url, google_tts_url] {
        let response = client.get(&url).header("User-Agent", "Mozilla/5.0").send();
        let Ok(response) = response else {
            continue;
        };

        if !response.status().is_success() {
            continue;
        }

        let body = response.bytes();
        let Ok(body) = body else {
            continue;
        };

        if body.is_empty() {
            continue;
        }

        downloaded_body = Some(body);
        break;
    }

    let Some(body) = downloaded_body else {
        return Ok(None);
    };

    if fs::write(&file_path, &body).is_err() {
        return Ok(None);
    }
    println!("Audio for word '{}' saved to '{}'", word, file_path.display());
    Ok(Some(file_path.to_string_lossy().into_owned()))
}

// Fetch Cambridge page HTML and parse IPA/audio data for a word.
fn fetch_cambridge_ipa_and_audio(
    word: &str
) -> Result<(Option<String>, Option<String>, Option<String>, Option<String>), String> {
    let url = format!(
        "https://dictionary.cambridge.org/dictionary/english/{}",
        urlencoding::encode(word)
    );
    let client = Client::new();
    let resp = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0")
        .send()
        .map_err(|e| format!("request error: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!("cambridge returned status {}", resp.status()));
    }

    let html = resp.text().map_err(|e| format!("read body error: {e}"))?;
    let document = Html::parse_document(&html);

    let sel_uk_ipa = Selector::parse("span.uk .ipa").ok();
    let sel_us_ipa = Selector::parse("span.us .ipa").ok();
    let sel_ipa = Selector::parse("span.ipa").ok();
    let sel_uk_source = Selector::parse("span.uk source[type=\"audio/mpeg\"]").ok();
    let sel_us_source = Selector::parse("span.us source[type=\"audio/mpeg\"]").ok();

    let uk_ipa = sel_uk_ipa
        .and_then(|s|
            document
                .select(&s)
                .next()
                .map(|e| e.text().collect::<String>().trim().to_string())
        )
        .filter(|s| !s.is_empty());

    let us_ipa = sel_us_ipa
        .and_then(|s|
            document
                .select(&s)
                .next()
                .map(|e| e.text().collect::<String>().trim().to_string())
        )
        .filter(|s| !s.is_empty());

    let uk_src = sel_uk_source.and_then(|s|
        document
            .select(&s)
            .next()
            .and_then(|e| e.value().attr("src"))
            .map(|s| s.to_string())
    );

    let us_src = sel_us_source.and_then(|s|
        document
            .select(&s)
            .next()
            .and_then(|e| e.value().attr("src"))
            .map(|s| s.to_string())
    );

    // fallback: find any .ipa
    let uk_ipa = match uk_ipa {
        Some(v) => Some(v),
        None =>
            sel_ipa
                .and_then(|s|
                    document
                        .select(&s)
                        .next()
                        .map(|e| e.text().collect::<String>().trim().to_string())
                )
                .filter(|s| !s.is_empty()),
    };

    // Prepend host to src if present
    let uk_url = uk_src.map(|s| (
        if s.starts_with("http") {
            s
        } else {
            format!("https://dictionary.cambridge.org{}", s)
        }
    ));
    let us_url = us_src.map(|s| (
        if s.starts_with("http") {
            s
        } else {
            format!("https://dictionary.cambridge.org{}", s)
        }
    ));

    Ok((uk_ipa, us_ipa, uk_url, us_url))
}

#[derive(Serialize)]
struct IpaResponse {
    id: Option<String>,
    meaning: Option<String>,
    uk_ipa: Option<String>,
    us_ipa: Option<String>,
    word: Option<String>,
}

#[tauri::command]
fn get_ipa(state: State<AppState>, word: String) -> Result<Option<IpaResponse>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, meaning, uk_ipa, us_ipa, word FROM words WHERE LOWER(word) = LOWER(?1) LIMIT 1"
        )
        .map_err(|e| format!("prepare error: {e}"))?;

    let result = stmt
        .query_row(params![&word], |row| {
            Ok(IpaResponse {
                id: row.get::<_, Option<String>>(0)?,
                meaning: row.get::<_, Option<String>>(1)?,
                uk_ipa: row.get::<_, Option<String>>(2)?,
                us_ipa: row.get::<_, Option<String>>(3)?,
                word: row.get::<_, Option<String>>(4)?,
            })
        })
        .optional()
        .map_err(|e| format!("query error: {e}"))?;

    if result.is_some() {
        return Ok(result);
    }

    let (uk_ipa, us_ipa, uk_url, us_url) = match fetch_cambridge_ipa_and_audio(&word) {
        Ok(data) => data,
        Err(_) => {
            return Ok(None);
        }
    };

    if uk_ipa.is_none() && us_ipa.is_none() && uk_url.is_none() && us_url.is_none() {
        return Ok(None);
    }

    let now = chrono::Utc::now().to_rfc3339();
    let id = next_id("word");
    let ipa_combined = uk_ipa.clone().or(us_ipa.clone()).unwrap_or_default();
    let uk_value = uk_ipa.clone().unwrap_or_default();
    let us_value = us_ipa.clone().unwrap_or_default();

    conn
        .execute(
            "INSERT INTO words (id, word, meaning, ipa, uk_ipa, us_ipa, ipa_uk, ipa_us, popularity, parent_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0, NULL, ?9, ?9)",
            rusqlite::params![
                id.clone(),
                word.clone(),
                String::new(),
                ipa_combined,
                uk_value.clone(),
                us_value.clone(),
                uk_value,
                us_value,
                now
            ]
        )
        .map_err(|e| format!("failed to insert word: {e}"))?;

    let normalized = normalize_word_to_filename(&word);
    let client = Client::new();

    if let Some(url) = uk_url {
        let accent_dir = state.audio_root.join("uk");
        fs::create_dir_all(&accent_dir).map_err(|e| format!("failed to create uk audio dir: {e}"))?;
        let file_path = accent_dir.join(format!("{normalized}.mp3"));
        if !file_path.exists() {
            if let Ok(resp) = client.get(&url).header("User-Agent", "Mozilla/5.0").send() {
                if resp.status().is_success() {
                    if let Ok(bytes) = resp.bytes() {
                        let _ = fs::write(&file_path, &bytes);
                    }
                }
            }
        }
    }

    if let Some(url) = us_url {
        let accent_dir = state.audio_root.join("us");
        fs::create_dir_all(&accent_dir).map_err(|e| format!("failed to create us audio dir: {e}"))?;
        let file_path = accent_dir.join(format!("{normalized}.mp3"));
        if !file_path.exists() {
            if let Ok(resp) = client.get(&url).header("User-Agent", "Mozilla/5.0").send() {
                if resp.status().is_success() {
                    if let Ok(bytes) = resp.bytes() {
                        let _ = fs::write(&file_path, &bytes);
                    }
                }
            }
        }
    }

    Ok(
        Some(IpaResponse {
            id: Some(id),
            meaning: None,
            uk_ipa,
            us_ipa,
            word: Some(word),
        })
    )
}

#[tauri::command]
fn get_ipa_from_file(
    state: State<AppState>,
    file_path: String
) -> Result<Vec<IpaResponse>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    // Read file content
    let file_content = fs
        ::read_to_string(&file_path)
        .map_err(|e| format!("failed to read file '{}': {e}", file_path))?;

    // Parse JSON to extract words (expect array of strings or objects with 'word' field)
    let words: Vec<String> = if let Ok(arr) = serde_json::from_str::<Vec<String>>(&file_content) {
        arr
    } else if let Ok(arr) = serde_json::from_str::<Vec<serde_json::Value>>(&file_content) {
        arr.iter()
            .filter_map(|v| {
                if let Some(s) = v.as_str() {
                    Some(s.to_string())
                } else if let Some(obj) = v.as_object() {
                    obj.get("word")
                        .or_else(|| obj.get("text"))
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string())
                } else {
                    None
                }
            })
            .collect()
    } else {
        return Err(
            "file is not valid JSON (expected array of strings or objects with 'word'/'text' field)".into()
        );
    };

    let mut results = Vec::new();

    for word in words {
        if word.trim().is_empty() {
            continue;
        }

        let mut stmt = conn
            .prepare(
                "SELECT id, meaning, uk_ipa, us_ipa, word FROM words WHERE LOWER(word) = LOWER(?1) LIMIT 1"
            )
            .map_err(|e| format!("prepare error: {e}"))?;

        match
            stmt.query_row(params![word], |row| {
                Ok(IpaResponse {
                    id: row.get::<_, Option<String>>(0)?,
                    meaning: row.get::<_, Option<String>>(1)?,
                    uk_ipa: row.get::<_, Option<String>>(2)?,
                    us_ipa: row.get::<_, Option<String>>(3)?,
                    word: row.get::<_, Option<String>>(4)?,
                })
            })
        {
            Ok(ipa_data) => results.push(ipa_data),
            Err(_) => {
                // Word not found, skip or add empty entry
                results.push(IpaResponse {
                    id: None,
                    meaning: None,
                    uk_ipa: None,
                    us_ipa: None,
                    word: None,
                });
            }
        }
    }

    Ok(results)
}

#[tauri::command]
fn get_ipa_from_content(
    state: State<AppState>,
    content: String
) -> Result<Vec<IpaResponse>, String> {
    let conn = open_connection(&state.db_path).map_err(|e| format!("open db error: {e}"))?;

    // Parse JSON content to extract words (array of strings or objects with 'word'/'text')
    let words: Vec<String> = if let Ok(arr) = serde_json::from_str::<Vec<String>>(&content) {
        arr
    } else if let Ok(arr) = serde_json::from_str::<Vec<serde_json::Value>>(&content) {
        arr.iter()
            .filter_map(|v| {
                if let Some(s) = v.as_str() {
                    Some(s.to_string())
                } else if let Some(obj) = v.as_object() {
                    obj.get("word")
                        .or_else(|| obj.get("text"))
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string())
                } else {
                    None
                }
            })
            .collect()
    } else {
        return Err(
            "content is not valid JSON (expected array of strings or objects with 'word'/'text' field)".into()
        );
    };

    let mut results = Vec::new();

    for word in words {
        if word.trim().is_empty() {
            results.push(IpaResponse {
                id: None,
                meaning: None,
                uk_ipa: None,
                us_ipa: None,
                word: None,
            });
            continue;
        }

        let mut stmt = conn
            .prepare(
                "SELECT id, meaning, uk_ipa, us_ipa, word FROM words WHERE LOWER(word) = LOWER(?1) LIMIT 1"
            )
            .map_err(|e| format!("prepare error: {e}"))?;

        match
            stmt.query_row(params![word], |row| {
                Ok(IpaResponse {
                    id: row.get::<_, Option<String>>(0)?,
                    meaning: row.get::<_, Option<String>>(1)?,
                    uk_ipa: row.get::<_, Option<String>>(2)?,
                    us_ipa: row.get::<_, Option<String>>(3)?,
                    word: row.get::<_, Option<String>>(4)?,
                })
            })
        {
            Ok(ipa_data) => results.push(ipa_data),
            Err(_) =>
                results.push(IpaResponse {
                    id: None,
                    meaning: None,
                    uk_ipa: None,
                    us_ipa: None,
                    word: None,
                }),
        }
    }

    Ok(results)
}

fn ensure_runtime_layout(base_app_data: &Path) -> Result<(PathBuf, PathBuf), String> {
    let data_root = base_app_data.join("data");
    let audio_root = data_root.join("audio");
    let uk_dir = audio_root.join("uk");
    let us_dir = audio_root.join("us");

    fs::create_dir_all(&uk_dir).map_err(|e| format!("failed to create uk audio dir: {e}"))?;
    fs::create_dir_all(&us_dir).map_err(|e| format!("failed to create us audio dir: {e}"))?;

    // In dev mode, copy bundled seed audio files from workspace data/audio
    // to the runtime app data directory if they are missing there.
    if let Ok(project_root) = std::env::current_dir() {
        let mut audio_roots = vec![project_root.join("data").join("audio")];
        if let Some(parent) = project_root.parent() {
            audio_roots.push(parent.join("data").join("audio"));
        }

        for candidate in audio_roots {
            if !candidate.exists() {
                continue;
            }

            if let Err(err) = backfill_seed_audio(&candidate, &audio_root) {
                eprintln!("audio seed backfill skipped for {}: {err}", candidate.display());
            } else {
                break;
            }
        }
    }

    Ok((data_root.join("app.db"), audio_root))
}

fn backfill_seed_audio(project_audio_root: &Path, runtime_audio_root: &Path) -> Result<(), String> {
    for accent in ["uk", "us"] {
        let source_dir = project_audio_root.join(accent);
        let target_dir = runtime_audio_root.join(accent);

        if !source_dir.exists() {
            continue;
        }

        let entries = fs
            ::read_dir(&source_dir)
            .map_err(|e| format!("failed to read source audio dir {}: {e}", source_dir.display()))?;

        for entry in entries {
            let entry = entry.map_err(|e| format!("failed to read audio entry: {e}"))?;
            let source_path = entry.path();

            if !source_path.is_file() {
                continue;
            }

            let is_mp3 = source_path
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| ext.eq_ignore_ascii_case("mp3"))
                .unwrap_or(false);

            if !is_mp3 {
                continue;
            }

            let Some(file_name) = source_path.file_name() else {
                continue;
            };
            let target_path = target_dir.join(file_name);

            if target_path.exists() {
                continue;
            }

            fs
                ::copy(&source_path, &target_path)
                .map_err(|e| {
                    format!(
                        "failed to copy audio file from {} to {}: {e}",
                        source_path.display(),
                        target_path.display()
                    )
                })?;
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder
        ::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("failed to locate app data dir: {e}"))?;

            fs
                ::create_dir_all(&app_data_dir)
                .map_err(|e| format!("failed to create app data dir: {e}"))?;

            let (db_path, audio_root) = ensure_runtime_layout(&app_data_dir)?;

            initialize_database(&db_path)?;

            app.manage(AppState { db_path, audio_root });
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                init_db,
                get_curriculums,
                get_curriculum_by_id,
                add_words_to_unit,
                check_word_to_unit,
                create_lesson_with_units,
                delete_lesson,
                update_lesson_detail,
                update_lesson_progress,
                get_children_words,
                get_children_words_by_parent_id,
                get_lesson_by_id,
                get_student_book_by_id,
                update_lesson_words_bulk,
                get_words_by_units,
                get_lesson_list,
                get_note_by_id,
                upsert_unit_note,
                delete_note,
                resolve_audio,
                get_ipa,
                get_ipa_from_file,
                get_work_book_by_id
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
