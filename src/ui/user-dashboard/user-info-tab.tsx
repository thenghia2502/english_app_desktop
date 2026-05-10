import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, Award, Flame, Target } from "lucide-react"

export default function UserInfoTab() {
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    joinDate: "January 15, 2024",
    level: "Intermediate",
    totalLessons: 45,
    lessonsCompleted: 28,
    currentStreak: 12,
    longestStreak: 28,
    points: 2840,
  }

  const achievements = [
    { name: "First Steps", description: "Complete your first lesson", icon: "🎉" },
    { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥" },
    { name: "Vocabulary Master", description: "Learn 100 new words", icon: "📚" },
    { name: "Grammar Expert", description: "Complete all grammar units", icon: "🎯" },
    { name: "Speaking Pro", description: "Complete 10 speaking lessons", icon: "🗣️" },
    { name: "Consistent Learner", description: "Reach a 30-day streak", icon: "⭐" },
  ]

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
              <CardDescription>Learning English with LearnHub</CardDescription>
            </div>
            <Badge className="text-base px-3 py-1">{user.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">{user.joinDate}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-foreground mb-4">Learning Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{user.lessonsCompleted}</p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{user.totalLessons}</p>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{user.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{user.points}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{user.currentStreak} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold text-foreground">{user.longestStreak} days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>Earn badges as you progress through your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
              >
                <p className="text-4xl mb-2">{achievement.icon}</p>
                <p className="font-semibold text-sm text-foreground mb-1">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="h-12">Edit Profile</Button>
        <Button variant="outline" className="h-12 bg-transparent">
          Change Password
        </Button>
      </div>
    </div>
  )
}
