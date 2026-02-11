"use client";

import { Users, Bot, Zap, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "1,800만원+ 순수익",
    description: "0원으로 시작한 실제 수익 사례",
  },
  {
    icon: Bot,
    title: "99% 자동화",
    description: "바로 실행 가능한 ai 자동화 세팅법",
  },
  {
    icon: Zap,
    title: "운영 효율",
    description: "세팅 1일, 운영은 하루 10분",
  },
  {
    icon: Users,
    title: "커뮤니티 성장",
    description: "수강자 20명 이상 함께 조언받고 피드백하며 성장하는 커뮤니티",
  },
];

export function BenefitsSection() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">왜 이 전자책이어야 할까요</h2>
        <p className="text-center text-muted-foreground mb-10">시간과 시행착오를 줄이는 핵심만 모았습니다</p>

        <div className="grid grid-cols-2 gap-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="p-5 rounded-2xl bg-card border border-border text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
