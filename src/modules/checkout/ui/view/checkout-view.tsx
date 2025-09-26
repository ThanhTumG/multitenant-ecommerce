"use client";

import React, { useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCart } from "../../hooks/use-cart";
import { toast } from "sonner";
import { generateTenantURL } from "@/lib/utils";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
import { useRouter } from "next/navigation";

type Props = {
  tenantSlug: string;
};

export const CheckoutView = ({ tenantSlug }: Props) => {
  const router = useRouter();
  const [states, setStates] = useCheckoutStates();

  const { productIds, clearCart, removeProduct } = useCart(tenantSlug);

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds,
    })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        window.location.href = data;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(error.message);
      },
    })
  );

  const handlePurchase = () => {
    purchase.mutate({ tenantSlug, productIds });
  };

  useEffect(() => {
    if (states.success) {
      setStates({ success: false, cancel: false });
      clearCart();
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
      router.push("/product");
    }
  }, [
    states.success,
    clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart cleared");
    }
  }, [error, clearCart]);

  if (isLoading)
    return (
      <div className="lg:pt-16 pt-4 lg:px-12 px-4">
        <div
          className="border border-black border-dashed flex items-center justify-center p-8
            flex-col gap-y-4 bg-white w-full rounded-lg"
        >
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );

  if (data?.totalDocs === 0)
    return (
      <div className="lg:pt-16 pt-4 lg:px-12 px-4">
        <div
          className="border border-black border-dashed flex items-center justify-center p-8
        flex-col gap-y-4 bg-white w-full rounded-lg"
        >
          <InboxIcon />
          <p className="text-base text-medium">No products found</p>
        </div>
      </div>
    );

  return (
    <div className="lg:pt-16 pt-4 lg:px-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-7 lg:gap-16 gap-4">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantURL(product.tenant.slug)}/product/${product.id}`}
                tenantUrl={`${generateTenantURL(product.tenant.slug)}`}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data?.totalPrice || 0}
            onPurchase={handlePurchase}
            isCanceled={states.cancel}
            isPending={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
};
