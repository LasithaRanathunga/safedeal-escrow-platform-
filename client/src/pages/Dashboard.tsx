import AppSidebar from "@/containers/AppSidebar";
import ContractTimeline from "@/containers/ContractTimeline";
import ContractStats from "@/containers/ContractStats";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
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
