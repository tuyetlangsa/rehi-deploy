import { getDashboardData } from "@/lib/api/dashboard";
import { useMutation } from "@tanstack/react-query";

export function useGetDashboardData() {
    const { mutate, isPending, isError, error, data } = useMutation({
        mutationFn: getDashboardData,
        onError: (error) => {
            console.error("Failed to fetch dashboard data:", error);
        }
    });
    
    return { mutate, isPending, isError, error, data };
}