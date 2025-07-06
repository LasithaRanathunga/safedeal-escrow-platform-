import { Milestone, Link as LinkIcon, FolderClock } from "lucide-react";

import FeatureCard from "@/components/FeatureCard";

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Secure, Simple, and Flexible
          </h2>
          <p className="mt-4">
            Set clear expectations, break down tasks, and protect both sides —
            no matter what you're working on.
          </p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 dark:[--color-muted:var(--color-zinc-900)]">
          <FeatureCard
            feature="Milestone Tracking"
            description="Break work into steps with progress updates and previews"
          >
            <Milestone className="size-8" aria-hidden />
          </FeatureCard>

          <FeatureCard
            feature="Smart Invite Links"
            description="Invite registered or new users to contracts with one link"
          >
            <LinkIcon className="size-8" aria-hidden />
          </FeatureCard>

          <FeatureCard
            feature="Preview & Final Files"
            description="Show progress with previews and lock final deliverables until payment"
          >
            <FolderClock className="size-8" aria-hidden />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
