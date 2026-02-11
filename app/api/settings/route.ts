import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Settings fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    const settings = data || {
      bank_name: "토스뱅크",
      account_number: "1908-6747-9631",
      account_holder: "서영조",
      price: 13000,
      original_price: 38000,
      book_cover_url: "",
      ebook_download_urls: [],
      ebook_download_links: [],
      download_email_text: "",
      sale_enabled: false,
      sale_label: "\uC124\uB0A0 \uC138\uC77C",
      sale_end_at: null,
      download_email_subject: "Download links",
      download_email_heading: "Download links",
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bank_name,
      account_number,
      account_holder,
      price,
      original_price,
      book_cover_url,
      ebook_download_urls,
      download_email_text,
      ebook_download_links,
      sale_enabled,
      sale_label,
      sale_end_at,
      download_email_subject,
      download_email_heading,
    } = body;

    const normalizedDownloadUrls = Array.isArray(ebook_download_urls)
      ? ebook_download_urls.filter((url: string) => typeof url === "string" && url.trim().length > 0)
      : [];
    const normalizedDownloadLinks = Array.isArray(ebook_download_links)
      ? ebook_download_links
          .map((link: { name?: unknown; url?: unknown }) => ({
            name: typeof link?.name === "string" ? link.name.trim() : "",
            url: typeof link?.url === "string" ? link.url.trim() : "",
          }))
          .filter((link: { name: string; url: string }) => link.url.length > 0)
      : [];
    const normalizedEmailText =
      typeof download_email_text === "string" ? download_email_text : "";

    const normalizedSaleEnabled = Boolean(sale_enabled);
    const normalizedSaleLabel =
      typeof sale_label === "string" && sale_label.trim().length > 0
        ? sale_label
        : "\uC124\uB0A0 \uC138\uC77C";
    const normalizedSaleEndAt =
      typeof sale_end_at === "string" && sale_end_at.trim().length > 0
        ? sale_end_at
        : null;

    const normalizedDownloadSubject =
      typeof download_email_subject === "string" && download_email_subject.trim().length > 0
        ? download_email_subject
        : "Download links";
    const normalizedDownloadHeading =
      typeof download_email_heading === "string" && download_email_heading.trim().length > 0
        ? download_email_heading
        : "Download links";

    const supabase = await createClient();

    // Check if settings exist
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .single();

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from("site_settings")
        .update({
          bank_name,
          account_number,
          account_holder,
          price,
          original_price,
          book_cover_url,
          ebook_download_urls: normalizedDownloadUrls,
          ebook_download_links: normalizedDownloadLinks,
          download_email_text: normalizedEmailText,
          sale_enabled: normalizedSaleEnabled,
          sale_label: normalizedSaleLabel,
          sale_end_at: normalizedSaleEndAt,
          download_email_subject: normalizedDownloadSubject,
          download_email_heading: normalizedDownloadHeading,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Settings update error:", error);
        return NextResponse.json(
          { error: "Failed to update settings" },
          { status: 500 }
        );
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from("site_settings")
        .insert({
          bank_name,
          account_number,
          account_holder,
          price,
          original_price,
          book_cover_url,
          ebook_download_urls: normalizedDownloadUrls,
          ebook_download_links: normalizedDownloadLinks,
          download_email_text: normalizedEmailText,
          sale_enabled: normalizedSaleEnabled,
          sale_label: normalizedSaleLabel,
          sale_end_at: normalizedSaleEndAt,
          download_email_subject: normalizedDownloadSubject,
          download_email_heading: normalizedDownloadHeading,
        });

      if (error) {
        console.error("Settings create error:", error);
        return NextResponse.json(
          { error: "Failed to create settings" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
