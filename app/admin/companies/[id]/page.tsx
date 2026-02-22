"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Users,
  Search,
  Trash2,
  CreditCard,
  Save,
  Calendar,
  Pencil,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/shared/form-field";
import { SelectField } from "@/components/shared/select-field";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  companiesService,
  type CompanyDetail,
  type CompanyPlan,
  type CompanyInvoice,
  type CreatePlanRequest,
} from "@/lib/services/companies-service";
import {
  usersService,
  type AdminUser,
} from "@/lib/services/users-service";

const PLAN_LABELS: Record<string, string> = {
  FLAT_RATE: "Flat Rate",
  PER_VEHICLE: "Per Vehicle",
  MIXED: "Mixed",
};

const PLAN_TYPE_OPTIONS = [
  { value: "FLAT_RATE", label: "Flat Rate" },
  { value: "PER_VEHICLE", label: "Per Vehicle" },
  { value: "MIXED", label: "Mixed" },
];

const FEE_TYPE_OPTIONS = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED", label: "Fixed" },
];

const INVOICE_STATUS_STYLES: Record<string, string> = {
  RECEIVED: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        INVOICE_STATUS_STYLES[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // User management
  const [adminSearch, setAdminSearch] = useState("");
  const [adminResults, setAdminResults] = useState<AdminUser[]>([]);
  const [adminSearching, setAdminSearching] = useState(false);
  const [usersDirty, setUsersDirty] = useState(false);
  const [currentUserIds, setCurrentUserIds] = useState<string[]>([]);
  const debouncedAdminSearch = useDebounce(adminSearch, 300);

  // Plan modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planModalMode, setPlanModalMode] = useState<"create" | "edit">("create");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<CreatePlanRequest>({
    planType: "FLAT_RATE",
  });
  const [savingPlan, setSavingPlan] = useState(false);

// Invoice modal
const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
const [editingInvoice, setEditingInvoice] = useState<{
  planId: string;
  invoice: CompanyInvoice;
} | null>(null);

