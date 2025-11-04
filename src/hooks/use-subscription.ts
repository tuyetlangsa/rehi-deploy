import {
  cancelSubscription,
  createSubscription,
  validateUserSubscription,
} from "@/lib/api/subscription";
import queryClient from "@/lib/queryClient";
import { useSubscriptionStore } from "@/store/subscription-store";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useValidateSubscription() {
  const query = useQuery({
    queryKey: ["validate-subscription"],
    queryFn: validateUserSubscription,
    staleTime: 1000 * 60,
  });

  if (query.data) {
    useSubscriptionStore.getState().setSubscription(query.data);
  }

  return query;
}

export const useCreateSubscription = () => {
  const mutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validate-subscription"] });
    },
  });

  return mutation;
};

export const useCancelSubscription = () => {
  const mutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validate-subscription"] });
    },
  });

  return mutation;
};