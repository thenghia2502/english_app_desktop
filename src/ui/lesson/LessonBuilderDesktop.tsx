import { useState } from "react";

export interface LessonWord {
    id: string;
    word: string;
    word_meaning: string;
    word_pause_time: string;
    word_max_read: string;
    word_show_ipa: string;
    word_show_word: string;
    word_show_ipa_and_word: string;
    word_reads_per_round: string;
    word_progress: string;
    word_parent_id?: string;
    word_popularity?: number;
    uk_ipa?: string;
    us_ipa?: string;
}

interface LessonBuilderDesktopProps {
    mode: "create" | "update";
    lessonId?: string;
    initialLessonName?: string;
    initialDescription?: string;
    initialWords?: LessonWord[];
    onSave: (data: {
        name: string;
        description: string;
        words: LessonWord[];
    }) => void;
    onCancel: () => void;
}

const MOCK_WORDS: LessonWord[] = [
    {
        id: "word-1",
        word: "confidence",
        word_meaning: "The feeling of being sure about something",
        word_pause_time: "2",
        word_max_read: "6",
        word_show_ipa: "3",
        word_show_word: "1",
        word_show_ipa_and_word: "2",
        word_reads_per_round: "6",
        word_progress: "0",
        uk_ipa: "/ˈkɒnfɪdəns/",
        us_ipa: "/ˈkɑːnfɪdəns/",
    },
    {
        id: "word-2",
        word: "practice",
        word_meaning: "Repeated performance of an activity to improve skill",
        word_pause_time: "2",
        word_max_read: "6",
        word_show_ipa: "3",
        word_show_word: "1",
        word_show_ipa_and_word: "2",
        word_reads_per_round: "6",
        word_progress: "0",
        uk_ipa: "/ˈpræktɪs/",
        us_ipa: "/ˈpræktɪs/",
    },
    {
        id: "word-3",
        word: "essential",
        word_meaning: "Absolutely necessary or extremely important",
        word_pause_time: "2",
        word_max_read: "6",
        word_show_ipa: "3",
        word_show_word: "1",
        word_show_ipa_and_word: "2",
        word_reads_per_round: "6",
        word_progress: "0",
        uk_ipa: "/ɪˈsenʃl/",
        us_ipa: "/ɪˈsenʃl/",
    },
];

export default function LessonBuilderDesktop({
    mode,
    lessonId = "lesson-1",
    initialLessonName = "",
    initialDescription = "",
    initialWords = [],
    onSave,
    onCancel,
}: LessonBuilderDesktopProps) {
    const [lessonName, setLessonName] = useState(initialLessonName);
    const [description, setDescription] = useState(initialDescription);
    const [lessonWords, setLessonWords] = useState<LessonWord[]>(initialWords.length > 0 ? initialWords : []);
    const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
    const [isSelectWordsModalOpen, setIsSelectWordsModalOpen] = useState(mode === "create");

    const toggleWord = (wordId: string) => {
        setSelectedWordIds((previous) => {
            const next = new Set(previous);
            if (next.has(wordId)) {
                next.delete(wordId);
            } else {
                next.add(wordId);
            }
            return next;
        });
    };

    const addWords = () => {
        const existingIds = new Set(lessonWords.map((word) => word.id));
        const additions = MOCK_WORDS.filter((word) => selectedWordIds.has(word.id) && !existingIds.has(word.id));
        setLessonWords((previous) => [...previous, ...additions]);
        setSelectedWordIds(new Set());
    };

    const confirmModalSelection = () => {
        addWords();
        setIsSelectWordsModalOpen(false);
    };

    const removeWord = (wordId: string) => {
        setLessonWords((previous) => previous.filter((word) => word.id !== wordId));
    };

    return (
        <div className="panel" style={{ display: "grid", gap: 16 }}>
            {isSelectWordsModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "100%",
                            maxWidth: 640,
                            padding: 20,
                            display: "grid",
                            gap: 14,
                            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.25)",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>Chon tu vung de tao bai hoc</h3>
                        <p style={{ margin: 0, color: "#475569" }}>Chon cac tu ban muon dua vao bai hoc moi.</p>

                        <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                            {MOCK_WORDS.map((word) => (
                                <label key={word.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedWordIds.has(word.id)}
                                        onChange={() => toggleWord(word.id)}
                                    />
                                    <span>
                                        <strong>{word.word}</strong> - {word.word_meaning}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button type="button" onClick={() => setIsSelectWordsModalOpen(false)}>
                                Dong
                            </button>
                            <button type="button" onClick={confirmModalSelection}>
                                Xac nhan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2>{mode === "create" ? "Create Lesson" : `Update Lesson ${lessonId}`}</h2>

            <label style={{ display: "grid", gap: 6 }}>
                <span>Lesson name</span>
                <input value={lessonName} onChange={(event) => setLessonName(event.target.value)} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
                <span>Description</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
            </label>

            <div className="panel" style={{ minHeight: "auto" }}>
                <h3>Word Pool</h3>
                <div style={{ display: "grid", gap: 8 }}>
                    {MOCK_WORDS.map((word) => (
                        <label key={word.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="checkbox" checked={selectedWordIds.has(word.id)} onChange={() => toggleWord(word.id)} />
                            <span>
                                <strong>{word.word}</strong> - {word.word_meaning}
                            </span>
                        </label>
                    ))}
                </div>
                <div className="actions" style={{ marginTop: 12 }}>
                    <button type="button" onClick={addWords} disabled={selectedWordIds.size === 0}>
                        Add selected words
                    </button>
                    {mode === "create" && (
                        <button type="button" onClick={() => setIsSelectWordsModalOpen(true)}>
                            Open selection modal
                        </button>
                    )}
                </div>
            </div>

            <div className="panel" style={{ minHeight: "auto" }}>
                <h3>Lesson Words ({lessonWords.length})</h3>
                {lessonWords.length === 0 ? (
                    <p>No words selected.</p>
                ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                        {lessonWords.map((word) => (
                            <div key={word.id} className="item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>
                                    <strong>{word.word}</strong> - {word.word_meaning}
                                </span>
                                <button type="button" onClick={() => removeWord(word.id)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="actions">
                <button
                    type="button"
                    onClick={() => {
                        if (!lessonName.trim()) {
                            return;
                        }
                        onSave({ name: lessonName, description, words: lessonWords });
                    }}
                >
                    Save lesson
                </button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
