import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "slug",
  },
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
      label: "Store Name",
      admin: {
        description: "This is the name of the store (e.g. Book Store)",
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      admin: {
        description:
          "This is the subdomain of the store (e.g. [slug].funroad.com)",
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "partnerCode",
      type: "text",
      required: true,
      admin: {
        description: "Your MoMo business account’s unique identity",
      },
    },
    {
      name: "accessKey",
      type: "text",
      required: true,
      admin: {
        description: "Server Access key",
      },
    },
    {
      name: "secretKey",
      type: "text",
      required: true,
      admin: {
        description: "Used to create digital signature",
      },
    },
  ],
};
