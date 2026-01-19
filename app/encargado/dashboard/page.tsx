"use client";

import { useState } from "react";
import { Car, Bell } from "lucide-react";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { VehiclesDashboardView } from "@/components/shared/vehicles-dashboard-view";
import { VehicleRegistrationForm } from "@/components/shared/vehicle-registration-form";
import { Modal } from "@/components/ui/modal";

export default function EncargadoDashboardPage() {
  const { user } = useAuth();
  const [regOpen, setRegOpen] = useState(false);

  return (
    <SidebarLayout
      navigation={
        <>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>Resumen</span>
          </div>
        </>
      }
      userInfo={{
        name: user?.nombre || "Encargado",
        role: "Encargado",
      }}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          Panel del Encargado
        </h1>

        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            <Button onClick={() => setRegOpen(true)} className="uppercase">
              Registrar vehículo
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
          title="Registrar vehículo"
          description="Completa los datos para registrar el vehículo"
          size="lg"
        >
          <VehicleRegistrationForm onSubmitted={() => setRegOpen(false)} />
        </Modal>
      </div>
    </SidebarLayout>
  );
}
