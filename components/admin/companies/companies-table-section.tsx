"use client";

import { useState } from "react";
import { Eye, Pencil, Ban, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { type Company, type CompanyPlan, type CompanyInvoice } from "@/lib/services/companies-service";

const ITEMS_PER_PAGE = 8;

function getActivePlan(company: Company): CompanyPlan | undefined {
  return company.plans.find((p) => p.isActive);
}

function getLatestInvoice(plan: CompanyPlan): CompanyInvoice | undefined {
  return plan.companyInvoices
    .filter((i) => i.periodEnd)
    .sort(
      (a, b) =>
        new Date(b.periodEnd!).getTime() - new Date(a.periodEnd!).getTime()
    )[0];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatPeriod(invoice: CompanyInvoice | undefined): string {
  if (!invoice || !invoice.periodStart || !invoice.periodEnd) return "—";
  const start = new Date(invoice.periodStart).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const end = new Date(invoice.periodEnd).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${start} → ${end}`;
}

interface CompaniesTableSectionProps {
  companies: Company[];
  onView: (id: string) => void;
  onToggleStatus: (id: string, currentIsActive: boolean) => void;
  onNew: () => void;
}

type PlanFilter = "all" | "flat_rate" | "per_vehicle";

export function CompaniesTableSection({
  companies,
  onView,
  onToggleStatus,
  onNew,
}: CompaniesTableSectionProps) {
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter logic
  const filtered = companies.filter((c) => {
    const matchesSearch =
      !search || c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (planFilter === "flat_rate") {
      const activePlan = getActivePlan(c);
      return activePlan?.planType === "FLAT_RATE";
    }
    if (planFilter === "per_vehicle") {
      const activePlan = getActivePlan(c);
      return (
        activePlan?.planType === "PER_VEHICLE" ||
        activePlan?.planType === "MIXED"
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paged = filtered.slice(startIdx, endIdx);

  function handleFilterChange(f: PlanFilter) {
    setPlanFilter(f);
    setPage(1);
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div className="space-y-4" style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}>
      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              planFilter === "all"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleFilterChange("flat_rate")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              planFilter === "flat_rate"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            Flat Rate
          </button>
          <button
            onClick={() => handleFilterChange("per_vehicle")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              planFilter === "per_vehicle"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            Per Vehicle
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar compañía..."
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
            />
          </div>
          <button
            onClick={onNew}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Compañía
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Período de Facturación
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-500 text-sm"
                  >
                    No se encontraron compañías
                  </td>
                </tr>
              ) : (
                paged.map((company) => {
                  const activePlan = getActivePlan(company);
                  const latestInvoice = activePlan
                    ? getLatestInvoice(activePlan)
                    : undefined;

                  return (
                    <tr
                      key={company.id}
                      className="group border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Company */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {getInitials(company.name)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {company.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {company.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Inactiva
                          </span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-4">
                        {activePlan ? (
                          activePlan.planType === "FLAT_RATE" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Flat Rate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {activePlan.planType === "MIXED"
                                ? "Mixed"
                                : "Per Vehicle"}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 text-sm">—</span>
                        )}
                      </td>

                      {/* Billing period */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <span className="text-slate-400 text-sm">
                          {formatPeriod(latestInvoice)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onView(company.id)}
                            title="Ver detalle"
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Editar (próximamente)"
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              onToggleStatus(company.id, company.isActive)
                            }
                            title={
                              company.isActive
                                ? "Suspender compañía"
                                : "Activar compañía"
                            }
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <span className="text-slate-300 font-medium">
              {filtered.length === 0 ? 0 : startIdx + 1}–
              {Math.min(endIdx, filtered.length)}
            </span>{" "}
            de{" "}
            <span className="text-slate-300 font-medium">{filtered.length}</span>{" "}
            resultados
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - safePage) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      safePage === item
                        ? "bg-blue-500 text-white"
                        : "hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
