import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table"
import type { ReactNode } from "react"

interface VehicleTableProps {
  children: ReactNode
}

export function VehicleTable({ children }: VehicleTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        {children}
      </Table>
    </div>
  )
}

export { TableHeader, TableRow, TableHead, TableBody }
