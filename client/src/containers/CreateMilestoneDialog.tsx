import { CirclePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DatePicker } from "./DatePicker";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ApiError from "@/fetch/ApiError";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import { useState } from "react";

const milestoneSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  amount: z.coerce
    .number<number>("Amount is required.")
    .min(1, { message: "Amount must be greater than 0." }),
  deadline: z.date("Deadline is required."),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

export default function CreateMilestoneDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function createMilestone(data: MilestoneFormValues, token: string) {
    console.log("Creating milestone with data:", data);

    const payload = { ...data, contractId: 1, order: 1 };

    const response = await fetch(
      "http://localhost:3000/contract/createMilestone",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new ApiError(
        errorBody.message || "Failed to create milestone",
        errorBody.code || "API_ERROR"
      );
    }

    const result = await response.json();

    return result;
  }

  async function onSubmit(data: MilestoneFormValues) {
    console.log("Form submitted:", data);

    await handleAcessToken(createMilestone.bind(null, data));

    setOpen(false);
    form.reset();
    console.log("reset called");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center mt-6 w-full group cursor-pointer">
          {/* <Button>Create Contract</Button> */}
          <div className="h-0.5 flex-grow bg-ring group-hover:bg-primary rounded-l-full transition-colors"></div>
          <CirclePlus className="group-hover:text-primary text-ring -ml-0.5 -mr-0.5 transition-colors" />
          <div className="h-0.5 flex-grow bg-ring group-hover:bg-primary rounded-r-full transition-colors"></div>
        </div>
      </DialogTrigger>

      <DialogContent
        className="overflow-auto p-6 flex flex-col  gap-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5"
        aria-describedby={undefined}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Create New Milestone
            </DialogTitle>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., “Website Redesign”"
                  {...form.register("title")}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief project overview (Optional)"
                  className="selection:bg-primary selection:text-primary-foreground focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]"
                  {...form.register("description")}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., “200”"
                  {...form.register("amount")}
                />
              </div>

              <div className="grid gap-3">
                <Label>Deadline</Label>
                <Controller
                  control={form.control}
                  name="deadline"
                  rules={{ required: "Deadline is required" }}
                  render={({ field }) => (
                    <DatePicker
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
              </div>
            </div>

            <div className="overflow-y-auto">
              <DialogFooter className="py-6 sm:justify-start">
                <Button type="submit" className="cursor:pointer">
                  Create
                </Button>
              </DialogFooter>
            </div>
          </DialogHeader>
        </form>
      </DialogContent>
    </Dialog>
  );
}
