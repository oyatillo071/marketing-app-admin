"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";

export function Search() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-64">
      <div className="hidden sm:block">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("search")}
          className="w-full bg-background pl-8 rounded-md"
          aria-label={t("search")}
        />
      </div>

      <div className="sm:hidden flex items-center justify-center">
        <button aria-label={t("search")}>
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
