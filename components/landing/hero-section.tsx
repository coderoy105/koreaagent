"use client";

import { useState, useEffect } from "react";
import { Sparkles, Settings, DollarSign, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSectionProps {
  price: number;
  originalPrice: number;
  saleEnabled?: boolean;
  saleLabel?: string;
  saleEndAt?: string | null;
}

export function HeroSection({ price, originalPrice, saleEnabled, saleLabel, saleEndAt }: HeroSectionProps) {
  const formattedPrice = new Intl.NumberFormat("ko-KR").format(price);
  const formattedOriginal = new Intl.NumberFormat("ko-KR").format(originalPrice);
  const [saleRemaining, setSaleRemaining] = useState<string | null>(null);

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

  const proofImages = [
    "/revenue-proof.png",
    "/revenue-proof-1.jpg",
    "/revenue-proof-2.jpg",
    "/revenue-proof-3.jpg",
    "/revenue-proof-4.jpg",
    "/revenue-proof-5.jpg",
    "/revenue-proof-6.jpg",
  ];
  const [proofIndex, setProofIndex] = useState(0);
  const handlePrev = () => {
    setProofIndex((prev) => (prev - 1 + proofImages.length) % proofImages.length);
  };

  const handleNext = () => {
    setProofIndex((prev) => (prev + 1) % proofImages.length);
  };
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {saleEnabled && saleRemaining && null}

        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
          <span>중학생때 순수익 1,800만원 달성</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl text-balance">
          두쫀쿠 2개 가격
          <span className="block mt-2 text-primary">{formattedPrice}원</span>
          <span className="block mt-3 text-foreground text-xl sm:text-2xl">
            4년간의 노하우를 압축한 매뉴얼
          </span>
          <span className="block mt-2 text-foreground text-2xl sm:text-3xl">
            중학생때 무자본으로 시작해 순수익 1,800만원
          </span>
        </h1>

        <div className="mt-10 p-6 bg-card rounded-2xl border border-border shadow-lg">
          <p className="text-sm font-medium text-muted-foreground mb-4">하루 10분으로 수익 흐름 완성</p>
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2 p-3 bg-primary/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-foreground">제품 제작</span>
            </div>
            <ArrowRight className="w-5 h-5 text-primary hidden sm:block" />
            <div className="flex flex-col items-center gap-2 p-3 bg-primary/10 rounded-xl">
              <Settings className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-foreground">자동 판매</span>
            </div>
            <ArrowRight className="w-5 h-5 text-primary hidden sm:block" />
            <div className="flex flex-col items-center gap-2 p-3 bg-primary/10 rounded-xl">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-foreground">수익 실현</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-muted/60 rounded-2xl border-2 border-primary/30 shadow-xl">
          <p className="text-sm font-medium text-primary mb-3">실제 수익 인증</p>
          <div className="relative overflow-hidden rounded-xl border border-border bg-background">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${proofIndex * 100}%)` }}
            >
              {proofImages.map((src, index) => (
                <div key={src} className="min-w-full aspect-video flex items-center justify-center bg-muted/40">
                  <img
                    src={src}
                    alt={`실제 수익 인증 이미지 ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 border border-border shadow-sm hover:bg-background"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 border border-border shadow-sm hover:bg-background"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            {proofImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setProofIndex(index)}
                className={`h-2 w-2 rounded-full ${index === proofIndex ? "bg-primary" : "bg-muted-foreground/40"}`}
                aria-label={`이미지 ${index + 1} 보기`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">* 실제 수익 인증 이미지가 표시됩니다</p>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">1,800만원+</p>
            <p className="text-sm text-muted-foreground">순수익</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p className="text-sm text-muted-foreground">무자본</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{formattedOriginal}원</p>
            <p className="text-sm text-muted-foreground">원가</p>
          </div>
        </div>
      </div>
    </section>
  );
}
