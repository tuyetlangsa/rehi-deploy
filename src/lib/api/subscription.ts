import { http } from "@/lib/http";
import { SubscriptionPlan } from "@/model/subscription";

export type ValidateUserSubscriptionResponse = {
  plan: SubscriptionPlan | null;
};

export type CreateSubscriptionResponse = {
  approvalUrl: string;
  subscriptionId: string;
  provider: string;
};

export type cancelSubscriptionResponse = {
  success: boolean;
  message: string;
};

export const validateUserSubscription = async () => {
  try {
    const res = await http.get<ValidateUserSubscriptionResponse>(
      "/subscriptions/validate"
    );
    return res.data?.plan ?? null;
  } catch (err: any) {
    console.error(
      "Subscription validation failed:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};

export const createSubscription = async ({
  subscriptionId,
  provider,
}: {
  subscriptionId: string;
  provider: string;
}) => {
  try {
    const res = await http.post<CreateSubscriptionResponse>(
      "/subscriptions/create",
      { subscriptionId, provider }
    );
    if (!res.data) {
      throw new Error("No data returned from createSubscription API");
    }
    return res.data;
  } catch (err: any) {
    console.error(
      "Subscription creation failed:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};

export const cancelSubscription = async ({
  provider,
}: {
  provider: string;
}) => {
  try {
    const res = await http.patch<cancelSubscriptionResponse>(
      "/subscriptions/cancel",
      { provider }
    );
    return res.data;
  } catch (err: any) {
    console.error(
      "Subscription cancellation failed:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};
