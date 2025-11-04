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
import CreateMilestoneDialog from "./CreateMilestoneDialog";
import { useRevalidator } from "react-router";
import FileDownloadButton from "./FileDownloadButton";
import PaymentDialog from "./PaymentDialog";

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

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  if (diffMs < 0) return "In the future"; // safety check

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
}

function getItems(items: any[]) {
  return sortByOrder(items).map((item) => {
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
      previewDate: item.previewDate,
      finalDate: item.finalDate,
      isPayed: item.isPayed,
      amount: item.amount,
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
  role,
}: {
  milestones: any[];
  role: string;
}) {
  const [items, setItems] = useState(() => {
    return getItems(milestones);
  });

  const revalidator = useRevalidator();

  const updateItems = function (newItem: any, index: number) {
    const itemWithDaysRemaining = {
      ...newItem,
      daysRemaining: getDaysRemaining(newItem.deadline),
    };
    setItems((prevItems) =>
      insertToItems(prevItems, itemWithDaysRemaining, index)
    );
  };

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
              <p>
                <b>Amount</b>: {` $${item.amount}`}
              </p>
            </div>
            <div className="space-y-0">
              <div className="flex items-center">
                {role === "seller" ? (
                  <FileUploadDialog
                    label="Upload Preview"
                    itemId={item.id}
                    type="preview"
                    refreshOnUpload={() => revalidator.revalidate()}
                  />
                ) : (
                  <FileDownloadButton itemId={item.id} type="preview" />
                )}

                <p className="ml-2 font-semibold">
                  {item.previewDate
                    ? `Submitted ${getTimeAgo(item.previewDate)}`
                    : "Not Submitted Yet"}
                </p>
              </div>
              <br />
              <div className="flex items-center">
                {role === "seller" ? (
                  <FileUploadDialog
                    label="Upload Final"
                    itemId={item.id}
                    type="final"
                    refreshOnUpload={() => revalidator.revalidate()}
                  />
                ) : item.isPayed === "true" ? (
                  <FileDownloadButton itemId={item.id} type="final" />
                ) : (
                  <PaymentDialog item={item} label="Unlock" />
                )}

                <p className="ml-2 font-semibold">
                  {item.finalDate
                    ? `Submitted ${getTimeAgo(item.finalDate)}`
                    : "Not Submitted Yet"}
                </p>
              </div>
            </div>

            {/* <CommentSection /> */}
            <CreateMilestoneDialog updateItems={updateItems} order={item.id} />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
