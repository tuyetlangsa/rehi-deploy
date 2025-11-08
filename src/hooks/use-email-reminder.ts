import { setEmailReminder } from "@/lib/api/email-reminder";
import queryClient from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export function useEmailReminder() {
    const mutation = useMutation({
        mutationFn: setEmailReminder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-reminder"] });
        },
    });

    return mutation;
}