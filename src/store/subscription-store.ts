import { create } from "zustand";
import { SubscriptionPlan } from "@/model/subscription";
import { validateUserSubscription } from "@/lib/api/subscription";

interface SubscriptionStore {
  subscription: SubscriptionPlan | null;
  setSubscription: (plan: SubscriptionPlan | null) => Promise<void>;
  fetch : () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription: null,
  setSubscription: async (plan) => {
    set({ subscription: plan });
  },
  fetch: async () => {
    const plan = await validateUserSubscription();
    set({ subscription: plan });
  }
}));
