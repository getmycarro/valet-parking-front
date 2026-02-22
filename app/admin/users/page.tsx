"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { UserCog, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormField } from "@/components/shared/form-field";
import { SelectField } from "@/components/shared/select-field";
import { useCrudModal } from "@/lib/hooks/use-crud-modal";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { usersService, type SystemUser } from "@/lib/services/users-service";
import type { UserRole } from "@/lib/services/auth-service";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "ATTENDANT", label: "Attendant" },
];

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "ATTENDANT", label: "Attendant" },
];

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800",
  ADMIN: "bg-blue-100 text-blue-800",
  MANAGER: "bg-amber-100 text-amber-800",
  ATTENDANT: "bg-purple-100 text-purple-800",
};

type FormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const modal = useCrudModal<FormValues>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as UserRole,
  });

  const debouncedSearch = useDebounce(search, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string | number> = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (roleFilter !== "all") filters.role = roleFilter;

      const response = await usersService.getAll(
        filters as Parameters<typeof usersService.getAll>[0]
      );
      setUsers(response.data);
    } catch {
      // API error handling via interceptor
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal.values.name || !modal.values.email || !modal.values.password)
      return;

    try {
      const data = {
        name: modal.values.name,
        email: modal.values.email,
        password: modal.values.password,
        role: modal.values.role,
      };

      if (modal.values.role === "ADMIN") {
        await usersService.createAdmin(data);
      } else {
        await usersService.createStaff(data);
      }

      modal.close();
      fetchUsers();
    } catch {
      // API error handling via interceptor
    }
  }

  async function onDelete(id: string) {
    try {
      await usersService.delete(id);
      fetchUsers();
    } catch {
      // API error handling via interceptor
    }
  }

  function getCompanyName(user: SystemUser): string {
    const companies = user.companyUsers?.map((cu) => cu.company.name) || [];
    return companies.length > 0 ? companies.join(", ") : "-";
  }

  const tableColumns: Column<SystemUser>[] = [
    {
      header: "Name",
      render: (u) => (
        <span className="font-medium text-foreground">{u.name}</span>
      ),
    },
    {
      header: "Email",
      render: (u) => (
        <span className="text-muted-foreground">{u.email}</span>
      ),
    },
    {
      header: "Role",
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            roleBadgeColors[u.role] || "bg-gray-100 text-gray-800"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      header: "Company",
      render: (u) => (
        <span className="text-muted-foreground">{getCompanyName(u)}</span>
      ),
    },
    {
      header: "Status",
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            u.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {u.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(u.id)}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Users"
      subtitle="Manage system users"
      actions={
        <Button onClick={modal.open} className="uppercase">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={tableColumns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        title="User List"
        titleIcon={<UserCog className="w-5 h-5" />}
        keyExtractor={(u) => u.id}
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Add User"
        description="Create a new system user"
        size="md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="Name"
            id="userName"
            value={modal.values.name}
            onChange={(e) => modal.setField("name", e.target.value)}
            placeholder="Full name"
            required
          />

          <FormField
            label="Email"
            id="userEmail"
            type="email"
            value={modal.values.email}
            onChange={(e) => modal.setField("email", e.target.value)}
            placeholder="email@example.com"
            required
          />

          <FormField
            label="Password"
            id="userPassword"
            type="password"
            value={modal.values.password}
            onChange={(e) => modal.setField("password", e.target.value)}
            placeholder="••••••••"
            required
          />

          <SelectField
            label="Role"
            id="userRole"
            value={modal.values.role}
            onChange={(v) => modal.setField("role", v as UserRole)}
            options={ROLE_OPTIONS}
          />

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
