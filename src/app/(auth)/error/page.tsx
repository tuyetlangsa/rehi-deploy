"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";

const DESCRIPTIONS: Record<string, string> = {
  rehi_session_failed:
    "You signed in with Auth0, but REHI could not start your session. Try again in a moment.",
};

function SignInError() {
  const code = useSearchParams().get("error") ?? "";
  return (
    <AuthCard
      title="Sign-in failed"
      description={DESCRIPTIONS[code] ?? "Something went wrong while signing you in. Try again."}
    >
      <Button asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </AuthCard>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <SignInError />
    </Suspense>
  );
}
