import React from "react";
import { CheckoutView } from "@/modules/checkout/ui/view/checkout-view";

interface Props {
  params: Promise<{ slug: string }>;
}

const CheckoutPage = async ({ params }: Props) => {
  const { slug } = await params;
  return <CheckoutView tenantSlug={slug} />;
};

export default CheckoutPage;
