import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

export function ZoomedImageDialog({ isOpen, onClose, imageUrl }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <div className="relative w-full h-[80vh]">
          <Image
            src={imageUrl || ""}
            alt="Zoomed Payment Image"
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
