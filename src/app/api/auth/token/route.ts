import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  SESSION_COOKIE,
  authFailure,
  callRehiAuth,
  clearSessionCookie,
  setSessionCookie,
  toWebSession,
} from "@/lib/session-server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (!refreshToken) return new NextResponse(null, { status: 401 });

  const call = await callRehiAuth("/auth/refresh", { body: { refreshToken } });
  if (!call.ok) {
    if (call.status !== 400 && call.status !== 401) return authFailure(call);
    const res = new NextResponse(null, { status: 401 });
    clearSessionCookie(res);
    return res;
  }

  const auth0Session = await auth0.getSession();
  const res = NextResponse.json(
    toWebSession(call.pair, auth0Session?.user.picture)
  );
  setSessionCookie(res, call.pair);
  return res;
}
