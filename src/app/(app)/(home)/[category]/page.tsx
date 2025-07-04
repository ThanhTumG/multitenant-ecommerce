import React from "react";

interface Props {
  params: Promise<{ category: string; subcategory: string }>;
}

const Page = async ({ params }: Props) => {
  const { category } = await params;

  return <div>{category}</div>;
};

export default Page;
