"use client"
import { useState, type ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminPageHeader } from "@/components/shared/admin-page-header"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        userRole={user?.role || "admin"}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <AdminPageHeader
          title={title}
          subtitle={subtitle}
          userName={user?.name || "Admin"}
          onLogout={handleLogout}
        />

        <div className="p-6 space-y-6">
          {actions && (
            <div className="flex items-center justify-between">
              <div />
              {actions}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
