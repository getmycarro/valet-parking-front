"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, Plus, Pencil, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/shared/form-field";
import { SelectField } from "@/components/shared/select-field";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  companiesService,
  type Company,
} from "@/lib/services/companies-service";
import {
  paymentsService,
  type PaymentMethod,
  type CreatePaymentMethodRequest,
} from "@/lib/services/payments-service";

const PAYMENT_METHOD_TYPE_OPTIONS = [
  { value: "ZELLE", label: "Zelle" },
  { value: "MOBILE_PAYMENT", label: "Pago Móvil" },
  { value: "BINANCE", label: "Binance" },
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ZELLE: "Zelle",
  MOBILE_PAYMENT: "Pago Móvil",
  BINANCE: "Binance",
  CASH: "Efectivo",
  CARD: "Tarjeta",
};

export default function PaymentMethodsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePaymentMethodRequest>({
    type: "ZELLE",
    name: "",
    form: "",
  });
  const [saving, setSaving] = useState(false);

  // Load companies
  useEffect(() => {
    setLoadingCompanies(true);
    companiesService
      .getAll({ limit: 100 })
      .then((res) => {
        const list: Company[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? (res as unknown as Company[]) : [];
        setCompanies(list);
        if (list.length > 0) setSelectedCompanyId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingCompanies(false));
  }, []);

  // Load methods when company changes
  const fetchMethods = useCallback(async (companyId: string) => {
    setLoadingMethods(true);
    try {
      const data = await paymentsService.getCompanyMethods(companyId);
      setMethods(data);
    } catch {
      setMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCompanyId) fetchMethods(selectedCompanyId);
  }, [selectedCompanyId, fetchMethods]);

  function openCreate() {
    setModalMode("create");
    setEditingMethodId(null);
    setForm({ type: "ZELLE", name: "", form: "" });
    setModalOpen(true);
  }

  function openEdit(method: PaymentMethod) {
    setModalMode("edit");
    setEditingMethodId(method.id);
    setForm({ type: method.type, name: method.name, form: method.form });
    setModalOpen(true);
  }

  async function handleToggleActive(method: PaymentMethod) {
    if (!selectedCompanyId) return;
    try {
      await paymentsService.updateCompanyMethod(selectedCompanyId, method.id, {
        isActive: !method.isActive,
      });
      await fetchMethods(selectedCompanyId);
    } catch {
      // handled by interceptor
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setSaving(true);
    try {
      if (modalMode === "edit" && editingMethodId) {
        await paymentsService.updateCompanyMethod(selectedCompanyId, editingMethodId, form);
      } else {
        await paymentsService.createCompanyMethod(selectedCompanyId, form);
      }
      setModalOpen(false);
      await fetchMethods(selectedCompanyId);
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <AdminLayout title="Métodos de pago" subtitle="Gestiona los métodos de pago de tus empresas">
      {loadingCompanies ? (
        <div className="text-center py-12 text-muted-foreground">Cargando empresas...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No tienes empresas asignadas.</div>
      ) : (
        <div className="space-y-6">
          {/* Company selector — only shown when there are multiple companies */}
          {companies.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedCompanyId === c.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Methods card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  {selectedCompany?.name ?? "Empresa"}
                  <span className="text-muted-foreground text-sm font-normal">
                    ({methods.length} método{methods.length !== 1 ? "s" : ""})
                  </span>
                </CardTitle>
                <Button onClick={openCreate} variant="outline" size="sm" disabled={!selectedCompanyId}>
                  <Plus className="w-4 h-4 mr-1" /> Nuevo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMethods ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>
              ) : methods.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-3 px-3 bg-muted/20 rounded-md">
                  No hay métodos de pago registrados para esta empresa
                </p>
              ) : (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tipo</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Cuenta / Form</th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground">Estado</th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {methods.map((m) => (
                        <tr key={m.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-3 py-3 font-medium">{m.name}</td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[m.type] ?? m.type}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">{m.form}</td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(m)}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                m.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {m.isActive ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(m)}
                              title="Editar método"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === "edit" ? "Editar método de pago" : "Nuevo método de pago"}
        description="Configura los datos del método de pago"
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <SelectField
            label="Tipo"
            id="type"
            value={form.type}
            onChange={(val) => setForm((p) => ({ ...p, type: val as CreatePaymentMethodRequest["type"] }))}
            options={PAYMENT_METHOD_TYPE_OPTIONS}
            required
          />
          <FormField
            label="Nombre"
            id="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ej: Zelle principal"
            required
          />
          <FormField
            label="Cuenta / Identificador"
            id="form"
            value={form.form}
            onChange={(e) => setForm((p) => ({ ...p, form: e.target.value }))}
            placeholder="Ej: correo@email.com o 04XX-XXXXXXX"
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : modalMode === "edit" ? "Guardar cambios" : "Crear método"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
