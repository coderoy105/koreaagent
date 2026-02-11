import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("visit_logs").insert({});

    if (error) {
      console.error("Visit log error:", error);
      return NextResponse.json({ error: "Failed to log visit" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("visit_logs")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Visit count error:", error);
      return NextResponse.json({ error: "Failed to get visit count" }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Visit count error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
