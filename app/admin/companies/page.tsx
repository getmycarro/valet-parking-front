"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { companiesService, type Company } from "@/lib/services/companies-service";
import { CompaniesKpiCards } from "@/components/admin/companies/kpi-cards";
import { CompaniesTableSection } from "@/components/admin/companies/companies-table-section";
import { CompaniesCharts } from "@/components/admin/companies/companies-charts";
import { NewCompanyModal } from "@/components/admin/companies/new-company-modal";
import { toast } from "sonner";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companiesService.getAll({ limit: 1000 });
      setCompanies(res.data);
    } catch {
      // interceptor handles 401
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  async function handleToggleStatus(id: string, currentIsActive: boolean) {
    try {
      await companiesService.update(id, { isActive: !currentIsActive });
      toast.success(currentIsActive ? "Compañía suspendida" : "Compañía activada");
      fetchCompanies();
    } catch {
      toast.error("No se pudo actualizar el estado");
    }
  }

  return (
    <AdminLayout title="Compañías">
      <div className="space-y-8">
        {/* Header */}
        <div
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Gestión de Compañías
            </p>
            <p className="text-slate-400">
              Administra empresas de estacionamiento y planes de facturación
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">EN VIVO</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="admin-glass rounded-2xl p-6 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <CompaniesKpiCards companies={companies} />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <CompaniesTableSection
              companies={companies}
              onView={(id) => router.push(`/admin/companies/${id}`)}
              onToggleStatus={handleToggleStatus}
              onNew={() => setModalOpen(true)}
            />
          </div>
          <div>
            <CompaniesCharts companies={companies} />
          </div>
        </div>
      </div>

      <NewCompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          fetchCompanies();
        }}
      />
    </AdminLayout>
  );
}
