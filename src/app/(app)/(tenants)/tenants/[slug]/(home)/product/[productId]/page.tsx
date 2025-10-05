import { getQueryClient, trpc } from "@/trpc/server";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/products/ui/components/views/product-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  params: Promise<{ productId: string; slug: string }>;
}

export const dynamic = "force-dynamic";

const Page = async ({ params }: Props) => {
  const { productId, slug } = await params;

  // Server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getOne.queryOptions({
      id: productId,
    })
  );

  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ProductViewSkeleton />}>
          <ProductView productId={productId} tenantSlug={slug} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default Page;
