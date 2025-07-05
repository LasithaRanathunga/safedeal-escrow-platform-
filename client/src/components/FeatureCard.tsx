import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function FeatureCard({
  children,
  feature,
  description,
}: {
  children: ReactNode;
  feature: string;
  description: string;
}) {
  return (
    <Card className="group border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardDecorator>{children}</CardDecorator>

        <h3 className="mt-6 text-xl font-semibold">{feature}</h3>
      </CardHeader>

      <CardContent>
        <p className="text-lg">{description}</p>
      </CardContent>
    </Card>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div
      aria-hidden
      className="bg-radial to-background absolute inset-0 from-transparent to-75%"
    />
    <div className="dark:bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t bg-white">
      {children}
    </div>
  </div>
);
