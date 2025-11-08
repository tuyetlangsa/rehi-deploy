"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateSubscription } from "@/hooks/use-subscription";
import { Spinner } from "./ui/shadcn-io/spinner";
import Image from "next/image";
import { Check, AlertCircle } from "lucide-react";

interface SubscribeDialogProps {
  open: boolean;
  onClose: () => void;
  subscriptionId: string;
  provider?: string;
}

const PROVIDERS = [
  {
    id: "payos",
    label: "PayOS",
    icon: "/icons/payos.png",
    description: "Fast & secure local payment",
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: "/icons/paypal.png",
    description: "Global payment solution",
  },
];

export function SubscribeDialog({
  open,
  onClose,
  subscriptionId,
  provider,
}: SubscribeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(
    provider || null
  );

  const createSubscription = useCreateSubscription();

  // Sync selectedProvider with provider prop when dialog opens
  useEffect(() => {
    if (open && provider) {
      setSelectedProvider(provider);
    }
  }, [open, provider]);

  const handleSubscribe = async () => {
    if (!selectedProvider) {
      setError("Please select a payment provider");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createSubscription.mutateAsync({
        subscriptionId,
        provider: selectedProvider,
      });

      if (result?.approvalUrl) {
        window.location.href = result.approvalUrl;
      } else {
        setError("Unable to retrieve payment URL. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSelectedProvider(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Payment Method</DialogTitle>
          <DialogDescription>
            Select your preferred payment provider to complete your subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Options */}
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setError(null);
                }}
                disabled={loading}
                className={`
                  relative flex flex-col items-center justify-center
                  p-4 rounded-lg border-2 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }
                `}
                aria-label={`Select ${provider.label}`}
                aria-pressed={selectedProvider === provider.id}
              >
                {/* Selection Indicator */}
                {selectedProvider === provider.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                {/* Provider Icon */}
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <Image
                    src={provider.icon}
                    alt={`${provider.label} logo`}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>

                {/* Provider Info */}
                <span className="font-semibold text-sm mb-1">
                  {provider.label}
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  {provider.description}
                </span>
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Spinner variant="bars" />
              <p className="text-sm text-muted-foreground">
                Redirecting to payment...
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={!selectedProvider || loading}
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
