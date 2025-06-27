"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomCategoryType } from "../type";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CustomCategoryType[]; // Remove later
}

const CategoriesSideBar = ({ open, onOpenChange, data }: Props) => {
  // Routers
  const router = useRouter();

  // States
  const [parentCategories, setParentCategories] = useState<
    CustomCategoryType[] | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CustomCategoryType | null>(null);

  // If have parent categories, show those, otherwise show root categories
  const currentCategories = parentCategories ?? data ?? [];

  // Methods
  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  };

  const handleClickCategory = (cat: CustomCategoryType) => {
    if (cat.subcategories && cat.subcategories.length > 0) {
      setParentCategories(cat.subcategories as CustomCategoryType[]);
      setSelectedCategory(cat);
    } else {
      // This is a leaf category
      if (parentCategories && selectedCategory) {
        // This is a subcategory - navigate to /category/subcategory
        router.push(`/${selectedCategory.slug}/${cat.slug}`);
      } else {
        // This is a root category - navigate to /category
        if (cat.slug === "all") {
          router.push("/");
        } else {
          router.push(`/${cat.slug}`);
        }
      }
      handleOpenChange(false);
    }
  };

  const handleClickBack = () => {
    if (parentCategories) {
      setParentCategories(null);
      setSelectedCategory(null);
    }
  };

  const backgroundColor = selectedCategory?.color || "white";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {parentCategories && (
            <button
              onClick={handleClickBack}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
            >
              <ChevronLeftIcon className="size-4 mr-2" />
              Back
            </button>
          )}

          {currentCategories.map((cat) => (
            <button
              key={cat.slug}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center text-base font-medium cursor-pointer"
              onClick={() => handleClickCategory(cat)}
            >
              {cat.name}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <ChevronRightIcon className="w-4" />
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CategoriesSideBar;
