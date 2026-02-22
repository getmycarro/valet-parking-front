"use client";

import type React from "react";
import { useState } from "react";
import { User, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Employee } from "@/lib/types";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormField } from "@/components/shared/form-field";
import { SelectField } from "@/components/shared/select-field";
import { useCrudModal } from "@/lib/hooks/use-crud-modal";

const EMPLOYEE_TYPE_OPTIONS = [
  { value: "VALET", label: "Valet" },
  { value: "ATTENDANT", label: "Attendant" },
  { value: "MANAGER", label: "Manager" },
];

const columns: Column<Employee>[] = [
  {
    header: "Name",
    render: (e) => (
      <span className="font-medium text-foreground">{e.name}</span>
    ),
  },
  {
    header: "ID Number",
    render: (e) => (
      <span className="text-muted-foreground">{e.idNumber}</span>
    ),
  },
  {
    header: "Type",
    render: (e) => {
      const typeConfig = {
        VALET: { bg: "bg-blue-100", text: "text-blue-800", label: "Valet" },
        ATTENDANT: { bg: "bg-purple-100", text: "text-purple-800", label: "Attendant" },
        MANAGER: { bg: "bg-green-100", text: "text-green-800", label: "Manager" },
      };
      const config = typeConfig[e.type as keyof typeof typeConfig] || typeConfig.VALET;
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      );
    },
  },
  {
    header: "Email",
    render: (e) => (
      <span className="text-muted-foreground">{e.email || "-"}</span>
    ),
  },
];

type FormValues = {
  name: string;
  idNumber: string;
  employeeType: "VALET" | "ATTENDANT" | "MANAGER" ;
  email: string;
};

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { state, addEmployee, removeEmployee } = useStore();
  const modal = useCrudModal<FormValues>({
    name: "",
    idNumber: "",
    employeeType: "VALET",
    email: "",
  });

  const filteredEmployees = state.employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal.values.name || !modal.values.idNumber) return;
    if (modal.values.employeeType === "ATTENDANT" && !modal.values.email)
      return;

    addEmployee({
      name: modal.values.name,
      idNumber: modal.values.idNumber,
      type: modal.values.employeeType,
      email:
        modal.values.employeeType === "ATTENDANT"
          ? modal.values.email
          : undefined,
    });

    modal.close();
  }

  const actionColumn: Column<Employee> = {
    header: "Actions",
    className: "text-right",
    render: (e) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeEmployee(e.id, e.type)}
        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  };

  return (
    <AdminLayout
      title="Employees"
      subtitle="Manage team and vehicles"
      actions={
        <Button onClick={modal.open} className="uppercase">
          Create Employee
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or ID number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      <DataTable
        columns={[...columns, actionColumn]}
        data={filteredEmployees}
        emptyMessage="No employees registered"
        title="Employee List"
        keyExtractor={(e) => e.id}
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Create Employee"
        description="Complete the details to register the employee"
        size="md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <SelectField
            label="Employee Type"
            id="employeeType"
            value={modal.values.employeeType}
            onChange={(v) =>
              modal.setField("employeeType", v as "VALET" | "ATTENDANT" | "MANAGER")
            }
            options={EMPLOYEE_TYPE_OPTIONS}
          />

          <FormField
            label="Name"
            id="name"
            value={modal.values.name}
            onChange={(e) => modal.setField("name", e.target.value)}
            icon={<User className="h-4 w-4" />}
            placeholder="Full name"
            required
          />

          <FormField
            label="ID Number"
            id="idNumber"
            value={modal.values.idNumber}
            onChange={(e) => modal.setField("idNumber", e.target.value)}
            placeholder="Document number"
            required
          />

          {modal.values.employeeType === "ATTENDANT" && (
            <FormField
              label="Email"
              id="email"
              type="email"
              value={modal.values.email}
              onChange={(e) => modal.setField("email", e.target.value)}
              placeholder="email@example.com"
              required
            />
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={modal.close}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
