"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type TariffDistributionChartProps = {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

export function TariffDistributionChart({ data }: TariffDistributionChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} users`, "Count"]} labelFormatter={(label) => `${label} tariff`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-center gap-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
