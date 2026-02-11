import { createClient } from "@/lib/supabase/server";
import { LandingClient } from "@/components/landing/landing-client";

const DEFAULT_PRICE = 13000;
const DEFAULT_ORIGINAL_PRICE = 38000;
const DEFAULT_BANK = {
  bank: "토스뱅크",
  account: "1908-6747-9631",
  holder: "서영조",
};

export default async function LandingPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("price, original_price, bank_name, account_number, account_holder, sale_enabled, sale_label, sale_end_at")
    .single();

  const initialPrice = typeof settings?.price === "number" ? settings.price : DEFAULT_PRICE;
  const initialOriginalPrice = typeof settings?.original_price === "number" ? settings.original_price : DEFAULT_ORIGINAL_PRICE;
  const initialBankInfo = settings?.bank_name && settings?.account_number && settings?.account_holder
    ? {
        bank: settings.bank_name,
        account: settings.account_number,
        holder: settings.account_holder,
      }
    : DEFAULT_BANK;

  const initialSaleEnabled = typeof settings?.sale_enabled === "boolean" ? settings.sale_enabled : false;
  const initialSaleLabel = typeof settings?.sale_label === "string" && settings.sale_label.trim().length > 0
    ? settings.sale_label
    : "\uD0C0\uC784\uC138\uC77C";
  const initialSaleEndAt = typeof settings?.sale_end_at === "string" ? settings.sale_end_at : null;

  return (
    <LandingClient
      initialPrice={initialPrice}
      initialOriginalPrice={initialOriginalPrice}
      initialBankInfo={initialBankInfo}
      initialSaleEnabled={initialSaleEnabled}
      initialSaleLabel={initialSaleLabel}
      initialSaleEndAt={initialSaleEndAt}
    />
  );
}
