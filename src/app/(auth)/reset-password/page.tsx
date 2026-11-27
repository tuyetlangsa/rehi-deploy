"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthCard, AuthField, AuthNotice } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import {
  AuthError,
  AuthService,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  describeAuthError,
} from "@/services/auth-service";

function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirmation !== "" && confirmation !== password;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || password !== confirmation) return;
    setPending(true);
    setError(null);
    const outcome = await AuthService.resetPassword(token, password);
    setPending(false);
    if (outcome.ok) setDone(true);
    else setError(outcome.error);
  }

  const requestNewLink = (
    <Link className="text-foreground underline" href="/forgot-password">
      Request a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthCard
        title="Reset link missing"
        description="Open the link from your password reset email."
        footer={requestNewLink}
      />
    );
  }

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        description="Sign in with your new password. Other devices were signed out."
      >
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      footer={error?.kind === "invalid-email-token" ? requestNewLink : undefined}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthField
          id="confirmation"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          aria-invalid={mismatch}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
        {mismatch && (
          <p className="-mt-2 text-sm text-destructive">Passwords do not match.</p>
        )}
        {error && <AuthNotice tone="error">{describeAuthError(error)}</AuthNotice>}
        <Button type="submit" disabled={pending || mismatch}>
          {pending ? "Saving..." : "Save new password"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
