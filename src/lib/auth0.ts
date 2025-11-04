import { CreateUserRequest } from "@/constants/user";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { http } from "./http";
import axios, { AxiosError } from "axios";
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

    try {
      const request: CreateUserRequest = {
        email: session?.user.email ?? "",
        fullName: session?.user.name ?? "",
      };

      const accessToken = session?.tokenSet.accessToken;

      const response = await http.post<string>("/users", request, {
        token: accessToken, // truyền token qua HttpOptions
      });

      if (response.isSuccess) {
        // User created successfully
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<unknown>;
        console.error(
          "Create user error:",
          axiosError.response?.status,
          axiosError.response?.data
        );
      } else {
        console.error("Unknown error:", error);
      }
    }

    // complete the redirect to the provided returnTo URL
    return NextResponse.redirect(
      new URL(context.returnTo || "/", process.env.APP_BASE_URL)
    );
  },
});
