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
import { useLoaderData, useRevalidator } from "react-router";

function NoContracts({ revalidater }: { revalidater: () => void }) {
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
          <CreateContractDialog fallback={revalidater} />
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
  const revalidator = useRevalidator();

  console.log("Contracts List Loader Data:", contractsList);

  function onCreateContract() {
    revalidator.revalidate();
  }

  return (
    <>
      {contractsList && contractsList.length > 0 ? (
        contractsList.map((contract) => (
          <ContractsListItem key={contract.id} contract={contract} />
        ))
      ) : (
        <NoContracts revalidater={onCreateContract} />
      )}
    </>
  );
}
