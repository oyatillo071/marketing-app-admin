"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-6xl font-bold text-destructive">Error</div>
      <h1 className="text-3xl font-bold mt-4">Something went wrong!</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        An unexpected error has occurred. Please try again later or contact support.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
