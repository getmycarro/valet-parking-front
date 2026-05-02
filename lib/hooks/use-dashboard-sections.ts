import type { UserRole } from "@/lib/auth";

type SectionKey = "kpi-cards" | "companies-table" | "charts" | "renewals";

const SECTION_PERMISSIONS: Record<SectionKey, UserRole[]> = {
  "kpi-cards":       ["super_admin"],
  "companies-table": ["super_admin"],
  "charts":          ["super_admin"],
  "renewals":        ["super_admin"],
};

export function useDashboardSections(role: UserRole) {
  return {
    isVisible: (key: SectionKey) =>
      SECTION_PERMISSIONS[key]?.includes(role) ?? false,
  };
}
