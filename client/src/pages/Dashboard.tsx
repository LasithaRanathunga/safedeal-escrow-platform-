import AppSidebar from "@/containers/AppSidebar";
import ContractTimeline from "@/containers/ContractTimeline";
import ContractStats from "@/containers/ContractStats";
import { Separator } from "@/components/ui/separator";
import { useLoaderData } from "react-router";

export default function Dashboard() {
  const contractData = useLoaderData() as any;

  console.log("Dashboard loader data:", contractData);

  const { milestones, ...contractStats } = contractData.contract;

  // const milestones = contractInfo.milestones;

  console.log("Loaded contract data:", contractStats, milestones);

  return (
    <div className="flex h-screen w-screen">
      <AppSidebar />
      <div className=" w-full overflow-y-auto p-8">
        <ContractStats contractStats={contractStats} />
        <Separator className="my-4" />
        <ContractTimeline milestones={milestones} />
      </div>
    </div>
  );
}
