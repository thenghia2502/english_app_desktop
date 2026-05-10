import LessonBuilderDesktop from "../../LessonBuilderDesktop"

export default function UpdateLessonPage({ onBack }: { lessonId?: string; onBack: () => void }) {
  return <LessonBuilderDesktop mode="update" onSave={() => onBack()} onCancel={onBack} />
}
