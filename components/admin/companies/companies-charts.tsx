"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { type Company, type CompanyPlan } from "@/lib/services/companies-service";

// ─── helpers ────────────────────────────────────────────────────────────────

function getActivePlan(company: Company): CompanyPlan | undefined {
  return company.plans.find((p) => p.isActive);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// ─── Bar chart card ──────────────────────────────────────────────────────────

function BarChartCard({ companies }: { companies: Company[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  const data = useMemo(() => {
    if (!now) return [];

    const months: { label: string; year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }

    return months.map(({ label, year, month }) => {
      const count = companies.filter((c) => {
        const d = new Date(c.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      return { label, count };
    });
  }, [companies, now]);

  return (
    <div className="admin-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white font-semibold">Nuevas compañías</p>
        <span className="text-xs text-slate-500">Últimos 6 meses</span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
              formatter={(value) => [value, "Nuevas"]}
            />
            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Donut chart card ────────────────────────────────────────────────────────

function DonutChartCard({ companies }: { companies: Company[] }) {
  const { flatRateCount, perVehicleCount, total } = useMemo(() => {
    let flat = 0;
    let per = 0;
    for (const c of companies) {
      const plan = getActivePlan(c);
      if (!plan) continue;
      if (plan.planType === "FLAT_RATE") flat++;
      else per++;
    }
    return { flatRateCount: flat, perVehicleCount: per, total: flat + per };
  }, [companies]);

  const circumference = 2 * Math.PI * 40; // ≈ 251.3
  const flatPct = total > 0 ? flatRateCount / total : 0;
  const perPct = total > 0 ? perVehicleCount / total : 0;

  const flatArc = flatPct * circumference;
  const perArc = perPct * circumference;

  return (
    <div className="admin-glass rounded-2xl p-6">
      <p className="text-white font-semibold mb-6">Distribución de planes</p>

      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
            />
            {/* Flat Rate segment */}
            {flatArc > 0 && (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${flatArc} ${circumference - flatArc}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            )}
            {/* Per Vehicle segment */}
            {perArc > 0 && (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#6366f1"
                strokeWidth="12"
                strokeDasharray={`${perArc} ${circumference - perArc}`}
                strokeDashoffset={`${-flatArc}`}
                strokeLinecap="round"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-300">Flat Rate</span>
          </div>
          <span className="text-sm font-semibold text-white">
            {flatRateCount}{" "}
            <span className="text-slate-500 font-normal">
              ({total > 0 ? Math.round(flatPct * 100) : 0}%)
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-slate-300">Per Vehicle</span>
          </div>
          <span className="text-sm font-semibold text-white">
            {perVehicleCount}{" "}
            <span className="text-slate-500 font-normal">
              ({total > 0 ? Math.round(perPct * 100) : 0}%)
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming renewals card ──────────────────────────────────────────────────

interface RenewalItem {
  companyId: string;
  companyName: string;
  planType: string;
  daysUntil: number;
  periodEnd: string;
}

function UpcomingRenewalsCard({ companies }: { companies: Company[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  const renewals = useMemo<RenewalItem[]>(() => {
    if (!now) return [];

    const items: RenewalItem[] = [];

    for (const company of companies) {
      for (const plan of company.plans) {
        if (!plan.isActive) continue;
        for (const invoice of plan.companyInvoices) {
          if (invoice.status === "CANCELLED") continue;
          if (!invoice.periodEnd) continue;
          const end = new Date(invoice.periodEnd);
          if (end <= now) continue;
          const daysUntil = Math.ceil(
            (end.getTime() - now.getTime()) / 86400000
          );
          items.push({
            companyId: company.id,
            companyName: company.name,
            planType: plan.planType,
            daysUntil,
            periodEnd: invoice.periodEnd,
          });
        }
      }
    }

    // dedupe by company (keep soonest renewal)
    const byCompany = new Map<string, RenewalItem>();
    for (const item of items) {
      const existing = byCompany.get(item.companyId);
      if (!existing || item.daysUntil < existing.daysUntil) {
        byCompany.set(item.companyId, item);
      }
    }

    return Array.from(byCompany.values())
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [companies, now]);

  const urgentCount = renewals.filter((r) => r.daysUntil <= 7).length;

  return (
    <div className="admin-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white font-semibold">Próximas renovaciones</p>
        {urgentCount > 0 && (
          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">
            {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {renewals.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">
          Sin renovaciones próximas
        </p>
      ) : (
        <div className="space-y-4">
          {renewals.map((item) => (
            <div key={item.companyId} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {getInitials(item.companyName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {item.companyName}
                </p>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${
                    item.planType === "FLAT_RATE"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-indigo-500/10 text-indigo-400"
                  }`}
                >
                  {item.planType === "FLAT_RATE"
                    ? "Flat Rate"
                    : item.planType === "MIXED"
                    ? "Mixed"
                    : "Per Vehicle"}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-bold ${
                    item.daysUntil <= 7 ? "text-red-400" : "text-slate-300"
                  }`}
                >
                  {item.daysUntil}d
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors border border-dashed border-slate-700 rounded-lg hover:border-slate-600">
        Ver todas
      </button>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function CompaniesCharts({ companies }: { companies: Company[] }) {
  return (
    <div className="space-y-6" style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}>
      <BarChartCard companies={companies} />
      <DonutChartCard companies={companies} />
      <UpcomingRenewalsCard companies={companies} />
    </div>
  );
}
