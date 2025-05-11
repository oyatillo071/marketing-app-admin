"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type RecentPaymentsProps = {
  data: Array<{
    id: string
    user: {
      name: string
      initials: string
    }
    amount: number
    status: string
    date: string
  }>
}

export function RecentPayments({ data }: RecentPaymentsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="ml-2 h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {data.map((payment) => (
        <div key={payment.id} className="flex items-center">
          <Avatar className="h-9 w-9 bg-red-500">
            <AvatarFallback>{payment.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{payment.user.name}</p>
            <p className="text-sm text-muted-foreground">{payment.date}</p>
          </div>
          <div className="ml-auto font-medium">${payment.amount.toFixed(2)}</div>
          <Badge className="ml-2 bg-green-500">{payment.status}</Badge>
        </div>
      ))}
    </div>
  )
}
