"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Download, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { RecentTransactions } from "@/components/admin/recent-transactions";
import { useAuth } from "@/lib/auth";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { useStore } from "@/lib/store";

export default function AdminBillingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { state } = useStore();

  const activeCarsCount = state.cars.filter((c) => !c.checkOutAt).length;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <AdminPageHeader
          title="Billing"
          subtitle="Revenue and transaction management"
          userName={user?.name || "Admin"}
          notificationCount={activeCarsCount}
          onLogout={() => {
            logout();
            router.push("/");
          }}
        />

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    This Week
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Today</DropdownMenuItem>
                  <DropdownMenuItem>This Week</DropdownMenuItem>
                  <DropdownMenuItem>This Month</DropdownMenuItem>
                  <DropdownMenuItem>This Year</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Transactions
              </h2>
              <p className="text-sm text-muted-foreground">
                Latest recorded payments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}
