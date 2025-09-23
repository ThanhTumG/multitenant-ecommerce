import { NextRequest, NextResponse } from "next/server";
import { appRouter } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/init";

type MoMoIpnPayload = {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: number;
  orderInfo?: string;
  orderType?: string;
  transId?: number;
  resultCode?: number;
  message?: string;
  payType?: string;
  responseTime?: number;
  extraData?: string;
  signature?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Parse dữ liệu từ MoMo webhook
    const contentType = request.headers.get("content-type");
    let webhookData: Partial<MoMoIpnPayload> = {};

    if (contentType?.includes("application/json")) {
      webhookData = (await request.json()) as Partial<MoMoIpnPayload>;
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const raw = Object.fromEntries(formData.entries());
      const tmp: Record<string, string> = Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [
          key,
          typeof value === "string" ? value : "",
        ])
      );

      webhookData.partnerCode = tmp.partnerCode;
      webhookData.orderId = tmp.orderId;
      webhookData.requestId = tmp.requestId;
      webhookData.orderInfo = tmp.orderInfo;
      webhookData.orderType = tmp.orderType;
      webhookData.message = tmp.message;
      webhookData.payType = tmp.payType;
      webhookData.extraData = tmp.extraData;

      // Convert string values to appropriate types
      if (tmp.amount) {
        webhookData.amount = parseFloat(tmp.amount);
      }
      if (tmp.resultCode) {
        webhookData.resultCode = parseInt(tmp.resultCode, 10);
      }
      if (tmp.responseTime) {
        webhookData.responseTime = parseInt(tmp.responseTime, 10);
      }
      if (tmp.transId) {
        webhookData.transId = parseInt(tmp.transId, 10);
      }
    } else {
      // Fallback: try to parse as JSON
      try {
        webhookData = (await request.json()) as Partial<MoMoIpnPayload>;
      } catch {
        return NextResponse.json(
          { error: "Invalid content type" },
          { status: 400 }
        );
      }
    }

    // Tạo tRPC context và gọi procedure callback
    const ctx = await createTRPCContext();
    const caller = appRouter.createCaller(ctx);

    // Gọi procedure callback với dữ liệu webhook
    const result = await caller.checkout.callback(
      webhookData as MoMoIpnPayload
    );

    console.log("Callback result:", result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error processing MoMo webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Xử lý GET request (để test)
export async function GET() {
  return NextResponse.json({ message: "MoMo webhook endpoint is working" });
}
