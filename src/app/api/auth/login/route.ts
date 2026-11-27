import { NextRequest, NextResponse } from "next/server";
import {
  authFailure,
  callRehiAuth,
  setSessionCookie,
  toWebSession,
} from "@/lib/session-server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.email !== "string" || typeof body?.password !== "string") {
    return new NextResponse(null, { status: 400 });
  }

  const call = await callRehiAuth("/auth/login", {
    body: { email: body.email, password: body.password, client: "web" },
  });
  if (!call.ok) return authFailure(call);

  const res = NextResponse.json(toWebSession(call.pair));
  setSessionCookie(res, call.pair);
  return res;
}
