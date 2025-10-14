import AppSidebar from "@/containers/AppSidebar";
import ContractTimeline from "@/containers/ContractTimeline";
import ContractStats from "@/containers/ContractStats";
import { Separator } from "@/components/ui/separator";
import { useLoaderData } from "react-router";

export default function Dashboard() {
  // const { contractId } = useParams<{ contractId: string }>();

  const contractData = useLoaderData() as any;
  console.log("Loaded contract data:", contractData);

  return (
    <div className="flex h-screen w-screen">
      <AppSidebar />
      <div className=" w-full overflow-y-auto p-8">
        <ContractStats />
        <Separator className="my-4" />
        <ContractTimeline />
      </div>
    </div>
  );
}
