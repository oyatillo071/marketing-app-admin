// Misol uchun: /components/payments/UploadScreenshot.tsx

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://mlm-backend.pixl.uz");

export function UploadScreenshot({
  paymentId,
  userId,
}: {
  paymentId: string;
  userId: string;
}) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("upload_screenshot", {
          paymentId,
          userId,
          screenshot: reader.result, // base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        Yuklash
      </button>
    </div>
  );
}
