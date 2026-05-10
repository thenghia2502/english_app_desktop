import LessonBuilderDesktop from "../LessonBuilderDesktop"
import LessonBuilder from "@/components/lesson-builder/LessonBuilder"
export default function CreateLessonPage({ onBack }: { onBack: () => void }) {
  return <LessonBuilder mode="create" onSave={() => onBack()} onCancel={onBack} />
}
