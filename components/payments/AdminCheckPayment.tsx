// Misol uchun: /components/payments/AdminCheckPayment.tsx

import { useCheckPayment } from "@/hooks/use-payments";

export function AdminCheckPayment({ paymentId }: { paymentId: string }) {
  const checkPayment = useCheckPayment();

  const handleApprove = () => {
    checkPayment.mutate({ id: paymentId, status: "CONFIRMED" });
  };

  const handleReject = (reason: string) => {
    checkPayment.mutate({ id: paymentId, status: "REJECTED", reason });
  };

  return (
    <div>
      <button onClick={handleApprove}>Tasdiqlash</button>
      <button onClick={() => handleReject("Noto'g'ri screenshot")}>
        Rad etish
      </button>
    </div>
  );
}
