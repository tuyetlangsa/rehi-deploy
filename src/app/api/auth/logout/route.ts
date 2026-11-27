import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  revokeRehiSession,
} from "@/lib/session-server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (refreshToken) await revokeRehiSession(refreshToken);

  const auth0Session = await auth0.getSession();
  const res = NextResponse.json({
    redirectTo: auth0Session ? "/auth/logout" : "/",
  });
  clearSessionCookie(res);
  return res;
}
