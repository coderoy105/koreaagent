import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Copy, Clock, Mail } from "lucide-react";
import { CopyButton } from "./copy-button";
import { Button } from "@/components/ui/button";

const TEXT = {
  bankInfoNote: "\uACC4\uC88C \uC815\uBCF4 - \uC2E4\uC81C \uC815\uBCF4\uB85C \uBCC0\uACBD\uD558\uC138\uC694",
  orderNotFoundTitle: "\uC8FC\uBB38\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
  orderNotFoundDesc: "\uC62C\uBC14\uB978 \uC8FC\uBB38 \uB9C1\uD06C\uC778\uC9C0 \uD655\uC778\uD574\uC8FC\uC138\uC694",
  orderCompleteTitle: "\uC8FC\uBB38\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
  orderCompleteDesc:
    "\uC544\uB798 \uACC4\uC88C\uB85C \uC785\uAE08\uD574\uC8FC\uC2DC\uBA74 \uD655\uC778 \uD6C4 \uC774\uBA54\uC77C\uB85C \uC804\uC790\uCC45\uC744 \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4",
  depositInfo: "\uC785\uAE08 \uC815\uBCF4",
  bankNameLabel: "\uC740\uD589\uBA85",
  accountNumberLabel: "\uACC4\uC88C\uBC88\uD638",
  accountHolderLabel: "\uC608\uAE08\uC8FC",
  depositAmount: "\uC785\uAE08 \uAE08\uC561",
  orderInfo: "\uC8FC\uBB38 \uC815\uBCF4",
  orderId: "\uC8FC\uBB38\uBC88\uD638",
  orderName: "\uC8FC\uBB38\uC790",
  depositor: "\uC785\uAE08\uC790\uBA85",
  email: "\uC774\uBA54\uC77C",
  note1: "\uC785\uAE08 \uD655\uC778\uC740 \uC601\uC5C5\uC77C \uAE30\uC900 1-2\uC2DC\uAC04 \uB0B4\uC5D0 \uCC98\uB9AC\uB429\uB2C8\uB2E4",
  note2Prefix: "\uC785\uAE08 \uD655\uC778 \uD6C4 ",
  note2Suffix: "\uC73C\uB85C \uB2E4\uC6B4\uB85C\uB4DC \uB9C1\uD06C\uAC00 \uBC1C\uC1A1\uB429\uB2C8\uB2E4",
  back: "\uB3CC\uC544\uAC00\uAE30",
  review: "\uD6C4\uAE30 \uC791\uC131\uD558\uAE30",
  invalidTitle: "\uC798\uBABB\uB41C \uC811\uADFC\uC785\uB2C8\uB2E4",
  invalidDesc: "\uAD6C\uB9E4 \uD398\uC774\uC9C0\uC5D0\uC11C \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694",
  loading: "\uB85C\uB529 \uC911..",
};

async function PurchaseCompleteContent({ orderId }: { orderId: string }) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("bank_name, account_number, account_holder")
    .single();

  const bankInfo = {
    bankName: settings?.bank_name || "\uD1A0\uC2A4\uBC45\uD06C",
    accountNumber: settings?.account_number || "1908-6747-9631",
    accountHolder: settings?.account_holder || "\uC11C\uC601\uC870",
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">{TEXT.orderNotFoundTitle}</h1>
          <p className="text-muted-foreground mt-2">{TEXT.orderNotFoundDesc}</p>
        </div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat("ko-KR").format(order.amount);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">{TEXT.orderCompleteTitle}</h1>
          <p className="text-muted-foreground mt-2">{TEXT.orderCompleteDesc}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            {TEXT.depositInfo}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <span className="text-sm text-muted-foreground">{TEXT.bankNameLabel}</span>
              <span className="font-medium text-foreground">{bankInfo.bankName}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <span className="text-sm text-muted-foreground">{TEXT.accountNumberLabel}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{bankInfo.accountNumber}</span>
                <CopyButton text={bankInfo.accountNumber} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <span className="text-sm text-muted-foreground">{TEXT.accountHolderLabel}</span>
              <span className="font-medium text-foreground">{bankInfo.accountHolder}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-sm text-primary">{TEXT.depositAmount}</span>
              <span className="text-xl font-bold text-primary">
                {formattedAmount}
                {"\uC6D0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4">{TEXT.orderInfo}</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{TEXT.orderId}</span>
              <span className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{TEXT.orderName}</span>
              <span className="text-foreground">{order.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{TEXT.depositor}</span>
              <span className="text-foreground">{order.depositor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{TEXT.email}</span>
              <span className="text-foreground">{order.email}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted">
            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{TEXT.note1}</p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted">
            <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {TEXT.note2Prefix}
              <strong className="text-foreground">{order.email}</strong>
              {TEXT.note2Suffix}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">{TEXT.back}</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/#reviews">{TEXT.review}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function PurchaseCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">{TEXT.invalidTitle}</h1>
          <p className="text-muted-foreground mt-2">{TEXT.invalidDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">{TEXT.loading}</div>
        </div>
      }
    >
      <PurchaseCompleteContent orderId={orderId} />
    </Suspense>
  );
}
