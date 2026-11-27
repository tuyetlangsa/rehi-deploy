import { NextRequest, NextResponse } from "next/server";
import { forwardRehiAuth } from "@/lib/session-server";

const ANONYMOUS_ACTIONS = new Set([
  "register",
  "verify-email",
  "resend-verification",
  "forgot-password",
  "reset-password",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (!ANONYMOUS_ACTIONS.has(action)) {
    return new NextResponse(null, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return new NextResponse(null, { status: 400 });
  }

  return forwardRehiAuth(`/auth/${action}`, body);
}
