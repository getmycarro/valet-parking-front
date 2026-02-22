"use client"
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Column<T> {
  header: string
  render: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  title?: string
  titleIcon?: ReactNode
  keyExtractor: (item: T) => string
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  title,
  titleIcon,
  keyExtractor,
}: DataTableProps<T>) {
  const colCount = columns.length

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-muted text-muted-foreground">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.header}
                className={`px-4 py-3 ${i === 0 ? "rounded-tl-lg" : ""} ${
                  i === colCount - 1 ? "rounded-tr-lg" : ""
                } ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-accent/30 transition-colors odd:bg-muted/20"
              >
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3 ${col.className || ""}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            {titleIcon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{table}</CardContent>
      </Card>
    )
  }

  return table
}
