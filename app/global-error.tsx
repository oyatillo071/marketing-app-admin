"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <div className="text-6xl font-bold text-destructive">Error</div>
          <h1 className="text-3xl font-bold mt-4">Something went wrong!</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            A critical error has occurred. Please try again later or contact support.
          </p>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </body>
    </html>
  )
}
