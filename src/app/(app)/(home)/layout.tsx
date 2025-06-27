import configPromise from "@payload-config";
import { getPayload } from "payload";
import React from "react";

import Navbar from "./navbar";
import Footer from "./footer";
import { SearchFilters } from "./search-filter";
import { Category } from "@/payload-types";
import { CustomCategoryType } from "./type";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    depth: 1, // Populate subcategories
    pagination: false,
    where: {
      parent: {
        exists: false,
      },
    },
    sort: "name",
  });

  const formattedData: CustomCategoryType[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      // Because of 'depth: 1' we are confident "doc" will be a type of "Category"
      ...(doc as Category),
      subcategories: undefined,
    })),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Search Filter */}
      <SearchFilters data={formattedData} />

      {/* Content */}
      <div className="flex-1 bg-[#f4f4f0]">{children}</div>

      <Footer />
    </div>
  );
};

export default Layout;
