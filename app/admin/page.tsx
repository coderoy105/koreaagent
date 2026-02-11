"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from "@/components/admin/admin-stats";
import { RatingStars } from "@/components/ui/rating-stars";
import {
  Lock,
  RefreshCw,
  LogOut,
  Clock,
  CheckCircle,
  Mail,
  Trash2,
  Eye,
  Settings,
  Star,
  Edit2,
  X,
  Save,
  Loader2,
} from "lucide-react";

interface Order {
  id: string;
  name: string;
  email: string;
  depositor_name: string;
  instagram_id?: string;
  amount: number;
  status: "pending" | "completed";
  created_at: string;
  completed_at: string | null;
}

interface Review {
  id: string;
  author_name: string;
  depositor_name: string;
  rating: number;
  content: string;
  created_at: string;
}

interface DailyVisit {
  date: string;
  count: number;
}

interface SiteSettings {
  bank_name: string;
  account_number: string;
  account_holder: string;
  price: number;
  original_price: number;
  book_cover_url: string;
  ebook_download_urls: string[];
  download_email_text: string;
  sale_enabled: boolean;
  sale_label: string;
  sale_end_at: string | null;
  download_email_subject: string;
  download_email_heading: string;
  ebook_download_links: { name: string; url: string }[];
}

const ADMIN_PASSWORD = "youngjo12#";

