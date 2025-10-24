import ContractStats from "./ContractStats";
import ContractTimeline from "./ContractTimeline";
import { Separator } from "@/components/ui/separator";
import { useLoaderData } from "react-router";

export default function Contract() {
  const contractData = useLoaderData() as any;

  const { milestones, ...contractStats } = contractData.contract;

  return (
    <>
      <ContractStats contractStats={contractStats} />
      <Separator className="my-4" />
      <ContractTimeline milestones={milestones} />
    </>
  );
}
