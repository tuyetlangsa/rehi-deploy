import { http } from "../http";
export type MetricValue = {
  value: number;
};

export type MetricWithChange = MetricValue & {
  monthOverMonthChange: number;
};

export type RevenueChartData = {
  month: number;
  value: number;
};

export type UserChartData = {
  name: number;
  value: number;
  color: string;
};

export type DashboardData = {
  dashboard: {
    totalUser: MetricValue;
    newUser: MetricWithChange;
    totalRevenue: MetricWithChange;
    revenueChange: MetricValue;
    recentSubscriptions: Subscription[];
    revenueChartDatas: RevenueChartData[];
    planDistributionChartDatas: UserChartData[];
    billingDistributionChartDatas: UserChartData[];
  };
};

export type Subscription = {
  email: string;
  value: number;
  createdAt: string;
};
export const getDashboardData = async () => {
  try {
    const res = await http.post<DashboardData>(`/admin/get-dash-board`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
};
