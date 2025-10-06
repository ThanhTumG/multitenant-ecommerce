import z from "zod";
import crypto from "crypto";
import axios from "axios";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";
import { generateTenantURL } from "@/lib/utils";

export const checkoutRouter = createTRPCRouter({
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
        tenantSlug: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.payload.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            },
            {
              "tenant.slug": {
                equals: input.tenantSlug,
              },
            },
            {
              isArchived: {
                not_equals: true,
              },
            },
          ],
        },
      });

      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

      const tenantData = await ctx.payload.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: input.tenantSlug,
          },
        },
      });

      const tenant = tenantData.docs[0];

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      const { accessKey, secretKey, partnerCode } = tenant;
      const amount = products.docs.reduce((prev, curr) => prev + curr.price, 0);

      const orderInfo = "pay with MoMo";

      // Debug: Log environment variables
      console.log("🔧 Environment check:", {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

      const redirectUrl = `${baseUrl}${generateTenantURL(input.tenantSlug)}/checkout?success=true`;
      const ipnUrl = `${baseUrl}`;

      const requestType = "payWithMethod";
      const orderId = partnerCode + new Date().getTime();
      const requestId = orderId;
      type ExtraData = { productIds: string[]; userId?: string };
      const extraPayload: ExtraData = {
        productIds: input.productIds,
        userId: (ctx as { session?: { user?: { id?: string } } }).session?.user
          ?.id,
      };
      const extraData = Buffer.from(JSON.stringify(extraPayload)).toString(
        "base64"
      );
      const orderGroupId = "";
      const autoCapture = true;
      const lang = "vi";

      //before sign HMAC SHA256 with format
      //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
      const rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;
      //puts raw signature
      //signature
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      //json object send to MoMo endpoint
      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MoMoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
      });

      //options for axios
      const option = {
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_PAYMENT_URL}/create`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
        data: requestBody,
      };

      try {
        const response = await axios(option);
        return response.data.payUrl;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server Error",
        });
      }
    }),

  callback: baseProcedure
    .input(
      z.object({
        partnerCode: z.string().optional(),
        orderId: z.string().optional(),
        requestId: z.string().optional(),
        amount: z.number().optional(),
        orderInfo: z.string().optional(),
        orderType: z.string().optional(),
        transId: z.number().optional(),
        resultCode: z.number().optional(),
        message: z.string().optional(),
        payType: z.string().optional(),
        responseTime: z.number().optional(),
        extraData: z.string().optional(),
        signature: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { orderId, resultCode, transId } = input;
      if (resultCode === 0) {
        // Parse extraData để lấy productIds + userId
        const decoded = input.extraData
          ? JSON.parse(Buffer.from(input.extraData, "base64").toString("utf8"))
          : { productIds: [], userId: undefined };
        const productIds: string[] = Array.isArray(decoded.productIds)
          ? decoded.productIds
          : [];
        const userId: string | undefined = decoded.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }
        if (productIds.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product not found",
          });
        }

        // Tạo 1 order cho mỗi productId (nếu có userId & productIds)
        for (const pid of productIds) {
          await ctx.payload.create({
            collection: "orders",
            data: {
              name: `Order - ${orderId}`,
              user: userId,
              product: pid,
              transactionId: String(transId ?? ""),
            },
          });
        }
      }

      return { success: true };
    }),

  checkStatus: baseProcedure
    .input(
      z.object({
        partnerCode: z.string(),
        requestId: z.string(),
        orderId: z.string(),
        tenantSlug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantData = await ctx.payload.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: input.tenantSlug,
          },
        },
      });

      const tenant = tenantData.docs[0];
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }
      const { accessKey, secretKey } = tenant;

      const rawSignature = `accessKey=${accessKey}&orderId=${input.orderId}&partnerCode=${input.partnerCode}&requestId=${input.requestId}`;
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      const requestBody = JSON.stringify({
        partnerCode: input.partnerCode,
        requestId: input.requestId,
        orderId: input.orderId,
        signature: signature,
        lang: "vi",
      });

      //options for axios
      const option = {
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_PAYMENT_URL}/query`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
        data: requestBody,
      };

      try {
        const response = await axios(option);
        console.log("✅ MoMo query response:", response.data);

        if (response.data.resultCode !== 0) {
          return {
            success: false,
            message: response.data.message || "Payment not completed",
            resultCode: response.data.resultCode,
          };
        }

        // Parse extraData để lấy productIds + userId
        const extraData = response.data.extraData;
        const decoded = extraData
          ? JSON.parse(Buffer.from(extraData, "base64").toString("utf8"))
          : { productIds: [], userId: undefined };

        const productIds: string[] = Array.isArray(decoded.productIds)
          ? decoded.productIds
          : [];
        const userId: string | undefined = decoded.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }
        if (productIds.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product not found",
          });
        }

        // Tạo 1 order cho mỗi productId (nếu có userId & productIds)
        for (const pid of productIds) {
          await ctx.payload.create({
            collection: "orders",
            data: {
              name: `Order - ${response.data.orderId}`,
              user: userId,
              product: pid,
              transactionId: String(response.data.transId ?? ""),
            },
          });
        }

        return {
          success: true,
          message: "Payment completed successfully",
          resultCode: response.data.resultCode,
          orderId: response.data.orderId,
          transId: response.data.transId,
        };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check payment status",
        });
      }
    }),

  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.payload.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.ids,
              },
            },
            {
              isArchived: { not_equals: true },
            },
          ],
        },
      });

      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

      return {
        ...data,
        totalPrice: data.docs.reduce((prev, curr) => prev + curr.price, 0),
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
