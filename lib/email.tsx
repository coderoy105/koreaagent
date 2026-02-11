import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Fallback single link (used when no admin links are set)
const EBOOK_DOWNLOAD_URL = "https://drive.google.com/file/d/1PnvErck2pkoJNIcyktYSvMe_0TEwOTHn/view?usp=drive_link";

interface SendDownloadEmailParams {
  to: string;
  name: string;
  orderId: string;
}

interface SendReviewEmailParams {
  to: string;
  name: string;
  rating: number;
  content: string;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function applyTemplate(template: string, data: Record<string, string>) {
  return Object.entries(data).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), value),
    template
  );
}

async function getDownloadEmailSettings() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("ebook_download_urls, ebook_download_links, download_email_text, download_email_subject, download_email_heading")
      .single();

    const urlsRaw = (data as { ebook_download_urls?: unknown })?.ebook_download_urls;
    const urls = Array.isArray(urlsRaw)
      ? urlsRaw.filter((url) => typeof url === "string" && url.trim().length > 0)
      : [];

    const linksRaw = (data as { ebook_download_links?: unknown })?.ebook_download_links;
    const downloadEmailLinks = Array.isArray(linksRaw)
      ? linksRaw
          .map((link: { name?: unknown; url?: unknown }) => ({
            name: typeof link?.name === "string" ? link.name.trim() : "",
            url: typeof link?.url === "string" ? link.url.trim() : "",
          }))
          .filter((link: { name: string; url: string }) => link.url.length > 0)
      : [];

    const downloadEmailText =
      typeof (data as { download_email_text?: unknown })?.download_email_text === "string"
        ? (data as { download_email_text?: string }).download_email_text || ""
        : "";

    const downloadEmailSubject =
      typeof (data as { download_email_subject?: unknown })?.download_email_subject === "string"
        ? (data as { download_email_subject?: string }).download_email_subject || "Download links"
        : "Download links";

    const downloadEmailHeading =
      typeof (data as { download_email_heading?: unknown })?.download_email_heading === "string"
        ? (data as { download_email_heading?: string }).download_email_heading || "Download links"
        : "Download links";

    return { urls, downloadEmailLinks, downloadEmailText, downloadEmailSubject, downloadEmailHeading };
  } catch (error) {
    console.error("Settings fetch error:", error);
    return { urls: [], downloadEmailLinks: [], downloadEmailText: "", downloadEmailSubject: "Download links", downloadEmailHeading: "Download links" };
  }
}

function buildLinksHtml(links: { name: string; url: string }[]) {
  return links
    .map((link, index) => {
      const safeUrl = escapeHtml(link.url);
      const normalizedName = link.name
        .replace(/\\n/g, " ")
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const label = normalizedName || `Download link ${index + 1}`;
      return `
        <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block; margin-right:10px; margin-bottom:10px;">
          <tr>
            <td bgcolor="#2563eb" style="border-radius:10px;">
              <a href="${safeUrl}" style="display:inline-block; padding:12px 20px; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px; border-radius:10px;">
                ${label}
              </a>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");
}

function extractUrls(text: string) {
  const matches = text.match(/https?:\/\/[^\s]+/g) || [];
  return matches.map((url) => url.replace(/[),.]+$/g, ""));
}

export async function sendDownloadEmail({
  to,
  name,
  orderId,
}: SendDownloadEmailParams) {
  const { urls, downloadEmailLinks, downloadEmailText, downloadEmailSubject, downloadEmailHeading } = await getDownloadEmailSettings();
  const extractedUrls = urls.length === 0 && downloadEmailLinks.length === 0 ? extractUrls(downloadEmailText) : [];
  const fallbackLinks = extractedUrls.map((url, idx) => ({ name: "", url }));
  const downloadLinks =
    (downloadEmailLinks.length > 0
      ? downloadEmailLinks
      : urls.length > 0
      ? urls.map((url) => ({ name: "", url }))
      : fallbackLinks.length > 0
      ? fallbackLinks
      : [{ name: "", url: EBOOK_DOWNLOAD_URL }])
      .slice(0, 2);

  const defaultText =
    "Hello {name}\nYour payment is confirmed.\nPlease use the links below to download your ebook.";

  const linksText = "아래 링크를 확인해주세요.\n모바일은 받은메일 표시를 눌러주세요.";
  const templateText = downloadEmailText && downloadEmailText.trim().length > 0 ? downloadEmailText : defaultText;
  const templated = applyTemplate(templateText, {
    name,
    orderId: orderId.slice(0, 8).toUpperCase(),
    links: linksText,
  });

  const safeText = escapeHtml(templated).replace(/\n/g, "<br/>");

  const { error } = await resend.emails.send({
    from: "Ebook Store <onboarding@resend.dev>",
    to: [to],
    subject: downloadEmailSubject || "Download links",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; background: #f3f4f6; padding: 24px;">
          <div style="max-width: 640px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 18px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; letter-spacing: 0.08em;">EBOOK DELIVERY</p>
              <h1 style="color: #111827; margin: 6px 0 2px; font-size: 22px;">${downloadEmailHeading || "Download links"}</h1>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Order ID: <strong style="color: #111827;">${orderId.slice(0, 8).toUpperCase()}</strong></p>
            </div>

            <div style="background: #ffffff; border-radius: 16px; padding: 22px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
              <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap;">${safeText}</p>
              </div>

              <div style="text-align: left; margin-bottom: 6px;">
                ${buildLinksHtml(downloadLinks)}
              </div>

              <div style="text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                <p style="margin: 0;">Reply to this email if you need help.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send email");
  }

  return { success: true };
}

export async function sendReviewThankYouEmail({
  to,
  name,
  rating,
  content,
}: SendReviewEmailParams) {
  const safeName = escapeHtml(name);
  const safeContent = escapeHtml(content);
  const { error } = await resend.emails.send({
    from: "Ebook Store <onboarding@resend.dev>",
    to: [to],
    subject: "Thanks for your review",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">Thanks, ${safeName}</h1>
            <p style="color: #666; font-size: 16px;">We appreciate your feedback.</p>
          </div>

          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Rating: <strong style="color: #333;">${rating} / 5</strong></p>
            <div style="padding: 12px; background: #fff; border-radius: 10px; border: 1px solid #eee;">
              <p style="margin: 0; color: #333; font-size: 14px; white-space: pre-wrap;">${safeContent}</p>
            </div>
          </div>

          <div style="text-align: center; color: #999; font-size: 13px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>We will keep improving the product.</p>
            <p style="margin-top: 10px;">Ebook Store</p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send review email");
  }

  return { success: true };
}
