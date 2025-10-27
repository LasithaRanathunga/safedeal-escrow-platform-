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

export default function FileUploadDialog({
  label,
  itemId,
  type,
}: {
  label: string;
  itemId: number;
  type: "preview" | "final";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild className="my-1">
        <Button size={"sm"} variant="outline">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <FileUpload itemId={itemId} type={type} />
      </DialogContent>
    </Dialog>
  );
}
