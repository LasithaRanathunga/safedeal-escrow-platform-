import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { handleAcessToken } from "@/fetch/fetchWrapper";

type User = {
  name: string;
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

async function getUsers(name: string, token: string) {
  try {
    const response = await fetch(
      "http://localhost:3000/user/searchByUsername",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name }),
      }
    );

    const users = await response.json();

    return users;
  } catch (error) {
    console.log("Error fetching users:", error);
  }
}

async function searchUsers(name: string) {
  console.log("Searching users with name:", name);

  const users = await handleAcessToken(getUsers.bind(null, name));

  if (!users) {
    throw new Error("No users found");
  }

  console.log("Fetched users:", users);
  return users as User[];
}

export default function PartnerSelector({
  selectedUserRef,
}: {
  selectedUserRef: React.RefObject<any>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const onInputChange = async function (param: string) {
    const users = await searchUsers(param);

    setUsers(users);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value : "Select User..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search user..."
            onValueChange={onInputChange}
          />
          <CommandList>
            <CommandEmpty>No User found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={(currentValue) => {
                    console.log("Selected user:", currentValue);
                    setValue(currentValue);
                    selectedUserRef.current = user;
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex w-full flex-col gap-1 ">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
