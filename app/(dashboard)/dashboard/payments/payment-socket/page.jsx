"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { Loader2, Clock } from "lucide-react";
import io from "socket.io-client";

const PAYMENT_STATUSES = {
  WAITING_CARD: "waiting_card",
  WAITING_SCREENSHOT: "waiting_screenshot",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
};

const REJECTION_REASONS = [
  "Karta bloklangan",
  "Noto'g'ri ma'lumot",
  "Skreenshot sifati past",
  "Vaqti o'tib ketgan",
  "Boshqa sabab",
];

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [coinAmount, setCoinAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://mlm-backend.pixl.uz/", {
      auth: { token: localStorage.getItem("token") },
    });

    newSocket.on("newPayment", (data) => {
      setPayments((prev) => [
        {
          ...data,
          status: PAYMENT_STATUSES.WAITING_CARD,
          timeLeft: 120,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    });

    newSocket.on("admin_screenshot", (data) => {
      setPayments((prev) =>
        prev.map((payment) =>
          payment.paymentId === data.paymentId
            ? {
                ...payment,
                screenshotUrl: data.screenshotUrl,
                status: PAYMENT_STATUSES.WAITING_SCREENSHOT,
              }
            : payment
        )
      );
    });

    // Timer for each payment
    const timer = setInterval(() => {
      setPayments((prev) =>
        prev.map((payment) => ({
          ...payment,
          timeLeft: Math.max(0, payment.timeLeft - 1),
        }))
      );
    }, 1000);

    setSocket(newSocket);

    return () => {
      clearInterval(timer);
      newSocket.disconnect();
    };
  }, []);

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleSendCard = () => {
    setIsSaving(true);

    const roomName = `room-${selectedPayment.userId}`;

    socket.emit("adminResponse", {
      roomName: roomName,
      cardNumber,
      paymentId: selectedPayment.paymentId,
    });

    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentId === selectedPayment.paymentId
          ? { ...payment, status: PAYMENT_STATUSES.WAITING_SCREENSHOT }
          : payment
      )
    );

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    setIsSaving(true);

    socket.emit("confirm_payment", {
      paymentId: selectedPayment.paymentId,
      confirmed: true,
      coinAmount,
    });

    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentId === selectedPayment.paymentId
          ? { ...payment, status: PAYMENT_STATUSES.CONFIRMED }
          : payment
      )
    );

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleReject = () => {
    setIsSaving(true);

    socket.emit("confirm_payment", {
      paymentId: selectedPayment.paymentId,
      confirmed: false,
      reason: rejectReason === "Boshqa sabab" ? customReason : rejectReason,
    });

    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentId === selectedPayment.paymentId
          ? { ...payment, status: PAYMENT_STATUSES.REJECTED }
          : payment
      )
    );

    setIsSaving(false);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t("paymentRequests")}</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("time")}</TableHead>
            <TableHead>{t("user")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("timeLeft")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments
            .sort((a, b) => (a.timeLeft < 30 ? -1 : 1))
            .map((payment) => (
              <TableRow
                key={payment.paymentId}
                className={`cursor-pointer ${
                  payment.timeLeft < 30 ? "bg-red-50" : ""
                }`}
                onClick={() => handlePaymentClick(payment)}
              >
                <TableCell>
                  {new Date(payment.createdAt).toLocaleTimeString()}
                </TableCell>
                <TableCell>{payment.userId}</TableCell>
                <TableCell>
                  {payment.howMuch} {payment.currencsy}
                </TableCell>
                <TableCell>
                  <Badge>{payment.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {Math.floor(payment.timeLeft / 60)}:
                    {String(payment.timeLeft % 60).padStart(2, "0")}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("paymentDetails")}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {selectedPayment?.status === PAYMENT_STATUSES.WAITING_CARD && (
              <div>
                <Label>{t("cardNumber")}</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                />
                <Button onClick={handleSendCard} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("sendCard")}
                </Button>
              </div>
            )}

            {selectedPayment?.status ===
              PAYMENT_STATUSES.WAITING_SCREENSHOT && (
              <div>
                <Label>{t("coinAmount")}</Label>
                <Input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(Number(e.target.value))}
                />
              </div>
            )}

            {selectedPayment?.status !== PAYMENT_STATUSES.WAITING_CARD && (
              <div className="col-span-2">
                <Label>{t("rejectReason")}</Label>
                <Select onValueChange={setRejectReason} value={rejectReason}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectReason")} />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECTION_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {rejectReason === "Boshqa sabab" && (
              <div className="col-span-2">
                <Label>{t("customReason")}</Label>
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            {selectedPayment?.screenshotUrl && (
              <div className="col-span-2">
                <img
                  src={selectedPayment.screenshotUrl}
                  alt="Screenshot"
                  className="max-w-full rounded-md"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("cancel")}
            </Button>
            {selectedPayment?.status !== PAYMENT_STATUSES.WAITING_CARD ? (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("reject")}
              </Button>
            ) : null}
            {selectedPayment?.status === PAYMENT_STATUSES.WAITING_SCREENSHOT ? (
              <Button onClick={handleConfirm} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("confirm")}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
