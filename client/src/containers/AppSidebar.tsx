import { ReceiptText } from "lucide-react";
import Logo from "@/components/Logo";
import UserAccount from "@/components/UserAccount";
import { Separator } from "@/components/ui/separator";
import CreateContractDialog from "./CreateContractDialog";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "My Contracts",
    url: "/dashboard/contracts",
    icon: ReceiptText,
  },
];

export default function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="py-8">
              <Logo size="xs" />
            </SidebarGroupLabel>
            <Separator />
            <div className="flex items-center justify-center my-2.5">
              <CreateContractDialog />
            </div>
            <Separator />
            <SidebarGroupContent className="py-5 font-semibold">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton className="text-md" asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Separator />
          <SidebarGroup>
            <UserAccount username="Kevin K." email="lasitha@gmail.com" />
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      <SidebarTrigger />
    </SidebarProvider>
  );
}
