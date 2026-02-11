"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { VehiclesHistoryView } from "@/components/shared/vehicles-history-view";
import { useAuth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { useStore } from "@/lib/store";

export default function AdminHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { state } = useStore();

  const activeCarsCount = state.cars.filter((c) => !c.checkOutAt).length;

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
          title="History"
          subtitle="Delivered vehicles and recorded payments"
          userName={user?.name || "Admin"}
          notificationCount={activeCarsCount}
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
