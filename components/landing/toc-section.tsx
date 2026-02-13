"use client";

import { CheckCircle2 } from "lucide-react";

const CHAPTERS = [
  {
    number: "01",
    title: "SECTION 1: 상품 정하기",
    description: "어떤 상품을 팔아야 하는지 핵심 기준부터 정리",
  },
  {
    number: "02",
    title: "SECTION 2: 고객 모으기",
    description: "고객 유입 경로를 만들고 문의를 모으는 방법",
  },
  {
    number: "03",
    title: "SECTION 3: 결제 링크와 자동 판매",
    description: "문의에서 결제까지 자동으로 연결되는 구조",
  },
  {
    number: "04",
    title: "SECTION 4: 한번 결제하면 추가 비용 없음 X",
    description: "초기 세팅 이후 유지비를 없애는 운영 구조",
  },
  {
    number: "05",
    title: "SECTION 5: 자동화와 AI 활용",
    description: "시간을 줄이고 효율을 높이는 자동화 운영법",
  },
  {
    number: "06",
    title: "SECTION 6: 지금 바로시작하기",
    description: "오늘 바로 적용할 수 있는 실행 순서 가이드",
  },
];

export function TocSection() {
  return (
    <section className="px-6 py-16 bg-secondary/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">GUIDE MAP</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-3">
            {"\uAC00\uC774\uB4DC \uBAA9\uCC28"}
          </h2>
          <p className="text-muted-foreground mt-3">
            {"\uC9C0\uAE08 \uC5B4\uB290 \uB2E8\uACC4\uB97C \uAC00\uB3C4\uB85D \uC900\uBE44\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {CHAPTERS.map((chapter) => (
            <div
              key={chapter.number}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{chapter.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{chapter.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary/50 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
