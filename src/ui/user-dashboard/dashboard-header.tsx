"use client"

import { GraduationCap } from "lucide-react"

export default function DashboardHeader() {
  const goToProfileTab = () => { }

  const handleLogout = async () => {
    return Promise.resolve()
  };

  return (
    <header className="border-b 
    border-border 
    bg-card 
    sticky 
    top-0 z-40">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">LearnHub</h1>
            <p className="text-sm text-muted-foreground">Master English at Your Pace</p>
          </div>
        </div>
        {/* <div className="relative group pb-1">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 cursor-pointer">
            <img
              alt="User avatar"
              data-alt="Close up of a professional male user profile photo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo75hzcpx_uSaiBpw5aHM9t__qaZk0YdwlhKhsCao4ApF05mjFhavNzZSUf7Siq6ViNsBUz1gbUYmFPp_HulAI0B7hN9ALcA5t2xpOauQFbQE1OdYKkT95k2sAThP2p-DhSSuhCKnD_9oVi6wXaasdwczPORlLHtvtrd3uXfqsYI6Tbke6bs7uduS1-Q37_wJ47Og79lyra1SKIG92xP0rPqJ7DZGge9pG1zVQs2L6HxbveT11MIiN2wRV8KlK4hzH1zlw02GWxQ"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute right-0 top-8 z-50 w-40 rounded-md border border-border bg-card p-2 shadow-sm opacity-0 invisible translate-y-1 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
            <button
              type="button"
              onClick={goToProfileTab}
              className="w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
            >
              Quản lý tài khoản
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div> */}
      </div>
    </header>
  )
}
