"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard, AuthNotice } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import {
  AuthOutcome,
  AuthService,
  describeAuthError,
} from "@/services/auth-service";

const verifications = new Map<string, Promise<AuthOutcome>>();

function verifyOnce(token: string) {
  let pending = verifications.get(token);
  if (!pending) {
    pending = AuthService.verifyEmail(token);
    verifications.set(token, pending);
  }
  return pending;
}

function VerifyEmail() {
  const token = useSearchParams().get("token");
  const [outcome, setOutcome] = useState<AuthOutcome | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyOnce(token).then((result) => {
      if (active) setOutcome(result);
    });
    return () => {
      active = false;
    };
  }, [token]);

  const signIn = (
    <Button asChild>
      <Link href="/login">Sign in</Link>
    </Button>
  );

  if (!token) {
    return (
      <AuthCard
        title="Verification link missing"
        description="Open the link from your verification email. To get a new one, sign in and choose resend."
      >
        {signIn}
      </AuthCard>
    );
  }

  if (!outcome) {
    return <AuthCard title="Verifying your email..." />;
  }

  if (outcome.ok) {
    return (
      <AuthCard title="Email verified" description="Your account is ready.">
        {signIn}
      </AuthCard>
    );
  }

  return (
    <AuthCard title="We could not verify your email">
      <AuthNotice tone="error">{describeAuthError(outcome.error)}</AuthNotice>
      <p className="text-sm text-muted-foreground">
        Sign in with your email and password to get a new verification link.
      </p>
      {signIn}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
