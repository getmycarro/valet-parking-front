"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { companiesService, type Company } from "@/lib/services/companies-service";

interface NewCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (company: Company) => void;
}

export function NewCompanyModal({ open, onClose, onCreated }: NewCompanyModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setSaving(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const company = await companiesService.create({
        name: name.trim(),
        userIds: [],
      });
      toast.success("Compañía creada");
      onCreated(company);
      onClose();
    } catch {
      toast.error("Error al crear la compañía");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Nueva compañía
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Crea una nueva empresa de estacionamiento en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-slate-300"
            >
              Nombre de la compañía
            </label>
            <input
              id="company-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Parking Central S.A."
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
            />
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/25"
            >
              {saving ? "Creando..." : "Crear compañía"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
