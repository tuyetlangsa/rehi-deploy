"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  AuthCard,
  AuthField,
  AuthNotice,
  ResendVerification,
  authHref,
} from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import {
  AuthError,
  AuthService,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  describeAuthError,
} from "@/services/auth-service";

function RegisterForm() {
  const params = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const trimmedEmail = email.trim();
    const outcome = await AuthService.register(fullName.trim(), trimmedEmail, password);
    setPending(false);
    if (outcome.ok) setRegisteredEmail(trimmedEmail);
    else setError(outcome.error);
  }

  const signInHref = authHref("/login", params, email ? { email: email.trim() } : {});

  if (registeredEmail) {
    return (
      <AuthCard
        title="Check your email"
        description={`We sent a verification link to ${registeredEmail}. Open it to activate your account, then sign in.`}
        footer={
          <Link className="text-foreground underline" href={signInHref}>
            Back to sign in
          </Link>
        }
      >
        <ResendVerification email={registeredEmail} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your REHI account"
      description="Save articles, highlight, and review what you read."
      footer={
        <>
          Already have an account?
          <Link className="text-foreground underline" href={authHref("/login", params)}>
            Sign in
          </Link>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        <AuthField
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="-mt-2 text-xs text-muted-foreground">
          {PASSWORD_MIN_LENGTH} to {PASSWORD_MAX_LENGTH} characters.
        </p>
        {error?.kind === "email-taken" ? (
          <AuthNotice tone="error">
            An account with this email already exists.{" "}
            <Link className="underline" href={signInHref}>
              Sign in
            </Link>{" "}
            or{" "}
            <Link
              className="underline"
              href={`/forgot-password?${new URLSearchParams({ email: email.trim() })}`}
            >
              reset your password
            </Link>
            .
          </AuthNotice>
        ) : (
          error && <AuthNotice tone="error">{describeAuthError(error)}</AuthNotice>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
