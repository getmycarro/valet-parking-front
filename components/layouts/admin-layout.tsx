"use client"
import { useState, type ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

export function AdminLayout({ children, title, actions }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {title && <h1 className="text-xl font-semibold">{title}</h1>}
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
