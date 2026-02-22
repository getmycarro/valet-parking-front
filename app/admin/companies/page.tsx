"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { DataTable, type Column } from "@/components/shared/data-table";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  companiesService,
  type Company,
} from "@/lib/services/companies-service";

const PLAN_LABELS: Record<string, string> = {
  FLAT_RATE: "Flat Rate",
  PER_VEHICLE: "Per Vehicle",
  MIXED: "Mixed",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(search, 300);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (statusFilter !== "all") filters.isActive = statusFilter === "true";

      const response = await companiesService.getAll(
        filters as Parameters<typeof companiesService.getAll>[0]
      );
      setCompanies(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response as unknown as Company[] : []);
    } catch {
      // API error handling via interceptor
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  async function onDelete(id: string) {
    try {
      await companiesService.delete(id);
      fetchCompanies();
    } catch {
      // API error handling via interceptor
    }
  }

  const columns: Column<Company>[] = [
    {
      header: "Name",
      render: (c) => (
        <button
          type="button"
          onClick={() => router.push(`/admin/companies/${c.id}`)}
          className="font-medium text-primary hover:underline cursor-pointer text-left"
        >
          {c.name}
        </button>
      ),
    },
    {
      header: "Status",
      render: (c) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            c.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {c.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Plan",
      render: (c) => {
        const activePlan = c.plans?.[0];
        return (
          <span className="text-muted-foreground">
            {activePlan
              ? PLAN_LABELS[activePlan.planType] || activePlan.planType
              : "-"}
          </span>
        );
      },
    },
    {
      header: "Period Start",
      render: (c) => (
        <span className="text-muted-foreground">
          {formatDate(c.plans?.[0]?.companyInvoices?.[0]?.periodStart)}
        </span>
      ),
    },
    {
      header: "Period End",
      render: (c) => (
        <span className="text-muted-foreground">
          {formatDate(c.plans?.[0]?.companyInvoices?.[0]?.periodEnd)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(c.id)}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Companies"
      subtitle="Manage parking companies"
      actions={
        <Button
          onClick={() => router.push("/admin/companies/new")}
          className="uppercase"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Company
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        emptyMessage="No companies found"
        title="Company List"
        titleIcon={<Building2 className="w-5 h-5" />}
        keyExtractor={(c) => c.id}
      />
    </AdminLayout>
  );
}
