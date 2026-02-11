"use client";

import type React from "react";
import { useState } from "react";
import { User, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Employee } from "@/lib/types";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export default function AdminEmployeesPage() {
  const { state, addEmployee, removeEmployee } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [employeeType, setEmployeeType] = useState<'VALET' | 'ATTENDANT'>('VALET');
  const [email, setEmail] = useState("");

  const activeCarsCount = state.cars.filter((c) => !c.checkOutAt).length;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !idNumber) return;
    if (employeeType === 'ATTENDANT' && !email) return;

    addEmployee({
      name,
      idNumber,
      type: employeeType,
      email: employeeType === 'ATTENDANT' ? email : undefined,
    });

    setName("");
    setIdNumber("");
    setEmail("");
    setEmployeeType('VALET');
    setCreateOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v: boolean) => !v)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <AdminPageHeader
          title="Employees"
          subtitle="Manage team and vehicles"
          userName={user?.name || "Admin"}
          notificationCount={activeCarsCount}
          onLogout={() => {
            logout();
            router.push("/");
          }}
        />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button onClick={() => setCreateOpen(true)} className="uppercase">
              Create Employee
            </Button>
          </div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Employee List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Name</th>
                      <th className="px-4 py-3">ID Number</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 rounded-tr-lg text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {state.employees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No employees registered
                        </td>
                      </tr>
                    ) : (
                      state.employees.map((e: Employee) => (
                        <tr
                          key={e.id}
                          className="hover:bg-accent/30 transition-colors odd:bg-muted/20"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {e.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {e.idNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              e.type === 'VALET'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {e.type === 'VALET' ? 'Valet' : 'Attendant'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {e.email || '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEmployee(e.id, e.type)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Create Employee"
          description="Complete the details to register the employee"
          size="md"
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeType" className="text-muted-foreground">
                Employee Type
              </Label>
              <select
                id="employeeType"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={employeeType}
                onChange={(e) => setEmployeeType(e.target.value as 'VALET' | 'ATTENDANT')}
              >
                <option value="VALET">Valet</option>
                <option value="ATTENDANT">Attendant</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-muted-foreground">
                ID Number
              </Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Document number"
                required
              />
            </div>

            {employeeType === 'ATTENDANT' && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
