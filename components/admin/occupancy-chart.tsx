"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Zone A", value: 85, color: "oklch(0.45 0.2 250)" },
  { name: "Zone B", value: 72, color: "oklch(0.55 0.18 250)" },
  { name: "Zone C", value: 65, color: "oklch(0.65 0.15 250)" },
  { name: "VIP Zone", value: 90, color: "oklch(0.35 0.22 250)" },
]

export function OccupancyChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.02 240)",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`${value}%`, "Occupancy"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