const [invoiceForm, setInvoiceForm] = useState<Partial<CompanyInvoice>>({});
const [savingInvoice, setSavingInvoice] = useState(false);
  
  // Invoice updating
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await companiesService.getOne(companyId);
      setCompany(detail);
      setName(detail.name);
      setCurrentUserIds(detail.companyUsers.map((cu) => cu.user.id));
      setUsersDirty(false);
    } catch {
      router.push("/admin/companies");
    } finally {
      setLoading(false);
    }
  }, [companyId, router]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  // Search admins
  useEffect(() => {
    if (!debouncedAdminSearch) {
      setAdminResults([]);
      return;
    }

    let cancelled = false;
    setAdminSearching(true);
    usersService
      .getAdmins(debouncedAdminSearch)
      .then((results) => {
        if (!cancelled) {
          const existingIds = new Set(currentUserIds);
          setAdminResults(results.filter((r) => !existingIds.has(r.id)));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAdminSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedAdminSearch, currentUserIds]);
  
  function openEditInvoiceModal(planId: string, invoice: CompanyInvoice) {
  setEditingInvoice({ planId, invoice });
  setInvoiceForm({
    reference: invoice.reference,
    amountUSD: invoice.amountUSD,
    vehicleCount: invoice.vehicleCount,
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    status: invoice.status,
  });
  setInvoiceModalOpen(true);
}

  function handleAddUser(admin: AdminUser) {
    setCurrentUserIds((prev) => [...prev, admin.id]);
    setAdminResults((prev) => prev.filter((r) => r.id !== admin.id));
    setAdminSearch("");
    setUsersDirty(true);
  }

  function handleRemoveUser(userId: string) {
    setCurrentUserIds((prev) => prev.filter((id) => id !== userId));
    setUsersDirty(true);
  }

  async function handleToggleActive() {
    if (!company) return;
    setSaving(true);
    try {
      await companiesService.update(companyId, { isActive: !company.isActive });
      await fetchCompany();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveName() {
    if (!name.trim() || name === company?.name) return;
    setSaving(true);
    try {
      await companiesService.update(companyId, { name: name.trim() });
      await fetchCompany();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUsers() {
    if (currentUserIds.length === 0) return;
    setSaving(true);
    try {
      await companiesService.update(companyId, { userIds: currentUserIds });
      await fetchCompany();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    setSavingPlan(true);
    try {
      if (planModalMode === "edit" && editingPlanId) {
        await companiesService.updatePlan(companyId, editingPlanId, planForm);
      } else {
        await companiesService.createPlan(companyId, planForm);
      }
      setPlanModalOpen(false);
      setPlanForm({ planType: "FLAT_RATE" });
      await fetchCompany();
    } catch {
      // handled by interceptor
    } finally {
      setSavingPlan(false);
    }
  }

  async function handleUpdateInvoiceStatus(
    planId: string,
    invoiceId: string,
    status: CompanyInvoice["status"]
  ) {
    setUpdatingInvoiceId(invoiceId);
    try {
      await companiesService.updateInvoice(companyId, planId, invoiceId, { status });
      await fetchCompany();
    } catch {
      // handled by interceptor
    } finally {
      setUpdatingInvoiceId(null);
    }
  }

  async function handleSaveInvoice(e: React.FormEvent) {
  e.preventDefault();
  if (!editingInvoice) return;

  setSavingInvoice(true);
  try {
    await companiesService.updateInvoice(
      companyId,
      editingInvoice.planId,
      editingInvoice.invoice.id,
      invoiceForm
    );

    setInvoiceModalOpen(false);
    setEditingInvoice(null);
    await fetchCompany();
  } catch {
    // handled by interceptor
  } finally {
    setSavingInvoice(false);
  }
}
  function openCreatePlanModal() {
    setPlanModalMode("create");
    setEditingPlanId(null);
    setPlanForm({ planType: "FLAT_RATE" });
    setPlanModalOpen(true);
  }

  function openEditPlanModal(plan: CompanyPlan) {
    setPlanModalMode("edit");
    setEditingPlanId(plan.id);
    setPlanForm({
      planType: plan.planType,
      flatRate: plan.flatRate ?? undefined,
      perVehicleRate: plan.perVehicleRate ?? undefined,
      feeType: plan.feeType ?? undefined,
      feeValue: plan.feeValue ?? undefined,
      basePrice: plan.basePrice ?? undefined,
    });
    setPlanModalOpen(true);
  }

  if (loading) {
    return (
      <AdminLayout title="Company Detail" subtitle="Loading...">
        <div className="text-center py-12 text-muted-foreground">
          Loading company details...
        </div>
      </AdminLayout>
    );
  }

  if (!company) return null;

  const activePlan = company.plans?.find((p) => p.isActive) as CompanyPlan | undefined;
  const lastPlan = company.plans?.length > 0
    ? [...company.plans].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : undefined;

  return (
    <AdminLayout
      title={company.name}
      subtitle="Company details"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push("/admin/companies")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      }
    >
      <div className="grid gap-6">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Company Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Company name"
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={saving || !name.trim() || name === company.name}
                    size="icon"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Status
                  </p>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={company.isActive}
                      onCheckedChange={handleToggleActive}
                      disabled={saving}
                    />
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        company.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    Created
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(company.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Plans
              </CardTitle>
              <Button onClick={openCreatePlanModal} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" /> New Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {company.plans?.length > 0 ? (
              <div className="divide-y divide-border">
                {company.plans.map((plan) => (
                  <div key={plan.id} className="py-4 first:pt-0 last:pb-0">
                    {/* Plan header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {PLAN_LABELS[plan.planType] || plan.planType}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            plan.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Since {formatDate(plan.createdAt)}
                        </span>
                        {plan.id === lastPlan?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openEditPlanModal(plan)}
                            title="Edit plan"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Plan details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                      {plan.flatRate != null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            Flat Rate
                          </p>
                          <p className="font-medium">${plan.flatRate}</p>
                        </div>
                      )}
                      {plan.perVehicleRate != null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            Per Vehicle
                          </p>
                          <p className="font-medium">${plan.perVehicleRate}</p>
                        </div>
                      )}
                      {plan.basePrice != null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            Base Price
                          </p>
                          <p className="font-medium">${plan.basePrice}</p>
                        </div>
                      )}
                      {plan.feeType && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            Fee Type
                          </p>
                          <p className="font-medium">{plan.feeType}</p>
                        </div>
                      )}
                      {plan.feeValue != null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            Fee Value
                          </p>
                          <p className="font-medium">
                            {plan.feeType === "PERCENTAGE"
                              ? `${plan.feeValue}%`
                              : `$${plan.feeValue}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Invoices */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Invoices ({plan.companyInvoices?.length ?? 0})
                        </p>
                      </div>
                      {plan.companyInvoices?.length > 0 ? (
                        <div className="border border-border rounded-md overflow-hidden bg-muted/30">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-muted/50">
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                  Period
                                </th>
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                                  Reference
                                </th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                                  Amount
                                </th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                                  Vehicles
                                </th>
                                <th className="text-center px-3 py-2 font-medium text-muted-foreground">
                                  Status
                                </th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {plan.companyInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                                  <td className="px-3 py-3 text-sm text-muted-foreground">
                                    {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                                  </td>
                                  <td className="px-3 py-3 text-sm font-mono font-medium">
                                    {inv.reference ?? "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-right font-medium">
                                    ${inv.amountUSD.toFixed(2)}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-right text-muted-foreground">
                                    {inv.vehicleCount ?? "-"}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-center">
                                    <InvoiceStatusBadge status={inv.status} />
                                  </td>
                                  <td className="px-3 py-3 text-sm text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEditInvoiceModal(plan.id, inv)}
                                      className="h-7 w-7"
                                      title="Edit invoice"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic py-3 px-3 bg-muted/20 rounded-md">
                          No invoices for this plan
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No plans configured</p>
            )}
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Users (
                {company.companyUsers?.length || 0})
              </CardTitle>
              {usersDirty && (
                <Button
                  onClick={handleSaveUsers}
                  disabled={saving || currentUserIds.length === 0}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Users
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add user search */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Add User</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {adminSearch && (
                <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                  {adminSearching ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                      Searching...
                    </div>
                  ) : adminResults.length > 0 ? (
                    adminResults.map((admin) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => handleAddUser(admin)}
                        className="w-full text-left px-4 py-2 hover:bg-accent/50 transition-colors text-sm flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">
                          {admin.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {admin.email}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Users list */}
            {company.companyUsers?.length > 0 ? (
              <div className="border border-border rounded-md divide-y divide-border">
                {company.companyUsers.map((cu) => {
                  const isRemoved = !currentUserIds.includes(cu.user.id);
                  return (
                    <div
                      key={cu.id}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        isRemoved ? "opacity-40 line-through" : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {cu.user.name || "No name"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {cu.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground uppercase">
                          {cu.user.role}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            cu.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cu.isActive ? "Active" : "Inactive"}
                        </span>
                        {!isRemoved ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUser(cu.user.id)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20 h-8 w-8"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCurrentUserIds((prev) => [
                                ...prev,
                                cu.user.id,
                              ])
                            }
                            className="text-xs"
                          >
                            Undo
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Show newly added users that aren't in the original list */}
                {currentUserIds
                  .filter(
                    (id) => !company.companyUsers.some((cu) => cu.user.id === id)
                  )
                  .map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between px-4 py-3 text-sm bg-green-50"
                    >
                      <span className="text-foreground text-xs italic">
                        New user (ID: {id.slice(0, 8)}...)
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUser(id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20 h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No users assigned
              </p>
            )}

            {currentUserIds.length === 0 && (
              <p className="text-xs text-destructive">
                At least one user is required
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={activePlan ? "Change Plan" : "Set Plan"}
        description="Configure the billing plan for this company"
        size="lg"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <SelectField
            label="Plan Type"
            id="planType"
            value={planForm.planType}
            onChange={(val) =>
              setPlanForm({ planType: val as CreatePlanRequest["planType"] })
            }
            options={PLAN_TYPE_OPTIONS}
            required
          />

          {(planForm.planType === "FLAT_RATE" ||
            planForm.planType === "MIXED") && (
            <FormField
              label={
                planForm.planType === "MIXED" ? "Base Price ($)" : "Flat Rate ($)"
              }
              id="flatRate"
              type="number"
              step="0.01"
              value={
                planForm.planType === "MIXED"
                  ? planForm.basePrice ?? ""
                  : planForm.flatRate ?? ""
              }
              onChange={(e) => {
                const val = e.target.value
                  ? parseFloat(e.target.value)
                  : undefined;
                if (planForm.planType === "MIXED") {
                  setPlanForm((prev) => ({ ...prev, basePrice: val }));
                } else {
                  setPlanForm((prev) => ({ ...prev, flatRate: val }));
                }
              }}
              placeholder="0.00"
              required
            />
          )}

          {(planForm.planType === "PER_VEHICLE" ||
            planForm.planType === "MIXED") && (
            <>
              <FormField
                label="Per Vehicle Rate ($)"
                id="perVehicleRate"
                type="number"
                step="0.01"
                value={planForm.perVehicleRate ?? ""}
                onChange={(e) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    perVehicleRate: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="0.00"
                required
              />
              <SelectField
                label="Fee Type"
                id="feeType"
                value={planForm.feeType ?? ""}
                onChange={(val) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    feeType: val as "PERCENTAGE" | "FIXED" | undefined,
                  }))
                }
                options={FEE_TYPE_OPTIONS}
                placeholder="Select fee type"
              />
              {planForm.feeType && (
                <FormField
                  label={
                    planForm.feeType === "PERCENTAGE"
                      ? "Fee Value (%)"
                      : "Fee Value ($)"
                  }
                  id="feeValue"
                  type="number"
                  step="0.01"
                  value={planForm.feeValue ?? ""}
                  onChange={(e) =>
                    setPlanForm((prev) => ({
                      ...prev,
                      feeValue: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="0.00"
                />
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingPlan}>
              {savingPlan ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </form>
      </Modal>


      {/* Invoice Modal*/}
      <Modal
  isOpen={invoiceModalOpen}
  onClose={() => setInvoiceModalOpen(false)}
  title="Edit Invoice"
  description="Update invoice details"
  size="lg"
>
  <form onSubmit={handleSaveInvoice} className="space-y-4">

    <FormField
      label="Reference"
      id="reference"
      value={invoiceForm.reference ?? ""}
      onChange={(e) =>
        setInvoiceForm((prev) => ({
          ...prev,
          reference: e.target.value,
        }))
      }
    />

    <FormField
      label="Amount (USD)"
      id="amountUSD"
      type="number"
      step="0.01"
      value={invoiceForm.amountUSD ?? ""}
      onChange={(e) =>
        setInvoiceForm((prev) => ({
          ...prev,
          amountUSD: parseFloat(e.target.value),
        }))
      }
      required
    />

    <FormField
      label="Vehicle Count"
      id="vehicleCount"
      type="number"
      value={invoiceForm.vehicleCount ?? ""}
      onChange={(e) =>
        setInvoiceForm((prev) => ({
          ...prev,
          vehicleCount: parseInt(e.target.value),
        }))
      }
    />

    <SelectField
      label="Status"
      id="status"
      value={invoiceForm.status ?? ""}
      onChange={(val) =>
        setInvoiceForm((prev) => ({
          ...prev,
          status: val as CompanyInvoice["status"],
        }))
      }
      options={[
        { value: "PENDING", label: "Pending" },
        { value: "RECEIVED", label: "Received" },
        { value: "CANCELLED", label: "Cancelled" },
      ]}
      required
    />

    <FormField
      label="Period Start"
      id="periodStart"
      type="date"
      value={invoiceForm.periodStart?.slice(0, 10) ?? ""}
      onChange={(e) =>
        setInvoiceForm((prev) => ({
          ...prev,
          periodStart: e.target.value,
        }))
      }
    />

    <FormField
      label="Period End"
      id="periodEnd"
      type="date"
      value={invoiceForm.periodEnd?.slice(0, 10) ?? ""}
      onChange={(e) =>
        setInvoiceForm((prev) => ({
          ...prev,
          periodEnd: e.target.value,
        }))
      }
    />

    <div className="flex justify-end gap-2 pt-2">
      <Button
        variant="outline"
        type="button"
        onClick={() => setInvoiceModalOpen(false)}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={savingInvoice}>
        {savingInvoice ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  </form>
</Modal>
    </AdminLayout>
  );
}
