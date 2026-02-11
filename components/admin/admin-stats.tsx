"use client";

import { Package, Clock, CheckCircle, Wallet } from "lucide-react";

interface AdminStatsProps {
  totalOrders: number;
  pendingCount: number;
  completedCount: number;
  totalRevenue: number;
}

export function AdminStats({
  totalOrders,
  pendingCount,
  completedCount,
  totalRevenue,
}: AdminStatsProps) {
  const formattedRevenue = new Intl.NumberFormat("ko-KR").format(totalRevenue);

  const stats = [
    {
      label: "총 주문",
      value: totalOrders.toString(),
      icon: Package,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "대기 중",
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "완료",
      value: completedCount.toString(),
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "총 매출",
      value: `${formattedRevenue}원`,
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="p-5 bg-card rounded-xl border border-border"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
