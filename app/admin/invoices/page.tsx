"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Clock, CheckCircle, XCircle, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { DataTable, type Column } from "@/components/shared/data-table";
import {
  companiesService,
  type Company,
  type CompanyInvoice,
} from "@/lib/services/companies-service";
import { paymentsService, type PaymentMethod } from "@/lib/services/payments-service";

const PLAN_LABELS: Record<string, string> = {
  FLAT_RATE: "Flat Rate",
  PER_VEHICLE: "Per Vehicle",
  MIXED: "Mixed",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

type InvoiceRow = CompanyInvoice & {
  companyName: string;
  companyId: string;
  planId: string;
};

type StatusFilter = "ALL" | "PENDING" | "RECEIVED" | "CANCELLED";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "RECEIVED") {
    return <Badge variant="default">Received</Badge>;
  }
  if (status === "CANCELLED") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null);
  const [editForm, setEditForm] = useState({ reference: "", paymentMethodId: "", amountUSD: "" });
  const [saving, setSaving] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await companiesService.getAll({ limit: 100 });
      const companies: Company[] = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? (response as unknown as Company[])
        : [];

      const rows: InvoiceRow[] = [];
      for (const company of companies) {
        for (const plan of company.plans ?? []) {
          for (const invoice of plan.companyInvoices ?? []) {
            rows.push({
              ...invoice,
              companyName: company.name,
              companyId: company.id,
              planId: plan.id,
            });
          }
        }
      }

      // Sort newest first
      rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInvoices(rows);
    } catch {
      // API error handling via interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    paymentsService.getMethods().then(setPaymentMethods).catch(() => {});
  }, [fetchInvoices]);

  const openEdit = useCallback((inv: InvoiceRow) => {
    setEditingInvoice(inv);
    setEditForm({
      reference: inv.reference ?? "",
      paymentMethodId: inv.paymentMethodId ?? "",
      amountUSD: String(inv.amountUSD),
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingInvoice) return;
    setSaving(true);
    try {
      const updated = await companiesService.updateInvoice(
        editingInvoice.companyId,
        editingInvoice.planId,
        editingInvoice.id,
        {
          reference: editForm.reference || null,
          paymentMethodId: editForm.paymentMethodId || null,
          amountUSD: parseFloat(editForm.amountUSD),
        }
      );
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editingInvoice.id ? { ...inv, ...updated } : inv
        )
      );
      setEditingInvoice(null);
    } catch {
      // API error handling via interceptor
    } finally {
      setSaving(false);
    }
  }, [editingInvoice, editForm]);

  const filtered =
    statusFilter === "ALL"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  const pending = invoices.filter((i) => i.status === "PENDING");
  const received = invoices.filter((i) => i.status === "RECEIVED");
  const cancelled = invoices.filter((i) => i.status === "CANCELLED");
  const pendingTotal = pending.reduce((sum, i) => sum + i.amountUSD, 0);
  const receivedTotal = received.reduce((sum, i) => sum + i.amountUSD, 0);

  const columns: Column<InvoiceRow>[] = [
    {
      header: "ID",
      render: (inv) => (
        <span className="font-mono text-xs text-muted-foreground">
          {inv.id.slice(-8)}
        </span>
      ),
    },
    {
      header: "Company",
      render: (inv) => (
        <span className="font-medium">{inv.companyName}</span>
      ),
    },
    {
      header: "Plan",
      render: (inv) => (
        <span className="text-muted-foreground">
          {PLAN_LABELS[inv.planType] ?? inv.planType}
        </span>
      ),
    },
    {
      header: "Period",
      render: (inv) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
        </span>
      ),
    },
    {
      header: "Amount",
      render: (inv) => (
        <span className="font-semibold">${inv.amountUSD.toFixed(2)}</span>
      ),
    },
    {
      header: "Status",
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: "Date",
      className: "text-right",
      render: (inv) => (
        <span className="text-sm text-muted-foreground text-right block">
          {formatDate(inv.date)}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      render: (inv) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEdit(inv)}
          className="h-7 w-7 p-0"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Received", value: "RECEIVED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <AdminLayout
      title="Invoices"
      subtitle="Your plan billing history and pending charges"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
            <div className="text-lg font-semibold text-yellow-600 mt-1">
              ${pendingTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{received.length}</div>
            <div className="text-lg font-semibold text-green-600 mt-1">
              ${receivedTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelled.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cancelled invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                statusFilter === btn.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-foreground"
              }`}
            >
              {btn.label}
              {btn.value !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-70">
                  (
                  {btn.value === "PENDING"
                    ? pending.length
                    : btn.value === "RECEIVED"
                    ? received.length
                    : cancelled.length}
                  )
                </span>
              )}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No invoices found"
          title="Invoice List"
          titleIcon={<FileText className="w-5 h-5" />}
          keyExtractor={(inv) => inv.id}
        />
      </div>

      <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-reference">Reference</Label>
              <Input
                id="edit-reference"
                placeholder="Enter reference"
                value={editForm.reference}
                onChange={(e) => setEditForm((f) => ({ ...f, reference: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-method">Payment Method</Label>
              <Select
                value={editForm.paymentMethodId}
                onValueChange={(val) => setEditForm((f) => ({ ...f, paymentMethodId: val }))}
              >
                <SelectTrigger id="edit-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-amount">Amount (USD)</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editForm.amountUSD}
                onChange={(e) => setEditForm((f) => ({ ...f, amountUSD: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInvoice(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !editForm.amountUSD}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
