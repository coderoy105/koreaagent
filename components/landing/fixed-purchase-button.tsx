"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface FixedPurchaseButtonProps {
  onPurchaseClick: () => void;
  price: number;
  originalPrice?: number;
}

export function FixedPurchaseButton({ onPurchaseClick, price, originalPrice }: FixedPurchaseButtonProps) {
  const formattedPrice = new Intl.NumberFormat("ko-KR").format(price);
  const formattedOriginalPrice = originalPrice ? new Intl.NumberFormat("ko-KR").format(originalPrice) : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <Button
          onClick={onPurchaseClick}
          className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          지금 구매하기
          <span className="ml-2 flex items-center gap-2">
            {formattedOriginalPrice && (
              <span className="text-sm line-through opacity-60">{formattedOriginalPrice}원</span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-primary-foreground/20 text-sm">{formattedPrice}원</span>
          </span>
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          입금 확인 후 다운로드 링크가 이메일로 발송됩니다
        </p>
      </div>
    </div>
  );
}