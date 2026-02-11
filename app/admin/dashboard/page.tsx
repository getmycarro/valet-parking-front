"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { VehiclesDashboardView } from "@/components/shared/vehicles-dashboard-view";
import { VehicleRegistrationForm } from "@/components/shared/vehicle-registration-form";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { useStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [regOpen, setRegOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
          title="Dashboard"
          subtitle={`Bienvenido, ${user?.name || "Administrador"}`}
          userName={user?.name || "Admin"}
          notificationCount={activeCarsCount}
          onLogout={() => {
            logout();
            router.push("/");
          }}
        />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button onClick={() => setRegOpen(true)} className="uppercase">
              Register Vehicle
            </Button>
          </div>
          <VehiclesDashboardView showSearch={false} refreshKey={refreshKey} />
        </div>
        <Modal
          isOpen={regOpen}
          onClose={() => setRegOpen(false)}
          title="Register Vehicle"
          description="Complete the details to register the vehicle"
          size="lg"
        >
          <VehicleRegistrationForm onSubmitted={() => {
            setRegOpen(false);
            setRefreshKey((k) => k + 1);
          }} />
        </Modal>
      </main>
    </div>
  );
}
