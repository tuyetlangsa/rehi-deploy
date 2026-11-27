export type AuthError =
  | { kind: "invalid-credentials" }
  | { kind: "email-not-verified" }
  | { kind: "email-taken" }
  | { kind: "invalid-email-token" }
  | { kind: "validation"; messages: string[] }
  | { kind: "rate-limited" }
  | { kind: "unexpected" };

export type AuthOutcome = { ok: true } | { ok: false; error: AuthError };

const ERROR_BY_STATUS_AND_CODE: Record<string, AuthError> = {
  "401 Auth.InvalidCredentials": { kind: "invalid-credentials" },
  "403 Auth.EmailNotVerified": { kind: "email-not-verified" },
  "409 User.EmailAlreadyExists": { kind: "email-taken" },
  "400 Auth.InvalidEmailToken": { kind: "invalid-email-token" },
};

type ProblemBody = {
  title?: unknown;
  errors?: { description?: unknown }[];
};

function parseError(status: number, body: ProblemBody | null): AuthError {
  if (status === 429) return { kind: "rate-limited" };
  const code = typeof body?.title === "string" ? body.title : "";
  const known = ERROR_BY_STATUS_AND_CODE[`${status} ${code}`];
  if (known) return known;
  if (status === 400 && code === "General.Validation") {
    const messages = (Array.isArray(body?.errors) ? body.errors : [])
      .map((e) => e.description)
      .filter((d): d is string => typeof d === "string");
    return { kind: "validation", messages };
  }
  return { kind: "unexpected" };
}

async function post(path: string, body: object): Promise<AuthOutcome> {
  try {
    const res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    const problem = (await res.json().catch(() => null)) as ProblemBody | null;
    return { ok: false, error: parseError(res.status, problem) };
  } catch (error) {
    console.error(`Auth ${path} failed:`, error);
    return { ok: false, error: { kind: "unexpected" } };
  }
}

export const AuthService = {
  signIn: (email: string, password: string) =>
    post("login", { email, password }),
  register: (fullName: string, email: string, password: string) =>
    post("register", { fullName, email, password }),
  verifyEmail: (token: string) => post("verify-email", { token }),
  resendVerification: (email: string) =>
    post("resend-verification", { email }),
  forgotPassword: (email: string) => post("forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    post("reset-password", { token, newPassword }),
};

const MESSAGES: Record<Exclude<AuthError["kind"], "validation">, string> = {
  "invalid-credentials": "Email or password is incorrect.",
  "email-not-verified": "Verify your email before you sign in.",
  "email-taken": "An account with this email already exists.",
  "invalid-email-token": "This link is invalid or has expired.",
  "rate-limited": "Too many attempts. Wait a minute and try again.",
  unexpected: "Something went wrong. Try again.",
};

export function describeAuthError(error: AuthError): string {
  if (error.kind !== "validation") return MESSAGES[error.kind];
  return error.messages.join(" ") || "Check the form and try again.";
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function safeReturnTo(value: string | null, fallback = "/articles") {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
