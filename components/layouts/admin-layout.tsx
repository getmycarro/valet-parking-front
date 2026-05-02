"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { NotificationsProvider } from "@/lib/context/notifications-context";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminLayout({ children, title, className }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  return (
    <NotificationsProvider>
      <div className={cn("admin-area min-h-screen bg-slate-950 text-slate-50 flex", className)}>
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          userRole={user?.role ?? "admin"}
          onLogout={handleLogout}
        />

        {/* Offset wrapper — accounts for fixed sidebar on lg+ */}
        <div className="flex-1 lg:ml-64 flex flex-col">
          <AdminTopbar
            title={title}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={handleSidebarToggle}
          />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto scrollbar-hide"
            tabIndex={-1}
          >
            <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}
