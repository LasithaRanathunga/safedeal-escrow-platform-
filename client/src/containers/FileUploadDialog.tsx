import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import FileUpload from "./FileUpload";
import { useState } from "react";

export default function FileUploadDialog({
  label,
  itemId,
  type,
  refreshOnUpload,
}: {
  label: string;
  itemId: number;
  type: "preview" | "final";
  refreshOnUpload: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="my-1">
        <Button size={"sm"} variant="outline">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <FileUpload
          itemId={itemId}
          type={type}
          onUploadSuccess={() => {
            setOpen(false);
            refreshOnUpload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
