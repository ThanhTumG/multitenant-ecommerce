import { getQueryClient, trpc } from "@/trpc/server";
import ProductView from "@/modules/products/ui/components/views/product-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  params: Promise<{ productId: string; slug: string }>;
}

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
        <ProductView productId={productId} tenantSlug={slug} />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
