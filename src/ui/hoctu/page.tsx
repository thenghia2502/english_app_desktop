import { Suspense } from "react"
import { VocabTrainer } from "@/components/vocab-trainer/index"

export default function HocTu() {
  return (
    <div>
      <Suspense fallback={null}>
        <VocabTrainer />
      </Suspense>
    </div>
  )
}