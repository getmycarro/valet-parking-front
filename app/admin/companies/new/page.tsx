"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { companiesService } from "@/lib/services/companies-service";
import { usersService, type AdminUser } from "@/lib/services/users-service";

export default function NewCompanyPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  // Admin user search
  const [adminSearch, setAdminSearch] = useState("");
  const [adminResults, setAdminResults] = useState<AdminUser[]>([]);
  const [adminSearching, setAdminSearching] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<AdminUser[]>([]);
  const debouncedAdminSearch = useDebounce(adminSearch, 300);

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
          const selectedIds = new Set(selectedAdmins.map((a) => a.id));
          setAdminResults(results.filter((r) => !selectedIds.has(r.id)));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAdminSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedAdminSearch, selectedAdmins]);

  function handleSelectAdmin(admin: AdminUser) {
    setSelectedAdmins((prev) => [...prev, admin]);
    setAdminResults((prev) => prev.filter((r) => r.id !== admin.id));
    setAdminSearch("");
  }

  function handleRemoveAdmin(adminId: string) {
    setSelectedAdmins((prev) => prev.filter((a) => a.id !== adminId));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedAdmins.length === 0) return;

    setCreating(true);
    try {
      const company = await companiesService.create({
        name: name.trim(),
        userIds: selectedAdmins.map((a) => a.id),
      });
      router.push(`/admin/companies/${company.id}`);
    } catch {
      // handled by interceptor
    } finally {
      setCreating(false);
    }
  }

  return (
    <AdminLayout
      title="New Company"
      subtitle="Create a new company"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push("/admin/companies")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      }
    >
      <form onSubmit={handleCreate}>
        <div className="grid gap-6 max-w-2xl">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                label="Company Name"
                id="companyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<Building2 className="h-4 w-4" />}
                placeholder="Company name"
                required
              />
            </CardContent>
          </Card>

          {/* Admin Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Admin Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected admins */}
              {selectedAdmins.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAdmins.map((admin) => (
                    <span
                      key={admin.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                    >
                      {admin.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins by name or email..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Search results */}
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
                        onClick={() => handleSelectAdmin(admin)}
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
                      No admins found
                    </div>
                  )}
                </div>
              )}

              {selectedAdmins.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  At least one admin user is required
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/admin/companies")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !name.trim() || selectedAdmins.length === 0}
            >
              {creating ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
