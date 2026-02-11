"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { day: "Mon", revenue: 8500 },
  { day: "Tue", revenue: 10200 },
  { day: "Wed", revenue: 9800 },
  { day: "Thu", revenue: 11400 },
  { day: "Fri", revenue: 14200 },
  { day: "Sat", revenue: 15800 },
  { day: "Sun", revenue: 12450 },
]

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.45 0.2 250)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.45 0.2 250)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 240)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 240)", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "oklch(0.5 0.02 240)", fontSize: 12 }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              border: "1px solid oklch(0.88 0.02 240)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="oklch(0.45 0.2 250)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
