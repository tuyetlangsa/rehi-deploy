"use client";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService, describeAuthError } from "@/services/auth-service";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent className="grid gap-4">{children}</CardContent>}
      {footer && (
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

export function AuthField({
  id,
  label,
  ...input
}: { id: string; label: string } & ComponentProps<typeof Input>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} required {...input} />
    </div>
  );
}

export function AuthNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <Alert variant={tone === "error" ? "destructive" : "default"}>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

type ResendState = "idle" | "sending" | "sent" | { error: string };

export function ResendVerification({ email }: { email: string }) {
  const [state, setState] = useState<ResendState>("idle");

  async function resend() {
    setState("sending");
    const outcome = await AuthService.resendVerification(email);
    setState(outcome.ok ? "sent" : { error: describeAuthError(outcome.error) });
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={resend}
        disabled={state === "sending" || state === "sent"}
      >
        {state === "sending" ? "Sending..." : "Resend verification email"}
      </Button>
      {state === "sent" && (
        <p className="text-sm text-muted-foreground">
          If {email} is waiting for verification, a new link is on its way.
        </p>
      )}
      {typeof state === "object" && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </div>
  );
}

const CARRIED_PARAMS = ["returnTo", "from"];

export function authHref(
  path: string,
  params: URLSearchParams,
  extra: Record<string, string> = {}
) {
  const next = new URLSearchParams(extra);
  for (const key of CARRIED_PARAMS) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}
