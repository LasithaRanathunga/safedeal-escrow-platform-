import {
  FilePen,
  Link,
  WavesLadder,
  MessageCircleMore,
  CircleDollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
  title: string;
  summary: string;
  description: string;
  Icon: LucideIcon;
};

const steps: Step[] = [
  {
    title: " Create a Contract",
    summary: "Define the work, participants, and structure.",
    description:
      "Set up a new contract by giving it a name and breaking the work into clear milestones. Add the buyer and seller by searching for them or sending a magic invite link. Assign who’s doing the work, who’s paying, and what each step will involve.",
    Icon: FilePen,
  },
  {
    title: " Invite the Other Party",
    summary: "Use a smart link — no account needed upfront.",
    description:
      "Send a unique link to the other person. If they already have an account, they can join instantly. If not, they’ll be asked to sign up — and they’ll be automatically added to the contract. It’s fast, smooth, and designed for trust.",
    Icon: Link,
  },
  {
    title: " Add Milestones and Files",
    summary: "Set goals, deadlines, and deliverables.",
    description:
      "Break the project into multiple milestones like “Wireframes,” “Prototype,” or “Final Design.” Each milestone can include a deadline, an optional payment amount, a preview version that’s always visible, and a locked final deliverable that gets unlocked after payment. Buyers can view the preview, leave comments, and approve changes before the final files are released",
    Icon: WavesLadder,
  },
  {
    title: " Communicate and Collaborate",
    summary: "Built-in chat and feedback threads.",
    description:
      "Each contract has its own chat so both parties can discuss progress easily. Under each milestone, buyers and sellers can leave comments — just like a YouTube thread — for feedback, clarification, or approvals.",
    Icon: MessageCircleMore,
  },
  {
    title: " Finalize the Work Securely",
    summary: "Complete the milestone and release payment with confidence.",
    description:
      "When a milestone is complete, the buyer reviews the preview, approves the work, and releases payment if required. The seller’s final deliverables are unlocked automatically. This way, the buyer receives exactly what they expect, and the seller gets fairly paid — a smooth, protected experience for both.",
    Icon: CircleDollarSign,
  },
];

export default function HowItWorks() {
  return (
    <div
      id="how-it-works"
      className="max-w-screen-lg mx-auto py-12 md:py-20 px-6"
    >
      <div className="text-center mb-24">
        <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
          Secure, Simple, and Flexible
        </h2>
        <p className="mt-4">
          Set clear expectations, break down tasks, and protect both sides — no
          matter what you're working on.
        </p>
      </div>
      <div className="relative ml-3">
        {/* Timeline line */}
        <div className="absolute left-0 top-4 bottom-0 border-l-2 border-primary" />

        {steps.map(({ summary, description, title, Icon }, index) => (
          <div key={index} className="relative pl-8 pb-16 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute h-3 w-3 -translate-x-1/2 left-px top-3 rounded-full border-2 border-primary bg-background" />

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 h-9 w-9 bg-accent rounded-full flex items-center justify-center">
                  <Icon className="h-8 w-8 p-1 text-muted-foreground" />
                </div>
                <h3 className="text-base md:text-2xl font-semibold">{title}</h3>
              </div>
              <div>
                <p className="md:text-xl font-medium mb-4">{summary}</p>
              </div>
              <p className="text-sm md:text-lg text-muted-foreground">
                {description}
              </p>
              <div className="flex flex-wrap gap-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
