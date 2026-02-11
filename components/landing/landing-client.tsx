"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { TocSection } from "@/components/landing/toc-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { ReviewSection } from "@/components/landing/review-section";
import { FixedPurchaseButton } from "@/components/landing/fixed-purchase-button";
import { PurchaseModal } from "@/components/landing/purchase-modal";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface LandingClientProps {
  initialPrice: number;
  initialOriginalPrice: number;
  initialBankInfo: {
    bank: string;
    account: string;
    holder: string;
  };
  initialSaleEnabled: boolean;
  initialSaleLabel: string;
  initialSaleEndAt: string | null;
}

export function LandingClient({
  initialPrice,
  initialOriginalPrice,
  initialBankInfo,
  initialSaleEnabled,
  initialSaleLabel,
  initialSaleEndAt,
}: LandingClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [price, setPrice] = useState(initialPrice);
  const [originalPrice, setOriginalPrice] = useState(initialOriginalPrice);
  const [bankInfo, setBankInfo] = useState(initialBankInfo);
  const [saleEnabled, setSaleEnabled] = useState(initialSaleEnabled);
  const [saleLabel, setSaleLabel] = useState(initialSaleLabel);
  const [saleEndAt, setSaleEndAt] = useState<string | null>(initialSaleEndAt);
  const [saleRemaining, setSaleRemaining] = useState<string | null>(null);
  const formattedPrice = new Intl.NumberFormat("ko-KR").format(price);
  const formattedOriginalPrice = new Intl.NumberFormat("ko-KR").format(originalPrice);
  const discountRate =
    originalPrice > 0 && price > 0
      ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
      : 0;

  useEffect(() => {
    fetch("/api/visits", { method: "POST" }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!saleEnabled || !saleEndAt) {
      setSaleRemaining(null);
      return;
    }
    const update = () => {
      const end = new Date(saleEndAt);
      const diff = end.getTime() - Date.now();
      if (Number.isNaN(end.getTime()) || diff <= 0) {
        setSaleRemaining(null);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (n: number) => String(n).padStart(2, "0");
      setSaleRemaining(`${days}일 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };
    update();
    const timerId = setInterval(update, 1000);
    return () => clearInterval(timerId);
  }, [saleEnabled, saleEndAt]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (data?.settings) {
          if (typeof data.settings.price === "number") setPrice(data.settings.price);
          if (typeof data.settings.original_price === "number") setOriginalPrice(data.settings.original_price);
          if (data.settings.bank_name && data.settings.account_number && data.settings.account_holder) {
            setBankInfo({
              bank: data.settings.bank_name,
              account: data.settings.account_number,
              holder: data.settings.account_holder,
            });
          }
          if (typeof data.settings.sale_enabled === "boolean") setSaleEnabled(data.settings.sale_enabled);
          if (typeof data.settings.sale_label === "string") setSaleLabel(data.settings.sale_label);
          if (data.settings.sale_end_at === null || typeof data.settings.sale_end_at === "string") {
            setSaleEndAt(data.settings.sale_end_at);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    const interval = setInterval(fetchSettings, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchaseSubmit = async (data: {
    name: string;
    email: string;
    depositorName: string;
    instagramId: string;
  }) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        amount: price,
      }),
    });

    if (!response.ok) {
      throw new Error("Order creation failed");
    }

    const { orderId } = await response.json();
    router.push(`/purchase-complete?orderId=${orderId}`);
  };

  return (
    <main className="min-h-screen pb-28">
      {saleEnabled && saleRemaining && (
        <div className="fixed bottom-36 left-4 z-50">
          <div className="sale-badge relative rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white border border-white/20 shadow-[0_16px_40px_rgba(249,115,22,0.35)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">SALE</span>
              <span className="text-xs font-semibold tracking-wide">{saleLabel || "타임세일"}</span>
              <span className="text-xs font-semibold tabular-nums">{saleRemaining}</span>
            </div>
            <div className="px-4 py-2 text-xs border-t border-white/20 bg-white/10">
              <div className="font-semibold text-white">{discountRate}% 할인</div>
              <div className="text-[11px] text-white/80">
                원가 <span className="line-through opacity-80">{formattedOriginalPrice}원</span>
                <span className="mx-1">→</span>
                할인가 <span className="font-semibold text-white">{formattedPrice}원</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .sale-badge {
          animation: sale-float 2.6s ease-in-out infinite;
        }
        @keyframes sale-float {
          0% {
            transform: translateY(0) rotate(-0.4deg);
          }
          50% {
            transform: translateY(-6px) rotate(0.4deg);
          }
          100% {
            transform: translateY(0) rotate(-0.4deg);
          }
        }
      `}</style>
      <HeroSection price={price} originalPrice={originalPrice} saleEnabled={saleEnabled} saleLabel={saleLabel} saleEndAt={saleEndAt} />
      <TocSection />
      <BenefitsSection />
      <TestimonialsSection />
      <ReviewSection />

      <section className="px-6 py-12">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">문의하기</h3>
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href="https://www.instagram.com/korea_agent_hub/" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5" />
              인스타그램 문의
            </a>
          </Button>
        </div>
      </section>

      <div className="h-20" />

      <FixedPurchaseButton
        onPurchaseClick={() => setIsModalOpen(true)}
        price={price}
        originalPrice={originalPrice}
      />

      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        price={price}
        originalPrice={originalPrice}
        bankInfo={bankInfo}
        onSubmit={handlePurchaseSubmit}
      />
    </main>
  );
}
