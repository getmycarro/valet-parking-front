"use client"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NotificationBellProps {
  count: number
}

export function NotificationBell({ count }: NotificationBellProps) {
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {count}
        </Badge>
      )}
    </div>
  )
}
