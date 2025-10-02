import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Tree, TreeItem, TreeItemLabel } from "@/components/tree";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profilePic from "../assets/profile.jpeg";

import { type ReactNode } from "react";

interface Item {
  name: string | ReactNode;
  children?: string[];
}

const items: Record<string, Item> = {
  company: {
    name: "Company",
    children: ["engineering", "marketing", "operations"],
  },
  engineering: {
    // name: "Engineering",
    name: (
      <div className="text-left">
        <p>
          <b>Eng Team</b>
        </p>
        <p className="mt-2">
          relative before:absolute before:inset-0 before:-ms-1
          before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]
        </p>
        <Button asChild variant="ghost" size={"sm"} className="p-0 mt-2">
          Reply
        </Button>
      </div>
    ),
    // children: ["frontend", "backend", "platform-team"],
  },
  frontend: { name: "Frontend", children: ["design-system", "web-platform"] },
  "design-system": {
    name: "Design System",
    children: ["components", "tokens", "guidelines"],
  },
  components: { name: "Components" },
  tokens: { name: "Tokens" },
  guidelines: { name: "Guidelines" },
  "web-platform": { name: "Web Platform" },
  backend: { name: "Backend", children: ["apis", "infrastructure"] },
  apis: { name: "APIs" },
  infrastructure: { name: "Infrastructure" },
  "platform-team": { name: "Platform Team" },
  marketing: { name: "Marketing", children: ["content", "seo"] },
  content: { name: "Content" },
  seo: { name: "SEO" },
  operations: { name: "Operations", children: ["hr", "finance"] },
  hr: { name: "HR" },
  finance: { name: "Finance" },
};

const indent = 20;

export default function CommentSection() {
  const tree = useTree<Item>({
    initialState: {
      expandedItems: ["engineering", "frontend", "design-system"],
    },
    indent,
    rootItemId: "company",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow mt-2.5">
      <div>
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems().map((item) => {
            return (
              <TreeItem key={item.getId()} item={item}>
                <TreeItemLabel className="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 ">
                  <span className="flex items-top gap-2">
                    {item.isFolder() ? (
                      item.isExpanded() ? (
                        // <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4" />

                        <Avatar className="size-7">
                          <AvatarImage src={profilePic} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="size-7">
                          <AvatarImage src={profilePic} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      )
                    ) : (
                      <Avatar className="size-7">
                        <AvatarImage src={profilePic} />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    )}
                    {item.getItemName()}
                  </span>
                </TreeItemLabel>
              </TreeItem>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}
