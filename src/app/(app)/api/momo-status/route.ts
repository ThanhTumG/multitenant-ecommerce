import { NextRequest, NextResponse } from "next/server";

// Endpoint để check payment status từ frontend
// Sử dụng khi IPN không hoạt động đáng tin cậy
export async function POST(request: NextRequest) {
  try {
    const { orderId, partnerCode } = await request.json();

    if (!orderId || !partnerCode) {
      return NextResponse.json(
        { error: "Missing orderId or partnerCode" },
        { status: 400 }
      );
    }

    // Gọi MoMo API để check payment status
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_URL}/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerCode,
          orderId,
          requestId: orderId,
          lang: "vi",
        }),
      }
    );

    const data = await response.json();

    // Nếu payment thành công, tạo order
    if (data.resultCode === 0) {
      // Parse extraData để lấy productIds + userId
      const decoded = data.extraData
        ? JSON.parse(Buffer.from(data.extraData, "base64").toString("utf8"))
        : { productIds: [], userId: undefined };

      const productIds: string[] = Array.isArray(decoded.productIds)
        ? decoded.productIds
        : [];
      const userId: string | undefined = decoded.userId;

      if (userId && productIds.length > 0) {
        // Tạo orders
        for (const pid of productIds) {
          // Tạo order logic ở đây
          console.log(`Creating order for product ${pid}, user ${userId}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus: data.resultCode === 0 ? "success" : "pending",
      data,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
