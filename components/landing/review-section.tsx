"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

export function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [depositorName, setDepositorName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (!depositorName.trim()) {
      setError("입금자명을 입력해주세요.");
      return;
    }
    setError("");
    setIsVerified(true);
    setShowVerifyModal(false);
    setShowWriteModal(true);
  };

  const handleSubmitReview = async () => {
    if (!content.trim()) {
      setError("후기를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositorName, rating, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "후기 작성에 실패했습니다.");
        return;
      }

      setShowWriteModal(false);
      setDepositorName("");
      setRating(5);
      setContent("");
      setIsVerified(false);
      await fetchReviews();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="px-6 py-16">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">구매자 후기</h2>
            <p className="text-muted-foreground text-sm mt-1">실제 구매자의 후기를 확인하세요</p>
          </div>
          <Button variant="outline" onClick={() => setShowVerifyModal(true)}>
            후기 작성
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">아직 등록된 후기가 없습니다</p>
          </div>
        ) : (
          <>
          <div className="space-y-4">
            {(showAll ? reviews : reviews.slice(0, 3)).map((review) => (
              <div key={review.id} className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{review.author_name?.charAt(0) || "?"}</span>
                    </div>
                    <span className="font-medium text-foreground">{review.author_name?.charAt(0)}{"**"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <RatingStars rating={review.rating} size="sm" className="mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
          {reviews.length > 3 && (
            <div className="pt-4 text-center">
              <Button variant="outline" onClick={() => setShowAll((prev) => !prev)} className="w-full sm:w-auto">
                {showAll ? "접기" : "후기 더보기"}
              </Button>
            </div>
          )}
          </>
        )}
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowVerifyModal(false)} />
          <div className="relative w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h3 className="text-lg font-bold text-foreground mb-2">입금자명 확인</h3>
            <p className="text-sm text-muted-foreground mb-4">구매 시 입력한 입금자명을 입력해주세요</p>
            <Input
              placeholder="입금자명"
              value={depositorName}
              onChange={(e) => setDepositorName(e.target.value)}
              className="h-12 mb-4"
            />
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <Button onClick={handleVerify} className="w-full h-12">
              확인
            </Button>
          </div>
        </div>
      )}

      {showWriteModal && isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowWriteModal(false)} />
          <div className="relative w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowWriteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h3 className="text-lg font-bold text-foreground mb-4">후기 작성</h3>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">별점</p>
              <RatingStars rating={rating} size="lg" onChange={setRating} />
              <p className="text-xs text-muted-foreground mt-2">0.5점 단위로 선택할 수 있어요.</p>
            </div>

            <Textarea
              placeholder="후기를 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] mb-4"
            />

            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full h-12">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중..
                </>
              ) : (
                "후기 등록"
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
