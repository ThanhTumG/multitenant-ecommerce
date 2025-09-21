"use client";

import { Button } from "@/components/ui/button";
import { generateTenantURL } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface Props {
  slug: string;
}

const Navbar = ({ slug }: Props) => {
  return (
    <div className="h-20 border-b font-medium bg-white">
      <div
        className="max-w-(--breakpoint-xl) justify-between mx-auto flex gap-2 items-center
       h-full px-4 lg:px-12"
      >
        <p className="text-xl">Checkout</p>
        <Button variant="elevated" asChild>
          <Link href={generateTenantURL(slug)}>Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
