"use client";

import { generateTenantURL } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  slug: string;
}

const Navbar = ({ slug }: Props) => {
  // Server
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.tenants.getOne.queryOptions({
      slug,
    })
  );

  return (
    <div className="h-20 border-b font-medium bg-white">
      <div
        className="max-w-(--breakpoint-xl) mx-auto flex gap-2 items-center
       h-full px-4 lg:px-12"
      >
        <Link
          href={generateTenantURL(slug)}
          className="flex items-center gap-2"
        >
          {data.image?.url && (
            <Image
              src={data.image?.url}
              width={32}
              height={32}
              className="rounded-full border shrink-0 size-[32px]"
              alt="slug"
            />
          )}
        </Link>
        <p className="text-xl">{data.name}</p>
      </div>
    </div>
  );
};

export default Navbar;

export const NavbarSkeleton = () => {
  return (
    <div className="h-20 border-b font-medium bg-white">
      <div
        className="max-w-(--breakpoint-xl) mx-auto flex justify-center items-center
     h-full px-4 lg:px-12"
      >
        <div></div>
      </div>
    </div>
  );
};
