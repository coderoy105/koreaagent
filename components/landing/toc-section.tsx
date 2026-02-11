"use client";

import { CheckCircle2 } from "lucide-react";

const CHAPTERS = [
  {
    number: "01",
    title: "\uC0AC\uB840 \uAC80\uC99D \uD504\uB86D\uB7A8",
    description: "\uC2E4\uC81C \uC131\uACFC \uAE30\uB85D \uAE30\uBC18\uC73C\uB85C \uC804\uCCB4 \uD750\uB984 \uC774\uD574",
  },
  {
    number: "02",
    title: "\uB9AC\uC2A4\uD2B8 \uD50C\uB85C\uC6B0",
    description: "\uACE0\uAC1D \uC720\uC785 \uACBD\uB85C\uB97C \uC124\uACC4\uD558\uB294 \uBC29\uBC95",
  },
  {
    number: "03",
    title: "\uC790\uB3D9 DM \uC2DC\uC2A4\uD15C",
    description: "\uBB3C\uC5B4\uBCF4\uAE30 -> \uC81C\uC548 -> \uAD6C\uB9E4\uB85C \uC5F0\uACB0",
  },
  {
    number: "04",
    title: "\uBB34\uC778 \uACB0\uC81C \uD750\uB984",
    description: "\uC785\uAE08 \uD655\uC778 \uD6C4 \uB2E4\uC6B4\uB85C\uB4DC \uB9C1\uD06C \uC790\uB3D9 \uBC1C\uC1A1",
  },
  {
    number: "05",
    title: "\uC6B4\uC601 \uC9C0\uD45C \uAD00\uB9AC",
    description: "\uC9C0\uD45C \uB300\uC2DC\uBCF4\uB4DC\uB85C \uBC30\uC6B0\uB294 \uC870\uAC74 \uAC1C\uC120",
  },
  {
    number: "06",
    title: "\uBC14\uB85C \uC4F0\uB294 \uD15C\uD50C\uB9BF",
    description: "\uD15C\uD50C\uB9BF \uC81C\uACF5 -> \uC9C1\uC811 \uC801\uC6A9 -> \uC131\uACFC \uAC80\uC99D",
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
