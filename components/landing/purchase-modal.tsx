"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2, Copy, Check } from "lucide-react";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  originalPrice?: number;
  bankInfo?: {
    bank: string;
    account: string;
    holder: string;
  };
  onSubmit: (data: { name: string; email: string; depositorName: string; instagramId: string }) => Promise<void>;
}

export function PurchaseModal({
  isOpen,
  onClose,
  price,
  originalPrice = 38000,
  bankInfo = {
    bank: "토스뱅크",
    account: "1908-6747-9631",
    holder: "서영조",
  },
  onSubmit,
}: PurchaseModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedPrice = new Intl.NumberFormat("ko-KR").format(price);
  const formattedOriginalPrice = new Intl.NumberFormat("ko-KR").format(originalPrice);

  const handleCopyAccount = async () => {
    await navigator.clipboard.writeText(bankInfo.account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !depositorName.trim() || !instagramId.trim()) {
      setError("모든 정보를 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (!agreedToTerms) {
      setError("환불 규정에 동의해주세요.");
      return;
    }

    setShowBankInfo(true);
  };

  const handleConfirmDeposit = async () => {
    setIsLoading(true);
    try {
      await onSubmit({ name, email, depositorName, instagramId });
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showTermsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowTermsModal(false)} />
        <div className="relative w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <button
            onClick={() => setShowTermsModal(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <h3 className="text-lg font-bold text-foreground mb-4">환불/이용 규정 안내</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">제7조(콘텐츠 제공)</p>
              <p className="mt-1">결제 완료 후 다운로드 링크가 이메일로 자동 발송됩니다.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">제8조(환불 불가)</p>
              <p className="mt-1">디지털 콘텐츠 특성상 결제 후 환불이 불가합니다.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">제9조(기타)</p>
              <p className="mt-1">문의는 인스타그램 DM 또는 이메일로 요청해주세요.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">제10조(개인정보 수집 및 이용 동의)</p>
              <p className="mt-1">
                주문 처리 및 다운로드 링크 발송을 위해 이름, 이메일, 인스타그램 아이디, 입금자명을 수집하며, 목적 달성 후 관련 법령에 따라 보관/파기됩니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">제11조(성과 고지)</p>
              <p className="mt-1">
                안내되는 사례와 수익 수치는 참고용이며, 개인의 실행력·경험·시장 상황에 따라 성과는 달라질 수 있습니다.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowTermsModal(false);
              setAgreedToTerms(true);
            }}
            className="w-full mt-6 h-12"
          >
            규정 확인 완료
          </Button>
        </div>
      </div>
    );
  }

  if (showBankInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-foreground text-center mb-2">입금 정보 안내</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            입금 확인 후 다운로드 링크가 이메일로 발송됩니다
          </p>

          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">은행명</span>
                <span className="font-semibold text-foreground">{bankInfo.bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">계좌번호</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{bankInfo.account}</span>
                  <button
                    onClick={handleCopyAccount}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">예금주</span>
                <span className="font-semibold text-foreground">{bankInfo.holder}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">결제 금액</span>
                  <span className="text-2xl font-bold text-primary">{formattedPrice}원</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleConfirmDeposit} disabled={isLoading} className="w-full h-14 text-lg font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  처리 중..
                </>
              ) : (
                "입금완료"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowBankInfo(false)} className="w-full h-12" disabled={isLoading}>
              뒤로가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl p-6 pb-8 shadow-2xl safe-area-bottom animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground">주문 정보 입력</h2>
          <p className="text-sm text-muted-foreground mt-1">아래 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="실명으로 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">전자책 다운로드 링크가 발송될 이메일입니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramId" className="text-foreground">
              인스타그램 아이디 <span className="text-primary">(필수)</span>
            </Label>
            <Input
              id="instagramId"
              type="text"
              placeholder="@your_instagram_id"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="h-12 rounded-xl"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositorName" className="text-foreground">입금자명</Label>
            <Input
              id="depositorName"
              type="text"
              placeholder="입금할 계좌의 예금주명"
              value={depositorName}
              onChange={(e) => setDepositorName(e.target.value)}
              className="h-12 rounded-xl"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-primary font-medium hover:underline"
              >
                환불 불가 규정
              </button>
              (필수)을 확인하였으며 이에 동의합니다.
            </label>
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="p-4 rounded-xl bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">정가</span>
              <span className="text-muted-foreground line-through">{formattedOriginalPrice}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">결제 금액</span>
              <span className="text-2xl font-bold text-primary">{formattedPrice}원</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !agreedToTerms}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                처리 중..
              </>
            ) : (
              "입금 정보 확인"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
