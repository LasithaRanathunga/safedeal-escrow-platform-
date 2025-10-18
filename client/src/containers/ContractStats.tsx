import { AnimatedBackground } from "@/components/ui/animated-background";
import { Description } from "@radix-ui/react-dialog";

type ConstractStatsProps = {
  title: string;
  description: string;
  amount: number;
  endDate: string;
  status: string;
  role: "buyer" | "seller";
};
export default function ContractStats({
  contractStats,
}: {
  contractStats: ConstractStatsProps;
}) {
  const ITEMS = [
    {
      id: 1,
      title: "Contract",
      description: contractStats.title,
    },
    {
      id: 2,
      title: contractStats.role === "seller" ? "Buyer" : "Seller",
      description: "Jane S.",
    },
    {
      id: 3,
      title: "Total Value",
      description: `${
        contractStats.amount
          ? "$ " + contractStats.amount.toLocaleString()
          : "N/A "
      }`,
    },
    {
      id: 4,
      title: "Deadline",
      description: contractStats.endDate
        ? new Date(contractStats.endDate).toLocaleDateString()
        : "N/A",
    },
    {
      id: 5,
      title: "Status",
      description: contractStats.status,
    },
  ];

  return (
    <div className="grid grid-cols-2  md:grid-cols-5">
      <AnimatedBackground
        className="rounded-lg bg-zinc-100 dark:bg-zinc-800"
        transition={{
          type: "spring",
          bounce: 0.2,
          duration: 0.6,
        }}
        enableHover
      >
        {ITEMS.map((item, index) => (
          <div key={index} data-id={`card-${index}`}>
            <div className="flex select-none flex-col space-y-1 p-4">
              <h3 className="text-base font-medium text-zinc-800 dark:text-zinc-50">
                {item.title}
              </h3>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </AnimatedBackground>
    </div>
  );
}
