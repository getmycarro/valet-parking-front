"use client";

import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Company } from "@/lib/services/companies-service";

interface CompaniesSelectorModalProps {
  companies: Company[];
  loading: boolean;
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
  onShowAll: () => void;
}

export function CompaniesSelectorModal({
  companies,
  loading,
  selectedCompanyId,
  onSelectCompany,
  onShowAll,
}: CompaniesSelectorModalProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Your Companies
          {selectedCompanyId && (
            <span className="text-sm font-normal text-muted-foreground">
              (Filtering by company)
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          {selectedCompanyId && (
            <Button
              onClick={onShowAll}
              variant="outline"
              size="sm"
            >
              Show All
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => onSelectCompany(company.id)}
              className={`p-4 border rounded-lg hover:border-primary hover:bg-secondary/50 transition-colors cursor-pointer bg-card text-left ${
                selectedCompanyId === company.id ? "border-primary bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground">{company.name}</h3>
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
              {company.plans && company.plans.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Plan: {company.plans[0].planType}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Created {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 border rounded-lg bg-card text-center">
          <p className="text-muted-foreground">No companies found</p>
        </div>
      )}
    </div>
  );
}
