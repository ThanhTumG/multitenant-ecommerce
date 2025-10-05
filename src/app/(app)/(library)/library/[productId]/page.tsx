import {
  ProductView,
  ProductViewSkeleton,
} from "@/modules/library/ui/view/product-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export const dynamic = "force-dynamic";

const Library = async ({ params }: Props) => {
  const { productId } = await params;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({
      productId,
    })
  );

  void queryClient.prefetchQuery(
    trpc.reviews.getOne.queryOptions({
      productId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />;
      </Suspense>
    </HydrationBoundary>
  );
};

export default Library;
