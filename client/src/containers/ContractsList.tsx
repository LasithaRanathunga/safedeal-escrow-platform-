import { ArrowUpRightIcon, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import ContractsListItem from "./ContractsListItem";

import CreateContractDialog from "./CreateContractDialog";
import { useLoaderData } from "react-router";

function NoContracts() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ScrollText />
        </EmptyMedia>
        <EmptyTitle>No Contracts</EmptyTitle>
        <EmptyDescription>
          You haven’t created any contracts yet. Start by creating your first
          contract to manage your projects efficiently.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <CreateContractDialog />
        </div>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      ></Button>
    </Empty>
  );
}

// function Contracts({ contractsList }: { contractsList: any[] }) {}

export default function ContractsList() {
  const contractsList = useLoaderData() as any[];

  console.log("Contracts List Loader Data:", contractsList);

  return (
    <>
      {contractsList ? (
        contractsList.map((contract) => (
          <ContractsListItem key={contract.id} contract={contract} />
        ))
      ) : (
        <NoContracts />
      )}
    </>
  );
}
