import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { useNavigate } from "react-router";

const contractSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  role: z.enum(["buyer", "seller"], {
    error: (issue) => (issue.input === undefined ? "Required" : "Invalid date"),
  }),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function CreateContractDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: "",
      description: "",
      role: undefined,
    },
  });

  async function createContract(data: ContractFormValues, token: string) {
    const response = await fetch("http://localhost:3000/contract/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Send token in Authorization header
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new ApiError(
        errorBody.message || "Failed to create contract",
        errorBody.code || "API_ERROR"
      );
    }

    const result = await response.json();

    return result;
  }

  async function onSubmit(data: ContractFormValues) {
    console.log("Form submitted:", data);

    await handleAcessToken(createContract.bind(null, data), () => {
      navigate("/log-in");
    });

    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Contract</Button>
      </DialogTrigger>

      <DialogContent
        className="overflow-auto p-6 flex flex-col  gap-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5"
        aria-describedby={undefined}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Create New Contract
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

              {/* <div className="grid gap-3">
                <Label>Deadline</Label>
                <DatePicker />
              </div> */}

              <div className="grid gap-3">
                <Label htmlFor="role">Select Your Role</Label>

                <Controller
                  name="role"
                  control={form.control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => {
                    return (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Your Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </div>
            </div>

            <div className="overflow-y-auto">
              <DialogFooter className="py-6 sm:justify-start">
                <Button type="submit">Create</Button>
              </DialogFooter>
            </div>
          </DialogHeader>
        </form>
      </DialogContent>
    </Dialog>
  );
}
