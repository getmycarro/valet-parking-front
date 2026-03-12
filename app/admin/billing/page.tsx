"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Download, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
;
import { AdminLayout } from "@/components/layouts/admin-layout";
import { CompaniesSelectorModal } from "@/components/admin/companies-selector-modal";
import { RecentTransactions } from "@/components/admin/recent-transactions";
import { useAuth } from "@/lib/auth";
import { companiesService, type Company } from "@/lib/services/companies-service";

export default function AdminBillingPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [paymentsMeta, setPaymentsMeta] = useState({
    pending: 0,
    cancelled: 0,
    completed: 0,
    all: 0,
    pendingAmountUSD: 0,
    cancelledAmountUSD: 0,
    completedAmountUSD: 0,
  });

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

  const handleMetaUpdate = useCallback((meta: typeof paymentsMeta) => {
    setPaymentsMeta(meta);
  }, []);

  return (
    <AdminLayout title="Facturación" subtitle="Gestión de ingresos y transacciones">
      {user?.role === "admin" && (
        <CompaniesSelectorModal
          companies={companies}
          loading={loadingCompanies}
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={setSelectedCompanyId}
          onShowAll={() => setSelectedCompanyId(null)}
        />
      )}

      {/* Payment Counters */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsMeta.pending}
            </div>
            <div className="text-lg font-semibold text-yellow-600 mt-2">
              ${paymentsMeta.pendingAmountUSD}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En espera de pago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsMeta.completed}
            </div>
            <div className="text-lg font-semibold text-green-600 mt-2">
              ${paymentsMeta.completedAmountUSD}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsMeta.cancelled}
            </div>
            <div className="text-lg font-semibold text-red-600 mt-2">
              ${paymentsMeta.cancelledAmountUSD}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagos cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsMeta.all}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos los pagos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Transacciones Recientes
          </h2>
          <p className="text-sm text-muted-foreground">
            Últimos pagos registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <RecentTransactions companyId={selectedCompanyId} onMetaUpdate={handleMetaUpdate} />
    </AdminLayout>
  );
}
