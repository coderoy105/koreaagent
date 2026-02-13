import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendReviewThankYouEmail } from "@/lib/email";

function normalizeRating(value: unknown) {
  const rating = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isFinite(rating)) return null;
  if (rating < 0.5 || rating > 5) return null;
  const step = Math.round(rating * 2) / 2;
  if (Math.abs(step - rating) > 0.001) return null;
  return step;
}

function normalizeDepositorName(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9가-힣]/gi, "")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { depositorName, rating: rawRating, content } = body;
    const rating = normalizeRating(rawRating);

    if (!depositorName || !rating || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify depositor name exists only in admin-confirmed orders
    const { data: orders } = await supabase
      .from("orders")
      .select("id, name, email, depositor_name, status")
      .eq("status", "completed");

    const normalizedInput = normalizeDepositorName(depositorName);
    const order = orders?.find((item) => {
      const depositor = normalizeDepositorName(item.depositor_name || "");
      const buyer = normalizeDepositorName(item.name || "");
      return depositor === normalizedInput || buyer === normalizedInput;
    });

    if (!order) {
      return NextResponse.json(
        { error: "입금 확인 & 발송 완료된 주문만 후기 작성이 가능합니다." },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        order_id: order.id,
        depositor_name: depositorName,
        author_name: order.name,
        rating,
        content,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Review creation error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create review" },
        { status: 500 }
      );
    }

    if (order?.email) {
      try {
        await sendReviewThankYouEmail({
          to: order.email,
          name: order.name,
          rating,
          content,
        });
      } catch (emailError) {
        console.error("Review email error:", emailError);
      }
    }

    return NextResponse.json({ reviewId: data.id }, { status: 201 });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error("Reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Review delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, rating: rawRating, content } = body;
    const rating = normalizeRating(rawRating);

    if (!id || !rating || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("reviews")
      .update({ rating, content })
      .eq("id", id);

    if (error) {
      console.error("Review update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
