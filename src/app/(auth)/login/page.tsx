"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import {
  AuthCard,
  AuthField,
  AuthNotice,
  ResendVerification,
  authHref,
} from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";
import {
  AuthError,
  AuthService,
  describeAuthError,
  safeReturnTo,
} from "@/services/auth-service";

function LoginForm() {
  const params = useSearchParams();
  const returnTo = safeReturnTo(params.get("returnTo"));
  const fromExtension = params.get("from") === "extension";
  const { status } = useSession();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (status === "authenticated") window.location.replace(returnTo);
  }, [status, returnTo]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const outcome = await AuthService.signIn(email.trim(), password);
    if (outcome.ok) {
      window.location.assign(returnTo);
      return;
    }
    setPending(false);
    setError(outcome.error);
  }

  return (
    <AuthCard
      title="Sign in to REHI"
      description={
        fromExtension
          ? "Sign in to connect the REHI browser extension."
          : "Welcome back. Pick up where you left off."
      }
      footer={
        <>
          New to REHI?
          <Link className="text-foreground underline" href={authHref("/register", params)}>
            Create an account
          </Link>
        </>
      }
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
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Link
          className="-mt-2 justify-self-end text-sm text-muted-foreground underline"
          href={email ? `/forgot-password?${new URLSearchParams({ email })}` : "/forgot-password"}
        >
          Forgot password?
        </Link>
        {error?.kind === "email-not-verified" ? (
          <AuthNotice>
            Check your email for the verification link, then sign in again.
          </AuthNotice>
        ) : (
          error && <AuthNotice tone="error">{describeAuthError(error)}</AuthNotice>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      {error?.kind === "email-not-verified" && (
        <ResendVerification email={email.trim()} />
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        or
        <Separator className="flex-1" />
      </div>
      <Button variant="outline" asChild>
        <a href={`/auth/login?${new URLSearchParams({ returnTo })}`}>
          Continue with Auth0
        </a>
      </Button>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
