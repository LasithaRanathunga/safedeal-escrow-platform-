import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profilePic from "../assets/profile.jpeg";
import { LogOut } from "lucide-react";

export default function UserAccount({
  username,
  email,
}: {
  username: string;
  email: string;
}) {
  return (
    <div className="flex justify-between items-center rounded-md p-2 hover:bg-accent">
      <div className="flex items-center gap-3">
        <Avatar className="rounded-md w-10 h-10 p-0 m-0">
          <AvatarImage src={profilePic} alt={username} />
          <AvatarFallback>KK</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold">{username}</p>
          <p className="text-sm">{email}</p>
        </div>
      </div>
      <LogOut size={24} className="cursor-pointer" />
    </div>
  );
}
