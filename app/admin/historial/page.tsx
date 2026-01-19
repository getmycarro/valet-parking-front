"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { VehiclesHistoryView } from "@/components/shared/vehicles-history-view";
import { useAuth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export default function AdminHistorialPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <AdminPageHeader
          title="Historial"
          subtitle="Vehículos entregados y pagos registrados"
          userName={user?.nombre || "Admin"}
          onLogout={() => {
            logout();
            router.push("/");
          }}
        />

        <div className="p-6 space-y-6">
          <VehiclesHistoryView
            query={search}
            onQueryChange={(q) => setSearch(q)}
            showSearch={false}
          />
        </div>
      </main>
    </div>
  );
}
