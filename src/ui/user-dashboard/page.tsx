"use client"

import { useState } from "react"
import LessonsTab from "./lessons-tab"
import CurriculumTab from "./curriculum-tab"
import UserInfoTab from "./user-info-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ClipboardList, User } from "lucide-react"
import DashboardHeader from "./dashboard-header"

const DASHBOARD_TABS = ["lessons", "curriculum", "profile"] as const
type DashboardTab = (typeof DASHBOARD_TABS)[number]

export default function Dashboard({
  onCreateLesson,
}: {
  onCreateLesson?: (curriculumId: string) => void
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("lessons")

  const handleTabChange = (nextTab: string) => {
    if (nextTab === 'profile') {
      alert(`Chức năng đang phát triển!`)
      return
    }
    if (DASHBOARD_TABS.includes(nextTab as DashboardTab)) {
      setActiveTab(nextTab as DashboardTab)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-card border border-border rounded-lg p-1">
            <TabsTrigger value="lessons" className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="flex items-center gap-2 text-base">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Curriculum</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-6">
            <LessonsTab />
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <CurriculumTab onCreateLesson={onCreateLesson} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <UserInfoTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
