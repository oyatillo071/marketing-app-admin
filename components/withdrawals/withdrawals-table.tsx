// app/components/withdrawals-table.tsx

"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  X,
  CheckCircle,
  Trash2,
  Loader2,
  Clock,
  Filter,
  Search,
} from "lucide-react";
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
import { useLanguage } from "@/contexts/language-context";
import { processWithdrawalWithAdmin } from "@/lib/api";
import { useWithdrawals } from "@/hooks/use-withdrawals";

interface User {
  id: string;
  name: string;
  initials: string;
}

interface Withdrawal {
  id: string;
  user: User;
  amount: number;
  cardNumber: string;
  status: "Kutilmoqda" | "To'langan" | "Rad etilgan";
  date: string;
  reason?: string;
  processedBy?: User;
}

type StatusFilter = "all" | "Kutilmoqda" | "To'langan" | "Rad etilgan";

export function WithdrawalsTable() {
  const { t } = useLanguage();
  const {
    data: withdrawals,
    isLoading,
    processWithdrawal,
    rejectWithdrawal,
  } = useWithdrawals();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [filteredData, setFilteredData] = React.useState<Withdrawal[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [currentWithdrawal, setCurrentWithdrawal] =
    React.useState<Withdrawal | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 5;
  const [isApproveDialogOpen, setIsApproveDialogOpen] = React.useState(false);
  const [approveComment, setApproveComment] = React.useState("");
  const [currentApproveWithdrawal, setCurrentApproveWithdrawal] =
    React.useState<Withdrawal | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  // Get user from localStorage
  const getUserFromLocalStorage = React.useCallback((): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }, []);

  const user = React.useMemo(
    () => getUserFromLocalStorage(),
    [getUserFromLocalStorage]
  );

  // Filter data based on search term and status filter
  React.useEffect(() => {
    if (withdrawals) {
      let filtered = [...withdrawals];

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(searchLower) ||
            item.user.name.toLowerCase().includes(searchLower) ||
            item.cardNumber.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      setFilteredData(filtered);
      setCurrentPage(0); // Reset to first page when filters change
    }
  }, [withdrawals, searchTerm, statusFilter]);

  // Define table columns
  const columns: ColumnDef<Withdrawal>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          {t("id")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium"># {row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "user",
      header: t("name"),
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600">
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          {t("amount")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return (
          <div className="text-lg font-bold text-gray-800">{formatted}</div>
        );
      },
    },
    {
      accessorKey: "cardNumber",
      header: t("cardNumber"),
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-mono">
            **** **** ****{" "}
            {/* {row?.cardNumber || row.getValue("cardNumber").slice(-4)} */}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as Withdrawal["status"];

        const getStatusIcon = () => {
          switch (status) {
            case "To'langan":
              return <CheckCircle className="h-5 w-5" />;
            case "Rad etilgan":
              return <X className="h-5 w-5" />;
            default:
              return <Clock className="h-5 w-5" />;
          }
        };

        return (
          <div className="flex items-center">
            {getStatusIcon()}
            <Badge
              className={`ml-2 ${
                status === "To'langan"
                  ? "bg-green-500 hover:bg-green-600"
                  : status === "Kutilmoqda"
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: t("date"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="flex items-center">
            <span>{date.toLocaleDateString()}</span>
            <span className="ml-2 text-sm text-gray-500">
              {date.toLocaleTimeString()}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const withdrawal = row.original;
        const isProcessable = withdrawal.status === "Kutilmoqda";

        return (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors duration-200"
              onClick={() => {
                setCurrentWithdrawal(withdrawal);
                setIsDetailsDialogOpen(true);
              }}
            >
              <Eye className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">{t("view")}</span>
            </Button>

            {isProcessable && (
              <>
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                  onClick={() => {
                    setCurrentApproveWithdrawal(withdrawal);
                    setIsApproveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">{t("process")}</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="transition-colors duration-200"
                  onClick={() => {
                    setCurrentWithdrawal(withdrawal);
                    setIsRejectDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">{t("reject")}</span>
                </Button>
              </>
            )}
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
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
  });

  // Handle rejection of withdrawal
  const handleRejectSubmit = async () => {
    if (currentWithdrawal && rejectReason && user) {
      setProcessingId(currentWithdrawal.id);
      try {
        await rejectWithdrawal(currentWithdrawal.id, rejectReason);
        setIsRejectDialogOpen(false);
        setRejectReason("");
      } catch (error) {
        console.error("Failed to reject withdrawal:", error);
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Handle approval of withdrawal
  const handleApproveSubmit = async () => {
    if (currentApproveWithdrawal && user) {
      setProcessingId(currentApproveWithdrawal.id);
      try {
        await processWithdrawalWithAdmin(
          currentApproveWithdrawal.id,
          user.id,
          approveComment
        );
        setIsApproveDialogOpen(false);
        setApproveComment("");
      } catch (error) {
        console.error("Failed to approve withdrawal:", error);
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        <div className="rounded-xl border overflow-hidden shadow-md">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 w-full sm:w-1/2 rounded-lg" />
              <div className="flex gap-2 w-full sm:w-auto">
                <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4 animate-pulse"
              >
                <div className="md:col-span-2 flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
                <div className="md:col-span-2 flex items-center justify-end md:justify-start">
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center p-4">
          <Skeleton className="h-8 w-32 rounded" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filters Section */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder={t("searchWithdrawals")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-shadow duration-200"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full lg:w-auto rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-shadow duration-200">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder={t("filterByStatus")} />
              </div>
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
            disabled={!searchTerm && statusFilter === "all"}
            className="rounded-lg border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t("clearFilters")}</span>
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
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
                    className="h-24 text-center text-gray-500"
                  >
                    {t("noDataFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {filteredData.length > 0 ? (
          filteredData
            .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
            .map((withdrawal) => {
              const isProcessable = withdrawal.status === "Kutilmoqda";
              return (
                <div
                  key={withdrawal.id}
                  className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3 bg-gradient-to-r from-blue-500 to-purple-600">
                        <AvatarFallback>
                          {withdrawal.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-lg">
                          {withdrawal.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {withdrawal.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        className={`${
                          withdrawal.status === "To'langan"
                            ? "bg-green-500 hover:bg-green-600"
                            : withdrawal.status === "Kutilmoqda"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {withdrawal.status === "To'langan" && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {withdrawal.status === "Kutilmoqda" && (
                          <Clock className="h-4 w-4" />
                        )}
                        {withdrawal.status === "Rad etilgan" && (
                          <X className="h-4 w-4" />
                        )}
                        <span className="ml-1">{withdrawal.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 mb-5">
                    <div>
                      <span className="text-sm text-gray-500">
                        {t("amount")}:
                      </span>
                      <div className="font-bold">
                        ${withdrawal.amount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        {t("cardNumber")}:
                      </span>
                      <div className="font-mono">
                        **** **** **** {withdrawal.cardNumber.slice(-4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        {t("date")}:
                      </span>
                      <div>{new Date(withdrawal.date).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => {
                        setCurrentWithdrawal(withdrawal);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("viewDetails")}
                    </Button>

                    {isProcessable && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                          onClick={() => {
                            setCurrentApproveWithdrawal(withdrawal);
                            setIsApproveDialogOpen(true);
                          }}
                        >
                          {processingId === withdrawal.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("processing")}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t("process")}
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full transition-colors duration-200"
                          onClick={() => {
                            setCurrentWithdrawal(withdrawal);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("reject")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {t("noResultsFound")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("tryAdjustingYourSearchOrFilterToFindWhatYoureLookingFor")}
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={clearFilters}>
                {t("clearFilters")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
        <div className="text-sm text-gray-500">
          {t("showing")}{" "}
          {filteredData.length > 0 ? currentPage * pageSize + 1 : 0} -{" "}
          {Math.min((currentPage + 1) * pageSize, filteredData.length)}{" "}
          {t("of")} {filteredData.length}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || filteredData.length === 0}
            className="rounded-lg border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  Math.ceil(filteredData.length / pageSize) - 1,
                  prev + 1
                )
              )
            }
            disabled={
              (currentPage + 1) * pageSize >= filteredData.length ||
              filteredData.length === 0
            }
            className="rounded-lg border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            {t("next")}
          </Button>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("rejectWithdrawal")}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
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
                className="col-span-3 rounded-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 min-h-[100px]"
                placeholder={t("enterRejectionReason")}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-100 transition-colors duration-200"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason || !user}
              className={`rounded-lg transition-colors duration-200 ${
                !rejectReason || !user ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {processingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("rejecting")}
                </>
              ) : (
                t("reject")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("withdrawalDetails")}
            </DialogTitle>
          </DialogHeader>
          {currentWithdrawal && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label={t("id")}
                  value={`#${currentWithdrawal.id}`}
                />
                <DetailItem
                  label={t("user")}
                  value={currentWithdrawal.user.name}
                />
                <DetailItem
                  label={t("amount")}
                  value={
                    <span className="font-bold text-lg">
                      ${currentWithdrawal.amount.toFixed(2)}
                    </span>
                  }
                />
                <DetailItem
                  label={t("cardNumber")}
                  value={`**** **** **** ${currentWithdrawal.cardNumber.slice(
                    -4
                  )}`}
                />
                <DetailItem
                  label={t("status")}
                  value={
                    <Badge
                      className={`${
                        currentWithdrawal.status === "To'langan"
                          ? "bg-green-500 hover:bg-green-600"
                          : currentWithdrawal.status === "Kutilmoqda"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {currentWithdrawal.status}
                    </Badge>
                  }
                />
                <DetailItem
                  label={t("date")}
                  value={new Date(currentWithdrawal.date).toLocaleString()}
                />
                {currentWithdrawal.status === "Rad etilgan" &&
                  currentWithdrawal.reason && (
                    <>
                      <DetailItem
                        label={t("rejectionReason")}
                        value={currentWithdrawal.reason}
                        isLast={true}
                      />
                    </>
                  )}
              </div>

              {currentWithdrawal.status === "To'langan" &&
                currentWithdrawal.processedBy && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-700 mb-2">
                      {t("processedBy")}
                    </h4>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3 bg-gradient-to-r from-blue-500 to-purple-600">
                        <AvatarFallback>
                          {currentWithdrawal.processedBy.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {currentWithdrawal.processedBy.name}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-100 transition-colors duration-200"
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("approveWithdrawal")}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {t("approveWithdrawalDescription") ||
                "Confirm approval and optionally add a comment."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="approveComment" className="text-right">
                {t("comment")}
              </Label>
              <Textarea
                id="approveComment"
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="col-span-3 rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 min-h-[100px]"
                placeholder={t("enterApproveComment")}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t("approvedBy")}</Label>
              <div className="col-span-3 font-semibold flex items-center">
                <Avatar className="h-6 w-6 mr-2 bg-gradient-to-r from-blue-500 to-purple-600">
                  <AvatarFallback>{user?.initials}</AvatarFallback>
                </Avatar>
                {user?.name}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-100 transition-colors duration-200"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="default"
              onClick={handleApproveSubmit}
              disabled={processingId !== null || !user}
              className={`rounded-lg transition-colors duration-200 ${
                processingId !== null || !user
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {processingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("approving")}
                </>
              ) : (
                t("approve")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for displaying detail items in the dialog
function DetailItem({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`col-span-2 ${isLast ? "sm:col-span-2" : "sm:col-span-1"}`}>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
