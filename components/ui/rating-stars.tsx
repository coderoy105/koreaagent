import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingSize = "sm" | "md" | "lg";

interface RatingStarsProps {
  rating: number;
  size?: RatingSize;
  className?: string;
  onChange?: (value: number) => void;
}

const sizeClassMap: Record<RatingSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function RatingStars({ rating, size = "sm", className, onChange }: RatingStarsProps) {
  const iconClass = sizeClassMap[size];
  const stars = Array.from({ length: 5 });

  const handleClick = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x <= rect.width / 2;
    const value = isHalf ? index + 0.5 : index + 1;
    onChange(clamp(value, 0.5, 5));
  };

  return (
    <div className={cn("flex gap-0.5", className)}>
      {stars.map((_, index) => {
        const fill = clamp(rating - index, 0, 1);
        const starIcon = (
          <div className="relative">
            <Star className={cn(iconClass, "text-muted fill-muted")} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn(iconClass, "text-primary fill-primary")} />
            </div>
          </div>
        );

        if (!onChange) {
          return <div key={index}>{starIcon}</div>;
        }

        return (
          <button
            key={index}
            type="button"
            onClick={(event) => handleClick(index, event)}
            className="p-0.5"
            aria-label={`별점 ${index + 1}점`}
          >
            {starIcon}
          </button>
        );
      })}
    </div>
  );
}
