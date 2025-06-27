"use client";

import React, { useState } from "react";

import { ListFilterIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomCategoryType } from "../type";
import CategoriesSideBar from "./categories-sidebar";
import { Button } from "@/components/ui/button";

interface Props {
  disabled?: boolean;
  data: CustomCategoryType[];
}

const SearchInput = ({ disabled, data }: Props) => {
  // States
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSideBar
        data={data}
        open={isSideBarOpen}
        onOpenChange={setIsSideBarOpen}
      />
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input
          className="pl-8"
          placeholder="Search products"
          disabled={disabled}
        />
      </div>

      {/* TODO: Add categories view all button */}
      <Button
        variant={"elevated"}
        className="size-12 shrink-0 flex lg:hidden"
        onClick={() => setIsSideBarOpen(true)}
      >
        <ListFilterIcon />
      </Button>
      {/* TODO: Add library button */}
    </div>
  );
};

export default SearchInput;
