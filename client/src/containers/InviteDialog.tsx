import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PartnerSelector from "@/containers/PartnerSelector";
import { useRef } from "react";

export default function InviteDialog() {
  const selectedUserRef = useRef(null);

  const onSubmit = () => {
    console.log("Inviting user:", selectedUserRef.current);
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" size={"sm"}>
            Invite
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite to Contract</DialogTitle>
            <DialogDescription>
              Grant a partner access to this contract by sending them an
              invitation.
            </DialogDescription>
          </DialogHeader>
          <PartnerSelector selectedUserRef={selectedUserRef} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={onSubmit}>
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
