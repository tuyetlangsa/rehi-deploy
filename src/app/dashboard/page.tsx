"use client";

import React, { useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  LucideIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/navigation";
import { useGetDashboardData } from "@/hooks/use-dashboard";

// Type Definitions
interface RevenueDataPoint {
  month: string;
  value: number;
}

interface PlanDistributionItem {
  name?: string | number;
  value: number;
  color: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  color: string;
}

// Constants
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim());

// Components
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" color="black" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {trend && trendValue && (
          <span
            className={`text-sm flex items-center ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trendValue}
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

interface PieChartLegendProps {
  data: PlanDistributionItem[];
  centered?: boolean;
}

const PieChartLegend = ({ data, centered = false }: PieChartLegendProps) => (
  <div className={`space-y-2 ${centered ? "flex justify-center gap-6" : ""}`}>
    {data.map((item, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-sm text-muted-foreground">
          {item.name ?? item.value}
        </span>
      </div>
    ))}
  </div>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-blue-500 text-white p-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm">${payload[0].value}M</p>
      </div>
    );
  }
  return null;
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = React.useState<string>("2025");
  const { user, isLoading } = useUser();
  const router = useRouter();
  const {
    mutate: fetchDashboardData,
    isPending,
    data: dashboardData,
  } = useGetDashboardData();

  useEffect(() => {
    if (!isLoading && (!user || !ADMIN_EMAILS.includes(user.email || ""))) {
      router.push("/");
    } else if (!isLoading && user && ADMIN_EMAILS.includes(user.email || "")) {
      fetchDashboardData();
    }
  }, [user, isLoading, router, fetchDashboardData]);

  if (isLoading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Access Denied
      </div>
    );
  }

  // Extract data from API response
  const dashboardInfo = dashboardData?.dashboard;
  const totalUsers = dashboardInfo?.totalUser?.value || 0;
  const newUsers = dashboardInfo?.newUser?.value || 0;
  const newUserChange = dashboardInfo?.newUser?.monthOverMonthChange || 0;
  const totalRevenue = dashboardInfo?.totalRevenue?.value || 0;
  const revenueChange = dashboardInfo?.revenueChange?.value || 0;
  const revenueChangeFormatted =
    dashboardInfo?.totalRevenue?.monthOverMonthChange || 0;
  const subscriptions = dashboardInfo?.recentSubscriptions || [];
  const revenueData = dashboardInfo?.revenueChartDatas || [];
  const planData = dashboardInfo?.planDistributionChartDatas || [];
  const billingData = dashboardInfo?.billingDistributionChartDatas || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rehi</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Dashboard
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={totalUsers.toLocaleString()}
            icon={Users}
            color="bg-blue-200"
          />
          <StatCard
            title="New Users (This Month)"
            value={newUsers.toLocaleString()}
            icon={Users}
            trend={newUserChange >= 0 ? "up" : "down"}
            trendValue={`${newUserChange}%`}
            color="bg-green-200"
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="bg-blue-200"
          />
          <StatCard
            title="Revenue Change (vs. Last Month)"
            value={`$${revenueChange}`}
            icon={TrendingDown}
            trend={revenueChangeFormatted >= 0 ? "up" : "down"}
            trendValue={`${revenueChangeFormatted}%`}
            color="bg-red-200"
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Annual Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Annual Revenue Chart</CardTitle>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tick={{ fill: "#9ca3af" }}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* New Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                New Subscriptions
                <span className="text-2xl" role="img" aria-label="crown">
                  👑
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3 pr-4">
                  {subscriptions.length > 0 ? (
                    subscriptions.map((sub, idx) => (
                      <div
                        key={`${sub.email}-${idx}`}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm text-muted-foreground truncate flex-1">
                          {sub.email}
                        </span>
                        <span className="text-sm font-semibold ml-2">
                          ${sub.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No recent subscriptions
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-plan-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <PieChartLegend data={planData} />
              </div>
            </CardContent>
          </Card>

          {/* Billing Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Billing Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={billingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    {billingData.map((entry, index) => (
                      <Cell key={`cell-billing-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <PieChartLegend data={billingData} centered />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
