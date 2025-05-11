"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/contexts/language-context"

type UserActivityChartProps = {
  data: Array<{
    date: string
    logins: number
    transactions: number
  }>
}

export function UserActivityChart({ data }: UserActivityChartProps) {
  const { t } = useLanguage()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="logins" name={t("logins")} fill="#0F969C" />
        <Bar dataKey="transactions" name={t("transactions")} fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
