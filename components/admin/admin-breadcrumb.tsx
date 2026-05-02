import { ChevronRight } from "lucide-react";

interface AdminBreadcrumbProps {
  title: string;
}

export function AdminBreadcrumb({ title }: AdminBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden sm:flex items-center gap-2 text-sm text-slate-500"
    >
      <span>Admin</span>
      <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span className="text-slate-300 font-medium">{title}</span>
    </nav>
  );
}
