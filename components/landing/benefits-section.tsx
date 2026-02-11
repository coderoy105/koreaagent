"use client";

import { Clock, Target, Zap, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "1,800만원+ 순수익",
    description: "두촌쿠 2개 가격으로 시작한 실제 수익 사례",
  },
  {
    icon: Target,
    title: "100% 실전형",
    description: "바로 실행 가능한 DM 흐름과 자동화 루트",
  },
  {
    icon: Zap,
    title: "운영 효율",
    description: "세팅 1일, 운영은 하루 30분",
  },
  {
    icon: Clock,
    title: "체크리스트 제공",
    description: "실전 체크리스트로 바로 적용",
  },
];

interface BenefitsSectionProps {
  originalPrice: number;
}

export function BenefitsSection({ originalPrice }: BenefitsSectionProps) {
  const formattedOriginal = new Intl.NumberFormat("ko-KR").format(originalPrice);
  return (
    <section className="px-6 py-16">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">왜 이 전자책이어야 할까요</h2>
        <p className="text-center text-muted-foreground mb-10">시간과 시행착오를 줄이는 핵심만 모았습니다</p>

        <div className="grid grid-cols-2 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const description =
              index === 0
                ? benefit.description.replace("두촌쿠 2개 가격", `${formattedOriginal}원 기준`)
                : benefit.description;
            return (
              <div key={benefit.title} className="p-5 rounded-2xl bg-card border border-border text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
