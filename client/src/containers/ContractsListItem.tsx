import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Pill, PillStatus } from "@/components/kibo-ui/pill";

function Badge({ title, value }: { title: string; value: string }) {
  return (
    <Pill className="bg-transparent text-sm">
      <PillStatus>{title}</PillStatus>
      {value}
    </Pill>
  );
}

export default function ContractsListItem({ contract }: { contract: any }) {
  const badgeList: { title: string; value: string }[] = [
    {
      title: "Amount",
      value: contract.amount ? `$ ${contract.amount.toLocaleString()}` : "N/A",
    },
    { title: "Deadline", value: contract.endDate || "N/A" },
    { title: "Role", value: contract.role },
  ];

  return (
    <Card className="mb-4 hover:shadow-lg hover:cursor-pointer  transition-shadow">
      <CardHeader>
        <CardTitle>{contract.title}</CardTitle>
        <CardDescription>{contract.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {badgeList.map((badge, index) => {
          return <Badge key={index} title={badge.title} value={badge.value} />;
        })}
      </CardContent>
    </Card>
  );
}
