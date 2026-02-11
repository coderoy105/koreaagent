import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const supabase = await createClient();

    // Get the order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status === "completed") {
      return NextResponse.json(
        { error: "Order already completed" },
        { status: 400 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Send download email
    try {
      await sendDownloadEmail({
        to: order.email,
        name: order.name,
        orderId: order.id,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Continue even if email fails - order is marked complete
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
