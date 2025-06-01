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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, EyeIcon, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { exportToPDF } from "@/lib/pdf-export";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import Image from "next/image";
import { ZoomedImageDialog } from "@/components/ZoomedImageDialog";

export default function PaymentsPage() {
  const { t } = useLanguage();
  const { data: payments = [], isLoading } = usePayments();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payment.id).toLowerCase().includes(searchTerm.toLowerCase())
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

  const openDetailsDialog = (payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex md:items-center justify-between md:flex-row flex-col gap-4">
        <h2 className="md:text-3xl text-2xl whitespace-nowrap font-bold tracking-tight">
          {t("payments")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t("downloadPDF")}
          </Button>
          <Link href="/dashboard/payments/card">
            <Button variant="default" size="sm">
              {t("cards")}
            </Button>
          </Link>
        </div>
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
                <TableHead>{t("currency")}</TableHead>
                <TableHead>{t("coin")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
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
                            {payment.user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {payment.user?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof payment.how_much === "number"
                        ? `${payment.how_much.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>{payment.currency || "-"}</TableCell>
                    <TableCell>{payment.coin || "-"}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{payment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {payment.to_send_date
                        ? new Date(payment.to_send_date).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsDialog(payment)}
                      >
                        <EyeIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {searchTerm ? t("noSearchResults") : t("noDataFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Zoomed Image Dialog */}
      <ZoomedImageDialog
        isOpen={!!zoomedImage}
        onClose={() => setZoomedImage(null)}
        imageUrl={zoomedImage}
      />

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("paymentDetails")}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="relative h-48 w-full mb-4">
                {selectedPayment.photo_url ? (
                  <Image
                    src={selectedPayment.photo_url}
                    alt="payment img"
                    fill
                    onClick={() => setZoomedImage(selectedPayment.photo_url)}
                    className="object-cover cursor-pointer"
                  />
                ) : (
                  <Image
                    src={"/default-img.jpg"}
                    alt="default img"
                    fill
                    onClick={() => setZoomedImage("/default-img.jpg")}
                    className="object-cover cursor-pointer"
                  />
                )}
              </div>
              <p>
                <strong>{t("id")}:</strong> {selectedPayment.id}
              </p>
              <p>
                <strong>{t("name")}:</strong>{" "}
                {selectedPayment.user?.name || "-"}
              </p>
              <p>
                <strong>{t("email")}:</strong>{" "}
                {selectedPayment.user?.email || "-"}
              </p>
              <p>
                <strong>{t("amount")}:</strong>{" "}
                {typeof selectedPayment.how_much === "number"
                  ? `${selectedPayment.how_much.toFixed(2)}`
                  : "-"}
              </p>
              <p>
                <strong>{t("currency")}:</strong>{" "}
                {selectedPayment.currency || "-"}
              </p>
              <p>
                <strong>{t("coin")}:</strong> {selectedPayment.coin || "-"}
              </p>
              <p>
                <strong>{t("card")}:</strong> {selectedPayment.card || "-"}
              </p>
              <p>
                <strong>{t("status")}:</strong> {selectedPayment.status}
              </p>
              <p>
                <strong>{t("date")}:</strong>{" "}
                {selectedPayment.to_send_date
                  ? new Date(selectedPayment.to_send_date).toLocaleString()
                  : "-"}
              </p>
              <div>
                <strong>{t("userHistory")}:</strong>
                <ul className="list-disc ml-5">
                  <li>
                    {t("role")}: {selectedPayment.user?.role || "-"}
                  </li>
                  <li>
                    {t("createdAt")}:{" "}
                    {selectedPayment.user?.createdAt
                      ? new Date(
                          selectedPayment.user.createdAt
                        ).toLocaleString()
                      : "-"}
                  </li>
                  <li>
                    {t("isActive")}:{" "}
                    {selectedPayment.user?.isActive ? t("yes") : t("no")}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
