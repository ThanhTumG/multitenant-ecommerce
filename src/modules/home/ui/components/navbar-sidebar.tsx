"use client";

import React from "react";
import Link from "next/link";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

type Props = {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NavBarSidebar = ({ items, open, onOpenChange }: Props) => {
  // Server
  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}
          {session.data?.user ? (
            <div className="border-t">
              <Link
                href={"/admin"}
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="border-t">
              <Link
                href={"/sign-in"}
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              >
                Log in
              </Link>
              <Link
                href={"/sign-up"}
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              >
                Start selling
              </Link>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NavBarSidebar;
