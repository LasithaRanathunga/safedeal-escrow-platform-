import { AnimatedBackground } from "@/components/ui/animated-background";

export default function ContractStats() {
  const ITEMS = [
    {
      id: 1,
      title: "Contract",
      description: "Website Redesign project",
    },
    {
      id: 2,
      title: "Seller",
      description: "Jane S.",
    },
    {
      id: 3,
      title: "Total Value",
      description: "$2000",
    },
    {
      id: 4,
      title: "Deadline",
      description: "30 Oct 2025",
    },
    {
      id: 5,
      title: "Status",
      description: "Active",
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
