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

export default function FileUploadDialog({ label }: { label: string }) {
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
        <FileUpload />
      </DialogContent>
    </Dialog>
  );
}
