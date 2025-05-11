"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ArrowUpDown, MoreHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/use-users";
import { useLanguage } from "@/contexts/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersTable({ searchTerm = "" }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: users, isLoading, deleteUser } = useUsers();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tariffFilter, setTariffFilter] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (users) {
      let filtered = [...users];

      // Apply search filter
      if (localSearchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
            item.phone.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(localSearchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      // Apply tariff filter
      if (tariffFilter && tariffFilter !== "all") {
        filtered = filtered.filter((item) => item.tariff === tariffFilter);
      }

      // Only update filtered data if it has actually changed
      if (JSON.stringify(filtered) !== JSON.stringify(filteredData)) {
        setFilteredData(filtered);
      }
    }
  }, [users, localSearchTerm, statusFilter, tariffFilter, filteredData]);

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
      header: t("name"),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-red-500">
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            {user.name}
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: t("phone"),
    },
    {
      accessorKey: "tariff",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("tariff")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tariff = row.getValue("tariff") as string;
        return (
          <Badge
            className={
              tariff === "Premium"
                ? "bg-red-500"
                : tariff === "Standard"
                ? "bg-green-500"
                : "bg-gray-500"
            }
          >
            {tariff}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={status === "Faol" ? "bg-green-500" : "bg-red-500"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "balance",
      header: t("balance"),
      cell: ({ row }) => {
        const balance = Number.parseFloat(row.getValue("balance"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(balance);
        return <div>{formatted}</div>;
      },
    },
    {
      accessorKey: "registrationDate",
      header: t("registrationDate"),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const user = row.original;

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
                onClick={() => router.push(`/dashboard/users/${user.id}`)}
              >
                {t("view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
              >
                {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => {
                  if (confirm(t("confirmDeleteMessage"))) {
                    deleteUser(user.id);
                  }
                }}
              >
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
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
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
  });

  const clearFilters = () => {
    setLocalSearchTerm("");
    setStatusFilter(null);
    setTariffFilter(null);
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
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchUsers")}
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 grid-rows-2  items-center justify-around gap-4">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="">
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="Faol">{t("active")}</SelectItem>
              <SelectItem value="Nofaol">{t("inactive")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={tariffFilter || ""}
            onValueChange={(value) => setTariffFilter(value || null)}
          >
            <SelectTrigger className="max-w-[180px]">
              <SelectValue placeholder={t("filterByTarif")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="w-full p-2 text-xs gap-0"
            onClick={clearFilters}
            disabled={!localSearchTerm && !statusFilter && !tariffFilter}
          >
            <X className="mr-2 h-4 w-4 " />
            {t("clearFilters")}
          </Button>
        </div>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
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
        <div className="flex-1 text-sm text-muted-foreground">
          {t("showing")}{" "}
          {filteredData.length > 0 ? currentPage * pageSize + 1 : 0} -{" "}
          {Math.min((currentPage + 1) * pageSize, filteredData.length)}{" "}
          {t("of")} {filteredData.length}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(Math.ceil(filteredData.length / pageSize) - 1, prev + 1)
            )
          }
          disabled={(currentPage + 1) * pageSize >= filteredData.length}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
