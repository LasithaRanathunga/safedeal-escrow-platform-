import { CheckIcon } from "lucide-react";

import { useState } from "react";

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

import FileUploadDialog from "./FileUploadDialog";
import CommentSection from "./CommentSection";
import CreateMilestoneDialog from "./createMilestoneDialog";
import { set } from "zod";

function sortByOrder(arr: any[]) {
  return [...arr].sort((a, b) => a.order - b.order);
}

function getDaysRemaining(deadlineDate: string): string {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diff = deadline.getTime() - now.getTime();

  if (diff < 0) {
    // Deadline has already passed
    const daysPassed = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));
    return `Deadline passed ${daysPassed} day${
      daysPassed !== 1 ? "s" : ""
    } ago`;
  }

  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`;
}

function getItems(items: any[]) {
  return sortByOrder(items).map((item, index) => {
    console.log("Processing milestone item:", item);
    return {
      id: item.order,
      date: new Date(item.createdAt).toLocaleDateString("en-GB", {
        year: "numeric", // "2025"
        month: "long", // "October"
        day: "numeric", // "15"
      }),
      deadline: new Date(item.deadline).toLocaleDateString("en-GB", {
        year: "numeric", // "2025"
        month: "long", // "October"
        day: "numeric", // "15"
      }),
      title: item.title,
      description: item.description,
      daysRemaining: getDaysRemaining(item.deadline),
    };
  });
}

function insertToItems(items: any[], newItem: any, index: number) {
  const left = items.slice(0, index);
  const right = items.slice(index);

  console.log(left, right);

  const updatedRight = right.map((item) => {
    return { ...item, id: item.id + 1 };
  });

  return [...left, newItem, ...updatedRight];
}

export default function ContractTimeline({
  milestones,
}: {
  milestones: any[];
}) {
  const [items, setItems] = useState(() => {
    return getItems(milestones);
  });

  const updateItems = function (newItem: any, index: number) {
    const itemWithDaysRemaining = {
      ...newItem,
      daysRemaining: getDaysRemaining(newItem.deadline),
    };
    setItems((prevItems) =>
      insertToItems(prevItems, itemWithDaysRemaining, index)
    );
  };

  // const items = [
  //   {
  //     id: 1,
  //     date: "Mar 15, 2024",
  //     title: "Project Kickoff",
  //     description:
  //       "Initial team meeting and project scope definition. Established key milestones and resource allocation.",
  //   },
  //   {
  //     id: 2,
  //     date: "Mar 22, 2024",
  //     title: "Design Phase",
  //     description:
  //       "Completed wireframes and user interface mockups. Stakeholder review and feedback incorporated.",
  //   },
  //   {
  //     id: 3,
  //     date: "Apr 5, 2024",
  //     title: "Development Sprint",
  //     description:
  //       "Backend API implementation and frontend component development in progress.",
  //   },
  //   {
  //     id: 4,
  //     date: "Apr 19, 2024",
  //     title: "Testing & Deployment",
  //     description:
  //       "Quality assurance testing, performance optimization, and production deployment preparation.",
  //   },
  // ];

  console.log("Milestones in ContractTimeline:", milestones);

  return (
    <Timeline defaultValue={2}>
      <CreateMilestoneDialog updateItems={updateItems} order={0} />
      {items.map((item) => (
        <TimelineItem
          key={item.id}
          step={item.id}
          className="group-data-[orientation=vertical]/timeline:ms-10"
        >
          <TimelineHeader>
            <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
            <TimelineDate>{item.date}</TimelineDate>
            <TimelineTitle>{item.title}</TimelineTitle>
            <TimelineIndicator className="group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center group-data-completed/timeline-item:border-none group-data-[orientation=vertical]/timeline:-left-7">
              <CheckIcon
                className="group-not-data-completed/timeline-item:hidden"
                size={16}
              />
            </TimelineIndicator>
          </TimelineHeader>
          <TimelineContent>
            <div className="space-y-2 my-3">
              <p>{item.description}</p>
              <p>
                <b>Deadline</b>: {item.deadline}
              </p>
              <p>
                <b>Time Remaining</b>: {item.daysRemaining}
              </p>
            </div>
            <FileUploadDialog label="Upload Preview" />
            <br />
            <FileUploadDialog label="Upload Final" />

            <CommentSection />
            <CreateMilestoneDialog updateItems={updateItems} order={item.id} />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
