"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthCard, AuthField, AuthNotice } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import {
  AuthError,
  AuthService,
  describeAuthError,
} from "@/services/auth-service";

function ForgotPasswordForm() {
  const [email, setEmail] = useState(useSearchParams().get("email") ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const trimmedEmail = email.trim();
    const outcome = await AuthService.forgotPassword(trimmedEmail);
    setPending(false);
    if (outcome.ok) setSentTo(trimmedEmail);
    else setError(outcome.error);
  }

  const footer = (
    <Link className="text-foreground underline" href="/login">
      Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthCard
        title="Check your email"
        description={`If an account exists for ${sentTo}, we sent a link to set a new password. The link expires in 1 hour.`}
        footer={footer}
      />
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we will send you a link to set a new password."
      footer={footer}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <AuthNotice tone="error">{describeAuthError(error)}</AuthNotice>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
