import { cn } from "@/lib/utils"

type StatusType = "success" | "warning" | "error" | "info" | "default"

interface StatusBadgeProps {
  status: StatusType
  label: string
  showDot?: boolean
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning-foreground",
  error: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  default: "bg-muted text-muted-foreground",
}

const dotStyles: Record<StatusType, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  info: "bg-info",
  default: "bg-muted-foreground",
}

export function StatusBadge({ status, label, showDot = true, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {showDot && <span className={cn("w-2 h-2 rounded-full", dotStyles[status])} />}
      {label}
    </span>
  )
}
