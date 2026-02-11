"use client";

import { useState } from "react";
import { Car, Bell } from "lucide-react";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { VehiclesDashboardView } from "@/components/shared/vehicles-dashboard-view";
import { VehicleRegistrationForm } from "@/components/shared/vehicle-registration-form";
import { Modal } from "@/components/ui/modal";

export default function AttendantDashboardPage() {
  const { user } = useAuth();
  const [regOpen, setRegOpen] = useState(false);

  return (
    <SidebarLayout
      navigation={
        <>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>Overview</span>
          </div>
        </>
      }
      userInfo={{
        name: user?.name || "Attendant",
        role: "Attendant",
      }}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          Attendant Dashboard
        </h1>

        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            <Button onClick={() => setRegOpen(true)} className="uppercase">
              Register Vehicle
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="relative bg-transparent"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
        <VehiclesDashboardView showSearch={false} />
        <Modal
          isOpen={regOpen}
          onClose={() => setRegOpen(false)}
          title="Register Vehicle"
          description="Complete vehicle details"
          size="lg"
        >
          <VehicleRegistrationForm onSubmitted={() => setRegOpen(false)} />
        </Modal>
      </div>
    </SidebarLayout>
  );
}
