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
import { handleAcessToken } from "@/fetch/fetchWrapper";
import { useParams, useRevalidator } from "react-router";

export default function InviteDialog() {
  const selectedUserRef = useRef(null);
  const { contractId } = useParams();
  const revalidator = useRevalidator();

  async function invitePartner(accesstoken: string) {
    const response = await fetch(
      "http://localhost:3000/contract/invitePartner",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify({
          contractId: contractId,
          partnerEmail: selectedUserRef.current.email,
        }),
      }
    );

    return response;
  }

  const onSubmit = async () => {
    console.log("Contract ID:", contractId);
    console.log("Inviting user:", selectedUserRef.current);
    await handleAcessToken(invitePartner);

    revalidator.revalidate();
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
