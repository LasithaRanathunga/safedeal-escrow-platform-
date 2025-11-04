import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Payment from "./Payment";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PaymentDialog({
  label,
  item,
}: {
  label: string;
  item: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="my-1">
        <Button size={"sm"} variant="outline">
          {`Pay`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>
        <Payment item={item} />
      </DialogContent>
    </Dialog>
  );
}
