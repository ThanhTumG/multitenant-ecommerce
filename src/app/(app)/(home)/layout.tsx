import React, { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";

import Navbar from "./navbar";
import Footer from "./footer";
import { SearchFilters, SearchFiltersLoading } from "./search-filter";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersLoading />}>
          {/* Search Filter */}
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>

      {/* Content */}
      <div className="flex-1 bg-[#f4f4f0]">{children}</div>

      <Footer />
    </div>
  );
};

export default Layout;
