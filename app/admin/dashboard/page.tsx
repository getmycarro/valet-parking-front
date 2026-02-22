"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { VehiclesDashboardView } from "@/components/shared/vehicles-dashboard-view";
import { VehicleRegistrationForm } from "@/components/shared/vehicle-registration-form";
import { Modal } from "@/components/ui/modal";
import { CompaniesSelectorModal } from "@/components/admin/companies-selector-modal";
import { useAuth } from "@/lib/auth";
import { companiesService, type Company } from "@/lib/services/companies-service";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [regOpen, setRegOpen] = useState(false);
  // Contador utilizado como "key" para forzar el re-render del componente VehiclesDashboardView
  // Cuando cambia, React re-monta el componente y recarga los datos de vehículos
  // Se incrementa cada vez que se registra un nuevo vehículo correctamente
  const [refreshKey, setRefreshKey] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCompanies();
    }
  }, [user?.role]);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await companiesService.getAll();
      const companiesList = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? (response as unknown as Company[]) : [];
      setCompanies(companiesList);
      // Auto-select first company if only one exists
      if (companiesList.length === 1) {
        setSelectedCompanyId(companiesList[0].id);
      }
    } catch {
      // API error handling via interceptor
    } finally {
      setLoadingCompanies(false);
    }
  };

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={`Bienvenido, ${user?.name || "Administrador"}`}
      actions={
        <Button onClick={() => setRegOpen(true)} className="uppercase">
          Register Vehicle
        </Button>
      }
    >
      {user?.role === "admin" && (
        <CompaniesSelectorModal
          companies={companies}
          loading={loadingCompanies}
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={setSelectedCompanyId}
          onShowAll={() => setSelectedCompanyId(null)}
        />
      )}

      {/* Pasa refreshKey como prop para que el componente sepa cuándo debe recargarse
          Cuando refreshKey cambia, se re-monta el componente y se cargan los vehículos actuales */}
      <VehiclesDashboardView showSearch={false} refreshKey={refreshKey} companyId={selectedCompanyId} hideResultsCard />
      <Modal
        isOpen={regOpen}
        onClose={() => setRegOpen(false)}
        title="Register Vehicle"
        description="Complete the details to register the vehicle"
        size="lg"
      >
        <VehicleRegistrationForm
          onSubmitted={() => {
            setRegOpen(false);
            // Incrementa el contador refreshKey para forzar que VehiclesDashboardView
            // se re-monte y recargue la lista de vehículos con el nuevo vehículo registrado
            setRefreshKey((k) => k + 1);
          }}
        />
      </Modal>
    </AdminLayout>
  );
}
