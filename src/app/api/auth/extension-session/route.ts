import { NextRequest, NextResponse } from "next/server";
import { authFailure, callRehiAuth } from "@/lib/session-server";

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!bearer) return new NextResponse(null, { status: 401 });

  const call = await callRehiAuth("/auth/extension-session", { bearer });
  if (!call.ok) return authFailure(call);
  return NextResponse.json(call.pair);
}
