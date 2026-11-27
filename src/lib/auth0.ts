import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { callRehiAuth, setSessionCookie } from "./session-server";
// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
  secret: process.env.AUTH0_SECRET,
  authorizationParameters: {
    // In v4, the AUTH0_SCOPE and AUTH0_AUDIENCE environment variables are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    scope: process.env.AUTH0_SCOPE,
    audience: process.env.AUTH0_AUDIENCE,
  },

  async onCallback(error, context, session) {
    // redirect the user to a custom error page
    if (error) {
      return NextResponse.redirect(
        new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL)
      );
    }

    const auth0AccessToken = session?.tokenSet.accessToken;
    const exchange = auth0AccessToken
      ? await callRehiAuth("/auth/auth0-exchange", { bearer: auth0AccessToken })
      : null;
    if (!exchange?.ok) {
      console.error("Auth0 exchange failed:", exchange?.status, exchange?.body);
      return NextResponse.redirect(
        new URL("/error?error=rehi_session_failed", process.env.APP_BASE_URL)
      );
    }

    const res = NextResponse.redirect(
      new URL(context.returnTo || "/", process.env.APP_BASE_URL)
    );
    setSessionCookie(res, exchange.pair);
    return res;
  },
});
