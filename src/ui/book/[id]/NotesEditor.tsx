"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface NotesEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

export function NotesEditor({ 
  value, 
  onChange, 
  placeholder = "Write your notes here...",
  className,
  style 
}: NotesEditorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-32 border rounded-md p-3 text-gray-400">
        Loading editor...
      </div>
    )
  }

  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} h-full resize-none`}
      style={style}
    />
  )
}
