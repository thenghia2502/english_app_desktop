"use client";
import { useState, useEffect, useRef, useCallback } from "react";
// import RichTextEditor from "@/components/RichTextEditor";
import { Mic, MicOff, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNote, useUpsertNote } from "@/hooks/use-notes";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface SpeechToTextProps {
  onTextChange?: (text: string) => void; // Callback để truyền text ra ngoài
  bookId?: string; // ID của sách để lưu notes
  unitId?: string; // ID của unit để lưu notes
  saveNotesRef?: React.MutableRefObject<(() => Promise<boolean>) | null>; // Ref để component cha có thể gọi save
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

export default function SpeechToText({ onTextChange, bookId, unitId, saveNotesRef, title, setTitle }: SpeechToTextProps) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [accumulatedText, setAccumulatedText] = useState(""); // Lưu text đã final
  const [isSaving, setIsSaving] = useState(false);
  const [enabledSave, setEnabledSave] = useState(false);
  // const [title, setTitle] = useState(`${bookId}-${unitId}`); // Tên người dùng mặc định
  // const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const noteQuery = useNote(unitId);
  const upsertNoteMutation = useUpsertNote();

  const internalSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const originalTextRef = useRef<string>(""); // Lưu text gốc khi load

  // Fetch notes from hook when unitId changes
  useEffect(() => {
    if (!bookId || !unitId) return;
    if (noteQuery.isLoading) return;

    setError("");

    if (noteQuery.isError) {
      console.error("❌ Error loading notes:", noteQuery.error);
      setText("");
      setAccumulatedText("");
      originalTextRef.current = "";
      setEnabledSave(false);
      if (onTextChange) {
        onTextChange("");
      }
      return;
    }

    const result = noteQuery.data as
      | {
        data?: { title?: string; content?: string };
        title?: string;
        content?: string;
      }
      | null
      | undefined;

    const noteData = result?.data ?? result;

    if (noteData?.content !== undefined || noteData?.title !== undefined) {
      const loadedText = noteData?.content || "";
      setText(loadedText);
      setAccumulatedText(loadedText);
      originalTextRef.current = loadedText;
      setEnabledSave(false);

      if (onTextChange) {
        onTextChange(loadedText);
      }

      console.log("📖 Loaded notes:", loadedText);
    } else {
      setText("");
      setAccumulatedText("");
      originalTextRef.current = "";
      setEnabledSave(false);
      if (onTextChange) {
        onTextChange("");
      }
      console.log("ℹ️ No notes found for this unit");
    }
  }, [bookId, unitId, noteQuery.data, noteQuery.error, noteQuery.isError, noteQuery.isLoading, onTextChange]);

  // Theo dõi thay đổi của text để enable/disable nút Save
  useEffect(() => {
    const hasChanged = text !== originalTextRef.current;
    setEnabledSave(hasChanged);
  }, [text]);

  useEffect(() => {
    // Kiểm tra trình duyệt có hỗ trợ không
    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "en-US"; // English language
      recog.continuous = true; // Nghe liên tục
      recog.interimResults = true; // Hiển thị kết quả khi đang nói

      recog.onresult = (event: SpeechRecognitionEvent) => {
        console.log("🎤 Speech result:", event);
        console.log("Result length:", event.results.length);
        console.log("Result index:", event.resultIndex);

        // Lấy TẤT CẢ kết quả từ đầu
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          console.log(`Result [${i}]:`, {
            transcript,
            isFinal: result.isFinal,
            confidence: result[0].confidence
          });

          if (result.isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Ghép với text đã tích lũy trước đó
        const fullText = finalTranscript + interimTranscript;
        console.log("📝 Full transcript:", fullText);
        console.log("📝 Final part:", finalTranscript);
        console.log("📝 Interim part:", interimTranscript);
        console.log("📝 Previous accumulated:", accumulatedText);

        // Nếu có final result mới, cập nhật accumulated
        if (finalTranscript.trim()) {
          setAccumulatedText(prev => {
            const newAccumulated = prev + finalTranscript;
            console.log("💾 New accumulated:", newAccumulated);
            return newAccumulated;
          });
        }

        // Text hiển thị = accumulated + current
        const displayText = accumulatedText + fullText;
        console.log("📺 Display text:", displayText);

        setText(displayText);

        // Gọi callback với text đầy đủ
        if (onTextChange) {
          onTextChange(displayText);
        }
      };

      recog.onerror = (event: Event) => {
        const errorEvent = event as SpeechRecognitionErrorEvent;
        console.error("❌ Speech error:", {
          error: errorEvent.error,
          message: errorEvent.message,
          type: event.type
        });

        let errorMessage = "";
        switch (errorEvent.error) {
          case "not-allowed":
            errorMessage = "Microphone bị từ chối. Vui lòng cho phép truy cập microphone.";
            setListening(false);
            break;
          case "no-speech":
            // Không hiển thị lỗi cho no-speech, chỉ log
            console.log("⚠️ No speech detected, still listening...");
            errorMessage = ""; // Clear error
            // Không set listening = false, để tiếp tục nghe
            return; // Không set error state
          case "network":
            errorMessage = "Lỗi mạng. Kiểm tra kết nối internet.";
            setListening(false);
            break;
          case "aborted":
            errorMessage = "Đã dừng nhận diện giọng nói.";
            setListening(false);
            break;
          default:
            errorMessage = `Lỗi: ${errorEvent.error || 'Unknown error'}`;
            setListening(false);
        }

        if (errorMessage) {
          setError(errorMessage);
        }
      };

      recog.onstart = () => {
        console.log("🎬 Speech recognition started");
        setListening(true);
      };

      recog.onend = () => {
        console.log("🛑 Speech ended");
        setListening(false);
      };

      setRecognition(recog);
      console.log("✅ Speech Recognition initialized");
    } else {
      const errorMsg = "Trình duyệt của bạn không hỗ trợ Speech Recognition!";
      alert(errorMsg);
      setError(errorMsg);
    }
  }, [onTextChange, accumulatedText]);

  const startListening = async () => {
    if (recognition) {
      try {
        // Kiểm tra quyền microphone trước
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("✅ Microphone permission granted");
          } catch (permErr) {
            console.error("❌ Microphone permission denied:", permErr);
            setError("Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt.");
            return;
          }
        }

        setError(""); // Clear previous errors
        setAccumulatedText((prev) => (prev ? prev + " " : text));
        recognition.start();
        setListening(true);
        console.log("▶️ Started listening");
      } catch (err) {
        console.error("❌ Error starting:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Không thể bắt đầu: ${errorMsg}`);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
      console.log("⏹️ Stopped listening");
    }
  };

  const resetNotes = () => {
    setText("");
    setAccumulatedText("");
    // Không reset originalTextRef để nút Lưu vẫn được kích hoạt
    // originalTextRef.current vẫn giữ giá trị cũ
    if (onTextChange) {
      onTextChange("");
    }
    // setEnabledSave(true); // Enable save vì đã có thay đổi
    console.log("🔄 Reset notes");
  };

  const handleSaveClick = async () => {

    await saveNotes();

  };

  const saveNotes = useCallback(async (): Promise<boolean> => {
    if (!text.trim()) {
      // setSaveMessage({ type: 'error', text: 'Không có nội dung để lưu!' });
      return false;
    }

    if (!bookId || !unitId) {
      // setSaveMessage({ type: 'error', text: 'Thiếu thông tin bookId hoặc unitId!' });
      return false;
    }

    setIsSaving(true);
    // setSaveMessage(null);

    try {
      const result = await upsertNoteMutation.mutateAsync({
        unitId,
        content: text,
      });

      if ((result as { success?: boolean } | null)?.success !== false) {
        // setSaveMessage({ type: 'success', text: 'Đã lưu ghi chú thành công!' });
        console.log('💾 Notes saved successfully');

        // Cập nhật text gốc sau khi lưu thành công
        originalTextRef.current = text;
        setEnabledSave(false); // Disable save vì đã lưu

        // Clear success message after 3 seconds
        setTimeout(() => {
          // setSaveMessage(null);
        }, 3000);

        return true;
      } else {
        // setSaveMessage({ type: 'error', text: result.message || 'Lỗi khi lưu ghi chú!' });
        return false;
      }
    } catch (err) {
      console.error('❌ Error saving notes:', err);
      // setSaveMessage({ type: 'error', text: 'Không thể kết nối đến server!' });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [text, bookId, unitId]);

  // Expose saveNotes function to parent via ref
  useEffect(() => {
    internalSaveRef.current = saveNotes;
    if (saveNotesRef) {
      saveNotesRef.current = saveNotes;
    }
  }, [saveNotes, saveNotesRef]);

  return (
    <div className="flex flex-col gap-4 p-6 text-black bg-white h-full">
      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* {saveMessage && (
        <div className={`w-full border px-4 py-3 rounded ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          {saveMessage.text}
        </div>
      )} */}

      {/* Text Input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          const newText = e.target.value;
          setText(newText);
          if (onTextChange) {
            onTextChange(newText);
          }
        }}
        // onBlur={(e) => {
        //   e.preventDefault();
        //   setTimeout(() => {
        //     textareaRef.current?.focus();
        //   }, 0);
        // }}
        placeholder={"Nhấn 'Bắt đầu' và cho phép mic"}
        className="flex-1 w-full border rounded-lg p-4 bg-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {listening && (
        <div className="text-green-600 font-semibold animate-pulse">
          🔴 Đang ghi âm...
        </div>
      )}

      <div className="h-fit flex gap-2">
        <button
          onClick={listening ? stopListening : startListening}
          className={`flex items-center px-4 py-2 text-white rounded-lg ${listening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
            }`}
        >
          {listening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span className="ml-1">Tắt mic</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span className="ml-1">Bật mic</span>
            </>
          )}
        </button>
        <button
          onClick={handleSaveClick}
          disabled={isSaving || !enabledSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 inline-block mr-1" />
          Lưu
        </button>
        <Button onClick={resetNotes} disabled={isSaving} variant="outline">
          <RefreshCcw className="h-4 w-4 inline-block mr-1" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
