"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookOpen, Check, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useCallback, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSubscriptionStore } from "@/store/subscription-store";
import { useCancelSubscription } from "@/hooks/use-subscription";
import { SubscriptionStatus } from "@/model/subscription";
import { useEmailReminder } from "@/hooks/use-email-reminder";

interface ProfileFormData {
  email: string;
  phone: string;
  username: string;
  reminderTime: string;
}

type EditableField = keyof ProfileFormData;

const DEFAULT_PHONE = "+84 34 944 5821";
const DEFAULT_USERNAME = "Username";
const DEFAULT_REMINDER_TIME = "09:00";

export default function ProfileSettings() {
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { user, isLoading } = useUser();
  const { subscription, fetch: fetchSubscription } = useSubscriptionStore();
  const cancelSubscription = useCancelSubscription();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      email: "",
      phone: "",
      username: "",
      reminderTime: "",
    },
  });

  const [isSubLoading, setIsSubLoading] = useState(false);

  // Fetch subscription
  useEffect(() => {
    if (subscription) return;

    const loadSubscription = async () => {
      setIsSubLoading(true);
      try {
        await fetchSubscription();
      } finally {
        setIsSubLoading(false);
      }
    };

    loadSubscription();
  }, [subscription, fetchSubscription]);

  // Sync form with user data
  useEffect(() => {
    if (user) {
      reset({
        email: user.email || "",
        phone: user.phone || DEFAULT_PHONE,
        username: user.username || DEFAULT_USERNAME,
        reminderTime: user.reminderTime || DEFAULT_REMINDER_TIME,
      });
    }
  }, [user, reset]);

  const handleEdit = useCallback((field: EditableField) => {
    setEditingField(field);
  }, []);

  const handleCancelEdit = useCallback(() => {
    reset();
    setEditingField(null);
  }, [reset]);

  const handleCancelSubscription = useCallback(async () => {
    try {
      const response = await cancelSubscription.mutateAsync({
        provider: subscription?.provider || "payos",
      });

      if (!response?.success) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      setShowCancelDialog(false);
      await fetchSubscription();
    } catch (error) {
      toast.error("Failed to cancel subscription. Please try again.");
      console.error("Subscription cancellation error:", error);
    }
  }, [cancelSubscription, fetchSubscription]);

  const mutation = useEmailReminder();
  const handleUpdateReminderTime = useCallback(async (time: string) => {
    setIsSaving(true);
    try {
      await mutation.mutateAsync(time);
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Reminder time updated successfully");
      setEditingField(null);
    } catch (error) {
      toast.error("Failed to update reminder time. Please try again.");
      console.error("Reminder time update error:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      if (!editingField) return;

      // Handle reminder time separately
      if (editingField === "reminderTime") {
        await handleUpdateReminderTime(data.reminderTime);
        return;
      }

      // TODO: Handle other fields (email, phone) when APIs are ready
      setIsSaving(true);
      try {
        // const response = await fetch("/api/profile", {
        //   method: "PATCH",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ [editingField]: data[editingField] }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to update profile");
        // }

        toast.info(`${editingField} update not implemented yet`);
        setEditingField(null);
      } catch (error) {
        toast.error("Failed to update profile. Please try again.");
        console.error("Profile update error:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [editingField, handleUpdateReminderTime]
  );

  const renderEditableField = useCallback(
    (label: string, field: EditableField, type: string = "text") => {
      const isEditing = editingField === field;
      const error = errors[field];

      return (
        <div className="space-y-2">
          <Label htmlFor={field} className="text-sm text-gray-400">
            {label}
          </Label>
          <div className="flex gap-2 h-8 items-center">
            <div className="flex-1">
              <Input
                id={field}
                type={type}
                {...register(field, {
                  required: `${label} is required`,
                  ...(type === "email" && {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }),
                })}
                className="bg-transparent border-gray-700 text-white disabled:opacity-50"
                disabled={!isEditing || isSaving}
                aria-invalid={error ? "true" : "false"}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error.message}</p>
              )}
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  className="h-10 w-10 bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving || !isDirty}
                  aria-label="Save changes"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 border-gray-700"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="link"
                className="text-blue-400 hover:text-blue-300"
                onClick={() => handleEdit(field)}
                aria-label={`Edit ${label}`}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      );
    },
    [
      editingField,
      errors,
      isSaving,
      isDirty,
      register,
      handleEdit,
      handleCancelEdit,
      handleSubmit,
      onSubmit,
    ]
  );

  const canCancelSubscription =
    subscription &&
    subscription.name !== "Freemium" &&
    subscription.status !== SubscriptionStatus.Cancelled;

  const isCancelling = cancelSubscription.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Account Information */}
        <section className="mb-6 sm:mb-8">
          <h3 className="mb-4 sm:mb-6 border-b border-gray-800 pb-2 text-base sm:text-lg font-semibold">
            Account Information
          </h3>

          <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 border-b border-gray-800 pb-6 sm:pb-8">
            <div className="relative">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage
                  src={user?.picture}
                  alt={user?.name || "User avatar"}
                />
                <AvatarFallback className="bg-gray-700">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-500 text-xs">
                ✓
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">
              {user?.name || "User"}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {renderEditableField("Email", "email", "email")}
            {renderEditableField("Phone number", "phone", "tel")}
            {renderEditableField("Daily reminder time", "reminderTime", "time")}
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-6 sm:mb-8">
          <h3 className="mb-4 sm:mb-6 border-b border-gray-800 pb-2 text-base sm:text-lg font-semibold">
            Subscription
          </h3>

          {isSubLoading ? (
            <Card className="border-2 border-gray-700 bg-gray-900 animate-pulse">
              <CardHeader>
                <div className="mb-2 h-5 w-32 rounded bg-gray-700" />
                <div className="h-3 w-60 rounded bg-gray-700" />
              </CardHeader>
              <CardContent className="flex flex-row gap-3">
                <div className="h-10 w-28 rounded bg-gray-700" />
                <div className="h-10 w-28 rounded bg-gray-700" />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-blue-500 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-blue-400">
                  {subscription?.name ?? "Freemium"}
                  {subscription?.currentPeriodEnd &&
                    subscription.status === SubscriptionStatus.Cancelled && (
                      <span className="ml-2 text-sm text-gray-400">
                        Due:{" "}
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    )}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {subscription?.description ??
                    "You're currently using your note-taking journey effortlessly with our free Freemium plan. Enjoy basic note-taking, save up to 10 articles per day, and create your own flashcards to study more effectively. With unlimited and cross-device access, your notes stay with you anytime, anywhere."}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-row gap-3">
                {(subscription?.name === "Freemium" || !subscription) && (
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => (window.location.href = "/subscription")}
                  >
                    Upgrade plan
                  </Button>
                )}

                {canCancelSubscription && (
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel plan
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="border-gray-700 bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to cancel your subscription? You will lose
              access to premium features at the end of your current billing
              period. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-gray-700 bg-transparent text-white hover:bg-gray-800"
              disabled={isCancelling}
            >
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCancelling ? "Cancelling..." : "Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
