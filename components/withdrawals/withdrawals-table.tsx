"use client";

import { useState, useEffect } from "react";
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
import { ArrowUpDown, Eye, MoreHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useWithdrawals } from "@/hooks/use-withdrawals";
import { useLanguage } from "@/contexts/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WithdrawalsTable() {
  const { t } = useLanguage();
  const {
    data: withdrawals,
    isLoading,
    processWithdrawal,
    rejectWithdrawal,
  } = useWithdrawals();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentWithdrawal, setCurrentWithdrawal] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // FIX: Added dependencies to the useEffect to prevent infinite re-renders
  useEffect(() => {
    if (withdrawals) {
      let filtered = [...withdrawals];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      setFilteredData(filtered);
    }
  }, [withdrawals, searchTerm, statusFilter]); // Added all dependencies

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
      accessorKey: "user",
      header: t("name"),
      cell: ({ row }) => {
        const user = row.original.user;
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
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("amount")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div>{formatted}</div>;
      },
    },
    {
      accessorKey: "cardNumber",
      header: t("cardNumber"),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={
              status === "To'langan"
                ? "bg-green-500"
                : status === "Kutilmoqda"
                ? "bg-gray-500"
                : "bg-red-500"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: t("date"),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const withdrawal = row.original;
        const isProcessable = withdrawal.status === "Kutilmoqda";

        return (
          <div className="flex items-center">
            {isProcessable && (
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 mr-2"
                onClick={() => processWithdrawal(withdrawal.id)}
              >
                {t("process")}
              </Button>
            )}
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
                    setCurrentWithdrawal(withdrawal);
                    setIsDetailsDialogOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("view")}
                </DropdownMenuItem>
                {isProcessable && (
                  <>
                    <DropdownMenuItem
                      onClick={() => processWithdrawal(withdrawal.id)}
                    >
                      {t("process")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => {
                        setCurrentWithdrawal(withdrawal);
                        setIsRejectDialogOpen(true);
                      }}
                    >
                      {t("reject")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

  const handleRejectSubmit = () => {
    if (currentWithdrawal && rejectReason) {
      rejectWithdrawal(currentWithdrawal.id, rejectReason);
      setIsRejectDialogOpen(false);
      setRejectReason("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
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

  // Fixed: Responsive design for the table on mobile devices
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchWithdrawals")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter === null ? "all" : statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="Kutilmoqda">{t("pending")}</SelectItem>
              <SelectItem value="To'langan">{t("processed")}</SelectItem>
              <SelectItem value="Rad etilgan">{t("rejected")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!searchTerm && !statusFilter}
          >
            <X className="mr-2 h-4 w-4" />
            {t("clearFilters")}
          </Button>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
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
      </div>

      {/* Mobile card view */}
      <div className="block lg:hidden space-y-4">
        {filteredData.length > 0 ? (
          filteredData
            .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
            .map((withdrawal) => {
              const isProcessable = withdrawal.status === "Kutilmoqda";
              return (
                <div
                  key={withdrawal.id}
                  className="bg-white p-4 rounded-md border"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2 bg-red-500">
                        <AvatarFallback>
                          {withdrawal.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {withdrawal.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {withdrawal.id}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        withdrawal.status === "To'langan"
                          ? "bg-green-500"
                          : withdrawal.status === "Kutilmoqda"
                          ? "bg-gray-500"
                          : "bg-red-500"
                      }
                    >
                      {withdrawal.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">{t("amount")}:</span>{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(withdrawal.amount)}
                    </div>
                    <div>
                      <span className="text-gray-500">{t("date")}:</span>{" "}
                      {withdrawal.date}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">{t("cardNumber")}:</span>{" "}
                      {withdrawal.cardNumber}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentWithdrawal(withdrawal);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("view")}
                    </Button>
                    {isProcessable && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => processWithdrawal(withdrawal.id)}
                        >
                          {t("process")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setCurrentWithdrawal(withdrawal);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          {t("reject")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-8">{t("noDataFound")}</div>
        )}
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

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectWithdrawal")}</DialogTitle>
            <DialogDescription>
              {t("rejectWithdrawalDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                {t("reason")}
              </Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="col-span-3"
                placeholder={t("enterRejectionReason")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason}
            >
              {t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("withdrawalDetails")}</DialogTitle>
          </DialogHeader>
          {currentWithdrawal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">{t("id")}</div>
                <div>{currentWithdrawal.id}</div>
                <div className="font-medium">{t("user")}</div>
                <div>{currentWithdrawal.user.name}</div>
                <div className="font-medium">{t("amount")}</div>
                <div>${currentWithdrawal.amount.toFixed(2)}</div>
                <div className="font-medium">{t("cardNumber")}</div>
                <div>{currentWithdrawal.cardNumber}</div>
                <div className="font-medium">{t("status")}</div>
                <div>
                  <Badge
                    className={
                      currentWithdrawal.status === "To'langan"
                        ? "bg-green-500"
                        : currentWithdrawal.status === "Kutilmoqda"
                        ? "bg-gray-500"
                        : "bg-red-500"
                    }
                  >
                    {currentWithdrawal.status}
                  </Badge>
                </div>
                <div className="font-medium">{t("date")}</div>
                <div>{currentWithdrawal.date}</div>
                {currentWithdrawal.status === "Rad etilgan" &&
                  currentWithdrawal.reason && (
                    <>
                      <div className="font-medium">{t("rejectionReason")}</div>
                      <div>{currentWithdrawal.reason}</div>
                    </>
                  )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
