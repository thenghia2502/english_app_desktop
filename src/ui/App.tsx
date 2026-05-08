import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { appService } from "../services/AppService";
import { audioService } from "../services/AudioService";
import { Lesson, Unit, Word } from "../types/models";
import DashboardPage from "./user-dashboard/page";
import BooksPage from "./book/page";
import BookReaderPage from "./book/[id]/page";
import WorkbookPage from "./book/wb/[id]/page";
import HocTuPage from "./hoctu/page";
import CreateLessonPage from "./lesson/create/page";
import UpdateLessonPage from "./lesson/update/[id]/page";
import { app } from "@tauri-apps/api";

const DEFAULT_BOOK_ID = "book-basic";

export default function App() {
  const navigate = useNavigate();

  // useEffect(() => {
  //   appService.init().then(() => console.log("DB initialized")).catch((error) => {
  //     console.error("Failed to initialize app:", error);
  //   });
  // }, []);
  // const [units, setUnits] = useState<Unit[]>([]);
  // const [lessons, setLessons] = useState<Lesson[]>([]);
  // const [words, setWords] = useState<Word[]>([]);
  // const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  // const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  // const [selectedWordId, setSelectedWordId] = useState<string>("");
  // const [status, setStatus] = useState<string>("Initializing local DB...");

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       await appService.init();
  //       // const nextUnits = await appService.getUnitsByBook(DEFAULT_BOOK_ID);
  //       // setUnits(nextUnits);
  //       // if (nextUnits.length > 0) {
  //       //   setSelectedUnitId(nextUnits[0].id);
  //       // }
  //       // setStatus("Ready (offline-first mode)");
  //     } catch (error) {
  //       // setStatus(`Failed to init app: ${String(error)}`);
  //     }
  //   };

  //   void init();
  // }, []);

  // useEffect(() => {
  //   const loadUnitData = async () => {
  //     if (!selectedUnitId) {
  //       setLessons([]);
  //       setWords([]);
  //       return;
  //     }

  //     const [nextLessons, nextWords] = await Promise.all([
  //       appService.getLessonsByUnit(selectedUnitId),
  //       appService.getWordsByUnit(selectedUnitId)
  //     ]);

  //     setLessons(nextLessons);
  //     setWords(nextWords);

  //     if (nextLessons.length > 0) {
  //       setSelectedLessonId(nextLessons[0].id);
  //     }
  //     if (nextWords.length > 0) {
  //       setSelectedWordId(nextWords[0].id);
  //     }
  //   };

  //   void loadUnitData();
  // }, [selectedUnitId]);

  // useEffect(() => {
  //   const loadLessonWords = async () => {
  //     if (!selectedLessonId) {
  //       return;
  //     }

  //     const lessonWords = await appService.getWordsByLesson(selectedLessonId);
  //     setWords(lessonWords);
  //     if (lessonWords.length > 0) {
  //       setSelectedWordId(lessonWords[0].id);
  //     }
  //   };

  //   void loadLessonWords();
  // }, [selectedLessonId]);

  // const selectedWord = useMemo(() => words.find((w) => w.id === selectedWordId) ?? null, [words, selectedWordId]);

  // const onPlay = async (accent: "uk" | "us") => {
  //   if (!selectedWord) {
  //     return;
  //   }
  //   await audioService.playWord(selectedWord.word, accent);
  // };

  // const onMarkProgress = async () => {
  //   if (!selectedLessonId || !selectedWord) {
  //     return;
  //   }

  //   await appService.updateProgress({
  //     lessonId: selectedLessonId,
  //     wordId: selectedWord.id,
  //     progress: 100
  //   });

  //   setStatus(`Progress updated for ${selectedWord.word}`);
  // };

  // const renderStudyView = () => (
  //   <>
  //     <section className="grid">
  //       <aside className="panel">
  //         <h2>Units</h2>
  //         {units.map((unit) => (
  //           <button
  //             key={unit.id}
  //             className={selectedUnitId === unit.id ? "item active" : "item"}
  //             onClick={() => setSelectedUnitId(unit.id)}
  //           >
  //             {unit.name}
  //           </button>
  //         ))}
  //       </aside>

  //       <aside className="panel">
  //         <h2>Lessons</h2>
  //         {lessons.map((lesson) => (
  //           <button
  //             key={lesson.id}
  //             className={selectedLessonId === lesson.id ? "item active" : "item"}
  //             onClick={() => setSelectedLessonId(lesson.id)}
  //           >
  //             {lesson.name} ({lesson.progress}%)
  //           </button>
  //         ))}
  //       </aside>

  //       <section className="panel wide">
  //         <h2>Words</h2>
  //         <div className="word-list">
  //           {words.map((word) => (
  //             <button
  //               key={word.id}
  //               className={selectedWordId === word.id ? "item active" : "item"}
  //               onClick={() => setSelectedWordId(word.id)}
  //             >
  //               <strong>{word.word}</strong>
  //               <span>{word.meaning}</span>
  //             </button>
  //           ))}
  //         </div>
  //       </section>
  //     </section>

  //     <section className="panel detail">
  //       <h2>Word Detail</h2>
  //       {selectedWord ? (
  //         <>
  //           <p>
  //             <strong>Word:</strong> {selectedWord.word}
  //           </p>
  //           <p>
  //             <strong>Meaning:</strong> {selectedWord.meaning}
  //           </p>
  //           <p>
  //             <strong>IPA UK:</strong> {selectedWord.ipa_uk}
  //           </p>
  //           <p>
  //             <strong>IPA US:</strong> {selectedWord.ipa_us}
  //           </p>
  //           <div className="actions">
  //             <button onClick={() => void onPlay("uk")}>Play UK</button>
  //             <button onClick={() => void onPlay("us")}>Play US</button>
  //             <button onClick={() => void onMarkProgress()}>Mark Progress 100%</button>
  //           </div>
  //         </>
  //       ) : (
  //         <p>Select a word to see details.</p>
  //       )}
  //     </section>
  //   </>
  // );

  return (
    <main className="layout">
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <DashboardPage
              onCreateLesson={(curriculumId) => {
                navigate(`/lesson/create/${curriculumId}`);
              }}
            />
          }
        />

        {/* Create lesson (KHÔNG cần param) */}
        <Route
          path="/lesson/create"
          element={<CreateLessonPage onBack={() => navigate("/")} />}
        />

        {/* Nếu bạn vẫn muốn version có curriculumId */}
        <Route
          path="/lesson/create/:curriculumId"
          element={<CreateLessonPage onBack={() => navigate("/")} />}
        />

        {/* Learn vocabulary */}
        <Route
          path="/learn-vocabulary"
          element={<HocTuPage />}
        />

        {/* Các route khác giữ nguyên */}
        <Route
          path="/books"
          element={<BooksPage onOpenBook={(bookId) => navigate(`/book/${bookId}`)} />}
        />

        <Route
          path="/book/:bookId"
          element={
            <BookReaderRoute
              onBack={() => navigate("/books")}
              onOpenWorkbook={(workbookId) => navigate(`/workbook/${workbookId}`)}
            />
          }
        />

        <Route
          path="/workbook/:workbookId"
          element={
            <WorkbookRoute
              onBack={() => navigate(-1)}
              onOpenStudentBook={(bookId) => navigate(`/book/${bookId}`)}
            />
          }
        />

        <Route
          path="/lesson/update/:lessonId"
          element={<UpdateLessonRoute onBack={() => navigate("/")} />}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

function BookReaderRoute({
  onBack,
  onOpenWorkbook,
}: {
  onBack: () => void;
  onOpenWorkbook: (workbookId: string) => void;
}) {
  const { bookId = "" } = useParams();
  if (!bookId) {
    return <Navigate to="/books" replace />;
  }
  return <BookReaderPage bookId={bookId} onBack={onBack} onOpenWorkbook={onOpenWorkbook} />;
}

function WorkbookRoute({
  onBack,
  onOpenStudentBook,
}: {
  onBack: () => void;
  onOpenStudentBook: (bookId: string) => void;
}) {
  const { workbookId = "" } = useParams();
  if (!workbookId) {
    return <Navigate to="/books" replace />;
  }
  return <WorkbookPage workbookId={workbookId} onBack={onBack} onOpenStudentBook={onOpenStudentBook} />;
}

function UpdateLessonRoute({ onBack }: { onBack: () => void }) {
  const { lessonId = "" } = useParams();
  return <UpdateLessonPage lessonId={lessonId} onBack={onBack} />;
}
