"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider } from "@/components/query-client-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { NotificationProvider } from "@/components/notification-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LanguageProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
