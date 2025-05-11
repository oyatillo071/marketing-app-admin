"use client"

import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"

export function Search() {
  const { t } = useLanguage()

  return (
    <div className="relative w-64">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t("search")}
        className="w-full bg-background pl-8 rounded-md"
        aria-label={t("search")}
      />
    </div>
  )
}
