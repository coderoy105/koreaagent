import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function formatDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const daysParam = request.nextUrl.searchParams.get("days");
    const days = Math.max(1, Math.min(90, Number(daysParam) || 14));

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const { data, error } = await supabase
      .from("visit_logs")
      .select("created_at")
      .gte("created_at", since.toISOString());

    if (error) {
      console.error("Daily visit error:", error);
      return NextResponse.json({ error: "Failed to get daily visits" }, { status: 500 });
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      const createdAt = row.created_at ? new Date(row.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) continue;
      const key = formatDateKey(createdAt);
      counts[key] = (counts[key] || 0) + 1;
    }

    const daily = Object.keys(counts)
      .sort()
      .map((date) => ({ date, count: counts[date] }));

    return NextResponse.json({ days, daily });
  } catch (error) {
    console.error("Daily visit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
