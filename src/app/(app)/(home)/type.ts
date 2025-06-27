import { Category } from "@/payload-types";

export type CustomCategoryType = Category & {
  subcategories: Category[];
};
