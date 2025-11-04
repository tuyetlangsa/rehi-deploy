"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useCreateSubscription } from "@/hooks/use-subscription";

interface SubscribeDialogProps {
  open: boolean;
  onClose: () => void;
  provider: string;
  subscriptionId: string;
}

export function SubscribeDialog({
  open,
  onClose,
  provider,
  subscriptionId,
}: SubscribeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = useCreateSubscription();
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Subscribing to:", subscriptionId, "with provider:", provider);

      const result = await createSubscription.mutateAsync({
        subscriptionId,
        provider,
      });

      console.log("Subscription created:", result);

      if (result?.approvalUrl) {
        window.location.href = result.approvalUrl; // chuyển tới approve URL
      } else {
        setError("Cannot get approval URL");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Subscribe</DialogTitle>
          <DialogDescription>
            {loading && <Spinner variant="bars" className="mx-auto my-4" />}
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </DialogDescription>
        </DialogHeader>

        {!loading && !error && (
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe}>Subscribe</Button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubscribe}>Try Again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
