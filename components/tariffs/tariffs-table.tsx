"use client";

import { useState, useMemo } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTariffs } from "@/hooks/use-tariffs";
import { useLanguage } from "@/contexts/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { TariffDetailsDialog } from "./tariff-details-dialog";
import { TariffFormDialog } from "./tariff-form-dialog";
import { Input } from "@/components/ui/input";

export function TariffsTable() {
  const { t, language } = useLanguage();
  const {
    data: tariffsRaw,
    isLoading,
    updateTariff,
    deleteTariff,
    createTariff,
  } = useTariffs();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [currentTariff, setCurrentTariff] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tariffs mapping: API response -> table row
  const tariffs = useMemo(() => {
    if (!tariffsRaw) return [];

    // Language to currency mapping
    const languageToCurrency: Record<string, string> = {
      uz: "UZS",
      ru: "RUB",
      en: "USD",
      kz: "KZT",
      kg: "KGS",
      tj: "TJS",
      cn: "CNY",
    };

    // Default currency based on language
    const preferredCurrency = languageToCurrency[language] || "UZS";

    return tariffsRaw.map((tariff: any) => {
      // Get translation for current language
      const translation =
        tariff.translations?.find((tr: any) => tr.language === language) ||
        tariff.translations?.[0] ||
        {};

      // Get price for preferred currency or default to first price
      const price =
        tariff.prices?.find((p: any) => p.currency === preferredCurrency) ||
        tariff.prices?.[0];

      return {
        id: tariff.id,
        name: translation.name || "null",
        description: translation.description || "-",
        price: price ? `${price.value} ${price.currency}` : "-",
        status: tariff.status || "Faol",
        term: tariff.term,
        referral_bonus: tariff.referral_bonus,
        createdAt: tariff.createdAt,
        photo_url: tariff.photo_url,
        // Store the full object for details view
        _original: tariff,
      };
    });
  }, [tariffsRaw, language]);

  // Filter tariffs based on search query
  const filteredTariffs = useMemo(() => {
    if (!searchQuery.trim()) return tariffs;

    const query = searchQuery.toLowerCase();
    return tariffs.filter(
      (tariff: any) =>
        tariff.name.toLowerCase().includes(query) ||
        tariff.description.toLowerCase().includes(query) ||
        tariff.price.toLowerCase().includes(query) ||
        String(tariff.term).includes(query)
    );
  }, [tariffs, searchQuery]);

  // Define the columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: t("id"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "price",
      header: t("price"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("price")}</div>
      ),
    },
    {
      accessorKey: "term",
      header: t("term"),
      cell: ({ row }) => (
        <div>
          {row.getValue("term")} {t("days")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={status === "Faol" ? "bg-green-500" : "bg-red-500"}>
            {status === "Faol" ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const tariff = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("openMenu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => {
                  setCurrentTariff(tariff._original);
                  setDetailsOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t("view")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTariff(tariff._original);
                  setFormOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t("edit")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  const newStatus =
                    tariff.status === "active" ? "unactive" : "active";
                  updateTariff(tariff.id, {
                    ...tariff._original,
                    status: newStatus,
                  });
                }}
              >
                {tariff.status === "Faol" ? (
                  <X className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {tariff.status === "Faol" ? t("deactivate") : t("activate")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => {
                  if (confirm(t("confirmDeleteMessage"))) {
                    deleteTariff(tariff.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredTariffs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleFormSubmit = (data: any) => {
    if (currentTariff) {
      console.log("Form submitted with data 273qator table:", data);
      // Update existing tariff
        const { id, ...rest } = data;
    updateTariff({ id, data: rest });
    } else {
      // Create new tariff
      createTariff(data);
    }
    setFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, i) => (
                  <TableHead key={i}>
                    {typeof column.header === "string"
                      ? column.header
                      : t("column")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="max-w-sm">
          <Input
            placeholder={t("searchTariffs")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {/* 
        <Button
          onClick={() => {
            setCurrentTariff(null);
            setFormOpen(true);
          }}
          size="sm"
        >
          {t("addTariff")}
        </Button> */}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => {
                    setCurrentTariff(row.original._original);
                    setDetailsOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("noDataFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("next")}
        </Button>
      </div>

      {/* Details Dialog */}
      <TariffDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        tariff={currentTariff}
      />

      {/* Form Dialog */}
      <TariffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={currentTariff}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
