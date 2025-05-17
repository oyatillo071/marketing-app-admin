"use client";

import { usePayments } from "@/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Download, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { exportToPDF } from "@/lib/pdf-export";
import { useLanguage } from "@/contexts/language-context";
// import CardsSection from "./Card/page.jsx";

export default function PaymentsPage() {
  const { t } = useLanguage();
  const { data: payments, isLoading } = usePayments();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = payments.filter(
    (payment) =>
      payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "user.name" },
      { header: t("amount"), accessor: "amount" },
      { header: t("status"), accessor: "status" },
      { header: t("date"), accessor: "date" },
    ];

    exportToPDF(payments, columns, t("payments"), "payments-export");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex md:items-center justify-between md:flex-row flex-col gap-4">
        <h2 className="md:text-3xl text-2xl whitespace-nowrap font-bold tracking-tight">
          {t("payments")}
        </h2>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t("downloadPDF")}
        </Button>
      </div>
      <div>
        <h3 className="text-lg font-medium">{t("allPayments")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("paymentsDescription")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPayments")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* <CardsSection /> */}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("id")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2 bg-red-500">
                          <AvatarFallback>
                            {payment.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        {payment.user.name}
                      </div>
                    </TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{payment.status}</Badge>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? t("noSearchResults") : t("noDataFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
