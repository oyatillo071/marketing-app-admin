import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-9xl font-bold text-primary">404</div>
      <h1 className="text-3xl font-bold mt-4">Page Not Found</h1>
      <p className="text-muted-foreground mt-2 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