const defaultSettings: SiteSettings = {
  bank_name: "\uD1A0\uC2A4\uBC45\uD06C",
  account_number: "1908-6747-9631",
  account_holder: "\uC11C\uC601\uC870",
  price: 13000,
  original_price: 38000,
  book_cover_url: "",
  ebook_download_urls: [],
  download_email_text: "",
  sale_enabled: false,
  sale_label: "\uC124\uB0A0 \uC138\uC77C",
  sale_end_at: null,
  download_email_subject: "Download links",
  download_email_heading: "Download links",
  ebook_download_links: [],
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [deletingOrders, setDeletingOrders] = useState<Set<string>>(new Set());
  const [deletingReviews, setDeletingReviews] = useState<Set<string>>(new Set());
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const normalizeSettings = (input?: Partial<SiteSettings>): SiteSettings => ({
    bank_name: input?.bank_name ?? defaultSettings.bank_name,
    account_number: input?.account_number ?? defaultSettings.account_number,
    account_holder: input?.account_holder ?? defaultSettings.account_holder,
    price: typeof input?.price === "number" ? input.price : defaultSettings.price,
    original_price: typeof input?.original_price === "number" ? input.original_price : defaultSettings.original_price,
    book_cover_url: input?.book_cover_url ?? defaultSettings.book_cover_url,
    ebook_download_urls: Array.isArray(input?.ebook_download_urls)
      ? input.ebook_download_urls.filter((url) => typeof url === "string" && url.trim().length > 0)
      : defaultSettings.ebook_download_urls,
    download_email_text: typeof input?.download_email_text === "string"
      ? input.download_email_text
      : defaultSettings.download_email_text,
    sale_enabled: Boolean(input?.sale_enabled),
    sale_label: typeof input?.sale_label === "string" && input.sale_label.trim().length > 0
      ? input.sale_label
      : defaultSettings.sale_label,
    sale_end_at: typeof input?.sale_end_at === "string" && input.sale_end_at.trim().length > 0
      ? input.sale_end_at
      : defaultSettings.sale_end_at,
    download_email_subject: typeof input?.download_email_subject === "string" && input.download_email_subject.trim().length > 0
      ? input.download_email_subject
      : defaultSettings.download_email_subject,
    download_email_heading: typeof input?.download_email_heading === "string" && input.download_email_heading.trim().length > 0
      ? input.download_email_heading
      : defaultSettings.download_email_heading,
    ebook_download_links: Array.isArray(input?.ebook_download_links)
      ? input.ebook_download_links
          .map((link) => ({
            name: typeof link?.name === "string" ? link.name : "",
            url: typeof link?.url === "string" ? link.url : "",
          }))
          .filter((link) => link.url.trim().length > 0)
      : defaultSettings.ebook_download_links,
  });

  const applyEmailSnippet = (snippet: string) => {
    setSettings((prev) => ({
      ...prev,
      download_email_text: prev.download_email_text
        ? `${prev.download_email_text}\n\n${snippet}`
        : snippet,
    }));
  };

  const insertToken = (token: string) => {
    setSettings((prev) => ({
      ...prev,
      download_email_text: `${prev.download_email_text}${token}`,
    }));
  };

  const toLocalDateTimeInput = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fromLocalDateTimeInput = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const setThreeDaySale = () => {
    const end = new Date();
    end.setDate(end.getDate() + 3);
    setSettings((prev) => ({
      ...prev,
      sale_enabled: true,
      sale_end_at: end.toISOString(),
    }));
  };

  const getInstagramUrl = (instagramId?: string) => {
    if (!instagramId) return null;
    const handle = instagramId.replace(/^@/, "");
    return `https://www.instagram.com/${handle}`;
  };

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  }, []);

  const fetchDailyVisits = useCallback(async () => {
    try {
      const response = await fetch("/api/visits/daily?days=14");
      const data = await response.json();
      setDailyVisits(data.daily || []);
    } catch (error) {
      console.error("Failed to fetch daily visits:", error);
    }
  }, []);

  const fetchVisitCount = useCallback(async () => {
    try {
      const response = await fetch("/api/visits");
      const data = await response.json();
      setVisitCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch visit count:", error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.settings) {
        setSettings(normalizeSettings(data.settings));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchOrders(), fetchReviews(), fetchVisitCount(), fetchDailyVisits(), fetchSettings()]);
    setIsLoading(false);
  }, [fetchOrders, fetchReviews, fetchVisitCount, fetchDailyVisits, fetchSettings]);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    }
  }, [isAuthenticated, fetchAll]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setPasswordError("");
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
    router.refresh();
  };

  const handleCompleteAndSend = async (orderId: string) => {
    setProcessingOrders((prev) => new Set(prev).add(orderId));

    try {
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert("입금 확인 완료! 전자책 다운로드 링크가 이메일로 발송되었습니다.");
        await fetchOrders();
      } else {
        alert(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to complete order:", error);
      alert("처리 중 오류가 발생했습니다");
    } finally {
      setProcessingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("정말로 이 주문을 삭제하시겠습니까?")) return;

    setDeletingOrders((prev) => new Set(prev).add(orderId));

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        alert("삭제 실패");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("삭제 중 오류가 발생했습니다");
    } finally {
      setDeletingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("정말로 이 후기를 삭제하시겠습니까?")) return;

    setDeletingReviews((prev) => new Set(prev).add(reviewId));

    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchReviews();
      } else {
        alert("삭제 실패");
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("삭제 중 오류가 발생했습니다");
    } finally {
      setDeletingReviews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingReview.id,
          rating: editingReview.rating,
          content: editingReview.content,
        }),
      });

      if (response.ok) {
        setEditingReview(null);
        await fetchReviews();
      } else {
        alert("수정 실패");
      }
    } catch (error) {
      console.error("Failed to update review:", error);
      alert("수정 중 오류가 발생했습니다");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("설정이 저장되었습니다.");
      } else {
        alert("저장 실패");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("저장 중 오류가 발생했습니다");
    } finally {
      setIsSavingSettings(false);
    }
  };


  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">관리자 로그인</h1>
            <p className="text-muted-foreground mt-2">관리자 비밀번호를 입력해주세요</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <Button type="submit" className="w-full h-12">
              로그인
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // Admin dashboard
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">관리자 대시보드</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Visit Count Banner */}
        <div className="mb-4 p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3">
          <Eye className="w-6 h-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">총 방문 횟수</p>
            <p className="text-2xl font-bold text-primary">{visitCount.toLocaleString()}회</p>
          </div>
        </div>

        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <p className="font-semibold text-foreground">{"\uB0A0\uC9DC\uBCC4 \uBC29\uBB38 \uD69F\uC218"}</p>
            </div>
            <span className="text-xs text-muted-foreground">{"\uCD5C\uADFC 14\uC77C"}</span>
          </div>
          {dailyVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground">{"\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {dailyVisits.map((item) => (
                <div key={item.date} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <span className="text-muted-foreground">{item.date}</span>
                  <span className="font-medium text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <AdminStats
          totalOrders={orders.length}
          pendingCount={pendingOrders.length}
          completedCount={completedOrders.length}
          totalRevenue={totalRevenue}
        />

        {/* Tabs */}
        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">주문 관리</TabsTrigger>
            <TabsTrigger value="reviews">후기 관리</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">
                    입금 대기 중 ({pendingOrders.length}건)
                  </h2>
                </div>
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="bg-card border-2 border-accent/30 rounded-xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded text-foreground">
                              {order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-accent/20 text-accent-foreground">
                              <Clock className="w-3 h-3" />
                              대기중
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground block">주문자</span>
                              <span className="font-medium text-foreground">{order.name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">입금자명</span>
                              <span className="font-medium text-foreground">{order.depositor_name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">인스타그램</span>
                              {order.instagram_id ? (
                                <a
                                  href={getInstagramUrl(order.instagram_id) || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline"
                                >
                                  {order.instagram_id}
                                </a>
                              ) : (
                                <span className="font-medium text-foreground">-</span>
                              )}
                            </div>
                            <div>
                              <span className="text-muted-foreground block">금액</span>
                              <span className="font-bold text-foreground">
                                {new Intl.NumberFormat("ko-KR").format(order.amount)}원
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">이메일</span>
                              <span className="text-foreground truncate block">{order.email}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            주문일시: {new Date(order.created_at).toLocaleString("ko-KR")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="lg"
                            onClick={() => handleCompleteAndSend(order.id)}
                            disabled={processingOrders.has(order.id)}
                            className="gap-2 h-12"
                          >
                            {processingOrders.has(order.id) ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                처리 중...
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4" />
                                입금 확인 & 발송
                              </>
                            )}
                          </Button>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deletingOrders.has(order.id)}
                            className="h-12"
                          >
                            {deletingOrders.has(order.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Pending Orders */}
            {pendingOrders.length === 0 && (
              <div className="mb-8 p-8 bg-card rounded-xl border border-border text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                <h3 className="font-medium text-foreground">대기 중인 주문이 없습니다</h3>
                <p className="text-sm text-muted-foreground mt-1">새로운 주문이 들어오면 여기에 표시됩니다</p>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    발송 완료 ({completedOrders.length}건)
                  </h2>
                </div>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {completedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 flex flex-col md:flex-row md:items-center gap-3"
                      >
                        <div className="flex-1 flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-mono bg-muted px-2 py-1 rounded text-foreground">
                            {order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-foreground">{order.name}</span>
                          <span className="text-muted-foreground">{order.email}</span>
                          {order.instagram_id ? (
                            <a
                              href={getInstagramUrl(order.instagram_id) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {order.instagram_id}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          <span className="font-medium text-foreground">
                            {new Intl.NumberFormat("ko-KR").format(order.amount)}원
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            <CheckCircle className="w-3 h-3" />
                            발송완료
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.completed_at && new Date(order.completed_at).toLocaleString("ko-KR")}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deletingOrders.has(order.id)}
                          >
                            {deletingOrders.has(order.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">후기 관리 ({reviews.length}건)</h2>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 bg-card rounded-xl border border-border text-center">
                <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-foreground">등록된 후기가 없습니다</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">{review.author_name}</span>
                          <span className="text-sm text-muted-foreground">({review.depositor_name})</span>
                          <RatingStars rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingReview(review)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviews.has(review.id)}
                        >
                          {deletingReviews.has(review.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{"\uC0AC\uC774\uD2B8 \uC124\uC815"}</h2>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{"\uC740\uD589\uBA85"}</Label>
                  <Input
                    value={settings.bank_name}
                    onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"\uACC4\uC88C\uBC88\uD638"}</Label>
                  <Input
                    value={settings.account_number}
                    onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"\uC608\uAE08\uC8FC"}</Label>
                  <Input
                    value={settings.account_holder}
                    onChange={(e) => setSettings({ ...settings, account_holder: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"\uD310\uB9E4 \uAC00\uACA9(\uC6D0)"}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={String(settings.price)}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      setSettings({ ...settings, price: digits ? Number(digits) : 0 });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"\uC815\uAC00(\uC6D0)"}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={String(settings.original_price)}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      setSettings({ ...settings, original_price: digits ? Number(digits) : 0 });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{"\uB2E4\uC6B4\uB85C\uB4DC \uB9C1\uD06C (\uC774\uBA54\uC77C\uC5D0 \uC0BD\uC785)"}</Label>
                <div className="space-y-3">
                  {((settings.ebook_download_links ?? []).length > 0
                    ? settings.ebook_download_links ?? []
                    : [{ name: "", url: "" }]
                  ).map((link, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-2 items-center">
                      <Input
                        placeholder="\uB9C1\uD06C \uC774\uB984"
                        value={link.name ?? ""}
                        onChange={(e) => {
                          const next = [...(settings.ebook_download_links ?? [])];
                          while (next.length <= index) next.push({ name: "", url: "" });
                          next[index] = { ...next[index], name: e.target.value };
                          setSettings({ ...settings, ebook_download_links: next });
                        }}
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url ?? ""}
                        onChange={(e) => {
                          const next = [...(settings.ebook_download_links ?? [])];
                          while (next.length <= index) next.push({ name: "", url: "" });
                          next[index] = { ...next[index], url: e.target.value };
                          setSettings({ ...settings, ebook_download_links: next });
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const next = (settings.ebook_download_links ?? []).filter((_, i) => i != index);
                          setSettings({ ...settings, ebook_download_links: next });
                        }}
                      >
                        {"\uC0AD\uC81C"}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        ebook_download_links: [...(settings.ebook_download_links ?? []), { name: "", url: "" }],
                      })
                    }
                  >
                    {"\uB9C1\uD06C \uCD94\uAC00"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{"\uCD5C\uB300 2\uAC1C\uAE4C\uC9C0 \uCD94\uAC00\uD558\uC138\uC694. \uB9C1\uD06C \uC774\uB984\uC740 \uBA54\uC77C\uC5D0 \uBC84\uD2BC \uD14D\uC2A4\uD2B8\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4."}</p>
                <p className="text-xs text-muted-foreground">{"\uB9C1\uD06C \uC785\uB825\uCE78\uC744 \uBE44\uC6CC\uB3C4 \uBCF8\uBB38\uC5D0 URL\uC774 \uC788\uC73C\uBA74 \uC790\uB3D9 \uCD94\uCD9C\uB429\uB2C8\uB2E4."}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">{"\uB2E4\uC6B4\uB85C\uB4DC \uC774\uBA54\uC77C \uC124\uC815"}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{"\uC774\uBA54\uC77C \uC81C\uBAA9"}</Label>
                    <Input
                      value={settings.download_email_subject ?? ""}
                      onChange={(e) => setSettings({ ...settings, download_email_subject: e.target.value })}
                      placeholder="Download links"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{"\uC774\uBA54\uC77C \uBCF8\uBB38 \uD0C0\uC774\uD2C0"}</Label>
                    <Input
                      value={settings.download_email_heading ?? ""}
                      onChange={(e) => setSettings({ ...settings, download_email_heading: e.target.value })}
                      placeholder="Download links"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {"\uC81C\uBAA9\uC740 \uBA54\uC77C \uD0ED \uC81C\uBAA9, \uBCF8\uBB38 \uD0C0\uC774\uD2C0\uC740 \uBA54\uC77C \uC0C1\uB2E8\uC5D0 \uD06C\uAC8C \uD45C\uC2DC\uB429\uB2C8\uB2E4."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => insertToken('{name}')}>
                    {"{name}"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertToken('{orderId}')}>
                    {"{orderId}"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertToken('{links}')}>
                    {"{links}"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{"\uBC84\uD2BC \uB9C1\uD06C\uB294 \uBCF8\uBB38 \uC544\uB798\uC5D0 \uC790\uB3D9\uC73C\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4. {links}\uB97C \uB123\uC5B4\uB3C4 \uC8FC\uC18C\uAC00 \uADF8\uB300\uB85C \uB178\uCD9C\uB418\uC9C0 \uC54A\uACE0, \uBC84\uD2BC\uC73C\uB85C\uB9CC \uBCF4\uC785\uB2C8\uB2E4."}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => applyEmailSnippet("\uC548\uB155\uD558\uC138\uC694 {name}\uB2D8,\n\uC785\uAE08 \uD655\uC778 \uD6C4 \uC804\uC790\uCC45 \uB2E4\uC6B4\uB85C\uB4DC \uB9C1\uD06C\uB97C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4.\n\uC544\uB798 \uB9C1\uD06C\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.\n\n{links}")}>\n                    {"\uC608\uC2DC \uD15C\uD50C\uB9BF \uCD94\uAC00"}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => applyEmailSnippet("\uC8FC\uBB38\uBC88\uD638: {orderId}\n\uB2E4\uC6B4\uB85C\uB4DC \uB9C1\uD06C:\n{links}")}>\n                    {"\uB2E8\uCD95 \uBC84\uC804"}
                  </Button>
                </div>
                <Textarea
                  value={settings.download_email_text}
                  onChange={(e) => setSettings({ ...settings, download_email_text: e.target.value })}
                  placeholder="{name}\n{orderId}\n{links}"
                  className="min-h-[160px]"
                />
                <p className="text-xs text-muted-foreground">{"{name}, {orderId}, {links} \uD45C\uC2DC\uC5D0 \uC790\uB3D9 \uB300\uCCB4\uB429\uB2C8\uB2E4."}</p>
                <p className="text-xs text-muted-foreground">{"\uC800\uC7A5 \uC2E4\uD328 \uC2DC Supabase\uC5D0 \uCEEC\uB7FC\uC744 \uCD94\uAC00\uD574\uC8FC\uC138\uC694."}</p>
              </div>

              <div className="space-y-2">
                <Label>{"\uD0C0\uC784\uC138\uC77C \uC124\uC815"}</Label>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sale-enabled"
                    checked={settings.sale_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, sale_enabled: Boolean(checked) })
                    }
                  />
                  <label htmlFor="sale-enabled" className="text-sm text-foreground">
                    {"\uC0AC\uC6A9 \uD558\uAE30"}
                  </label>
                </div>
                <Input
                  value={settings.sale_label ?? ""}
                  onChange={(e) => setSettings({ ...settings, sale_label: e.target.value })}
                  placeholder="\uC124\uB0A0 \uC138\uC77C"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    type="datetime-local"
                    value={toLocalDateTimeInput(settings.sale_end_at) ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, sale_end_at: fromLocalDateTimeInput(e.target.value) })
                    }
                  />
                  <Button type="button" variant="outline" onClick={setThreeDaySale}>
                    {"3\uC77C \uD0C0\uC784\uC138\uC77C \uC2DC\uC791"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{"\uC608: \uC124\uB0A0 \uC138\uC77C, \uCD94\uC11D \uC138\uC77C, \uAE30\uD68D \uC138\uC77C"}</p>
              </div>

<Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full md:w-auto">
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {"\uC800\uC7A5 \uC911.."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {"\uC124\uC815 \uC800\uC7A5"}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setEditingReview(null)} />
          <div className="relative w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setEditingReview(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h3 className="text-lg font-bold text-foreground mb-4">{"\uD6C4\uAE30 \uC218\uC815"}</h3>

            <div className="mb-4">
              <Label className="mb-2 block">{"\uBCC4\uC810"}</Label>
              <RatingStars
                rating={editingReview.rating}
                size="lg"
                onChange={(value) => setEditingReview({ ...editingReview, rating: value })}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {"\u0030.5\uC810 \uB2E8\uC704\uB85C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}
              </p>
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">{"\uB0B4\uC6A9"}</Label>
              <Textarea
                value={editingReview.content}
                onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                className="min-h-[120px]"
              />
            </div>

            <Button onClick={handleUpdateReview} className="w-full">
              {"\uC218\uC815 \uC644\uB8CC"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
