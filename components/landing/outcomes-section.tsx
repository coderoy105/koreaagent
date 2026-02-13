"use client";

import { Quote } from "lucide-react";

const STEPS = [
  {
    title: '첫 주: "어? 이게 진짜 되네?"',
    description: "처음 10만원을 벌 때의 그 쾌감을 느껴요.",
  },
  {
    title: '첫 달: "나 진짜 100만원을 벌었어?"',
    description: "친구들한테 자랑하고 싶지만, 비밀로 유지해요.",
  },
  {
    title: '두 달째: "부모님은 뭐라 하셔?"',
    description: '"알바비 받았어" 라고 하면 자연스럽게 넘어가요. 달마다 수익이 점점 올라가는 느낌이 생겨요.',
  },
  {
    title: '세 달째: "이걸 더 키워볼까?"',
    description: "이제 방법을 알았으니까 더 크게 할 수도 있어요.",
  },
];

const CORE_ITEMS = ["학교 다니기", "공부하기", "친구 만나기"];

const QUOTES = [
  {
    label: "조용함의 가치",
    text: "큰 꿈을 말하기보다 작은 행동을 지키는 사람이 결국 크게 성장한다.",
    author: "이병철 (삼성 창립자)",
  },
  {
    label: "말과 실행",
    text: "성공하려면 귀는 열고 입은 닫아라.",
    author: "존 D. 록펠러 (록펠러재단 창립자)",
  },
  {
    label: "평판의 가치",
    text: "평판은 값을 매길 수 없는 자산이다.",
    author: "워런 버핏 (버크셔 해서웨이 회장)",
  },
];

export function OutcomesSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">이 가이드를 사면 뭐가 달라지나요?</h2>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-4 md:p-5">
              <p className="text-sm font-semibold text-foreground md:text-base">✅ {step.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-4 md:px-5">
            <h3 className="text-base font-bold text-foreground md:text-lg">수익을 숨기는 이유</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              유명한 투자자와 창업가들이 반복하는 공통 원칙은 과시보다 복리에 집중하라는 것입니다.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              공개를 줄이면 불필요한 비교와 요청을 줄이고, 실행과 재투자에 집중하기 쉬워집니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 bg-muted/20 p-4 md:p-5">
            {QUOTES.map((quote, idx) => (
              <div
                key={quote.label}
                className="rounded-xl border border-border bg-background p-3.5 shadow-sm transition hover:border-primary/30"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Quote className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {idx + 1}. {quote.label}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-foreground">"{quote.text}"</p>
                <p className="mt-2 text-xs text-muted-foreground">- {quote.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-foreground md:text-xl">가장 중요한 건?</h3>

          <p className="mt-3 text-sm text-muted-foreground">당신이 할 일은 그대로입니다.</p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {CORE_ITEMS.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border/70 bg-background/90 px-3 py-2 text-center text-sm font-semibold text-foreground"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-foreground md:text-base">이거 다 하면서도 자동으로 돈이 들어와요.</p>
            <p className="text-sm text-foreground md:text-base">
              왜? <span className="font-semibold text-primary">AI가 일하거든요.</span>
            </p>
            <p className="text-sm text-foreground md:text-base">당신은 그냥 셋업하고 관리만 하면 돼요.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
