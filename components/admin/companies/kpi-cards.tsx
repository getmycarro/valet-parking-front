"use client";

import { Building2, DollarSign, Receipt, Car } from "lucide-react";
import { type Company } from "@/lib/services/companies-service";

interface KpiCardProps {
  companies: Company[];
}

export function CompaniesKpiCards({ companies }: KpiCardProps) {
  const activeCount = companies.filter((c) => c.isActive).length;

  const revenue = companies.reduce((sum, company) => {
    for (const plan of company.plans) {
      for (const invoice of plan.companyInvoices) {
        if (invoice.status === "RECEIVED") {
          sum += invoice.amountUSD;
        }
      }
    }
    return sum;
  }, 0);

  const formattedRevenue = `$${revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const flatRateCount = companies.filter((c) =>
    c.plans.some((p) => p.isActive && p.planType === "FLAT_RATE")
  ).length;

  const perVehicleCount = companies.filter((c) =>
    c.plans.some(
      (p) => p.isActive && (p.planType === "PER_VEHICLE" || p.planType === "MIXED")
    )
  ).length;

  const totalPlanned = flatRateCount + perVehicleCount;
  const flatPct = totalPlanned > 0 ? Math.round((flatRateCount / totalPlanned) * 100) : 0;
  const perPct = totalPlanned > 0 ? Math.round((perVehicleCount / totalPlanned) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Compañías Activas */}
      <div
        className="admin-glass rounded-2xl p-6 hover-lift"
        style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <Building2 className="text-blue-400 w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
            ↑ Activas
          </span>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">Compañías Activas</p>
        <p className="text-3xl font-bold text-white mb-2">{activeCount}</p>
        <p className="text-slate-500 text-xs">{companies.length} en total</p>
      </div>

      {/* Ingresos del Período */}
      <div
        className="admin-glass rounded-2xl p-6 hover-lift"
        style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <DollarSign className="text-amber-400 w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
            ↑ Recibido
          </span>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">Ingresos del Período</p>
        <p className="text-3xl font-bold text-white mb-2">{formattedRevenue}</p>
        <p className="text-slate-500 text-xs">Facturación total</p>
      </div>

      {/* Plan Flat Rate */}
      <div
        className="admin-glass rounded-2xl p-6 hover-lift"
        style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-indigo-500/10">
            <Receipt className="text-indigo-400 w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
            {flatPct}%
          </span>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">Plan Flat Rate</p>
        <p className="text-3xl font-bold text-white mb-2">{flatRateCount}</p>
        <p className="text-slate-500 text-xs">compañías en este plan</p>
      </div>

      {/* Plan Per Vehicle */}
      <div
        className="admin-glass rounded-2xl p-6 hover-lift"
        style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/10">
            <Car className="text-cyan-400 w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
            {perPct}%
          </span>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">Plan Per Vehicle</p>
        <p className="text-3xl font-bold text-white mb-2">{perVehicleCount}</p>
        <p className="text-slate-500 text-xs">compañías en este plan</p>
      </div>
    </div>
  );
}
