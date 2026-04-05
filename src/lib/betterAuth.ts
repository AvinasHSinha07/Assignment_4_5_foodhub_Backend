import type { RequestHandler } from "express";
import type { IncomingHttpHeaders } from "http";
import { env } from "../config/env";
import { prisma } from "./prisma";

type TBetterAuthContext = {
  auth: any;
  fromNodeHeaders: (headers: IncomingHttpHeaders) => Headers;
  toNodeHandler: (auth: any) => RequestHandler;
};

type TCallBetterAuthEndpointInput = {
  path: string;
  method: "GET" | "POST";
  requestHeaders: IncomingHttpHeaders;
  body?: Record<string, unknown>;
};

export type TCallBetterAuthEndpointResult = {
  status: number;
  body: unknown;
  setCookies: string[];
};

let contextPromise: Promise<TBetterAuthContext> | null = null;

const createBetterAuthContext = async (): Promise<TBetterAuthContext> => {
  const [{ betterAuth }, { prismaAdapter }, { fromNodeHeaders, toNodeHandler }] = await Promise.all([
    import("better-auth"),
    import("@better-auth/prisma-adapter"),
    import("better-auth/node"),
  ]);

  const auth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/v1/auth/core",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CLIENT_URL],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    user: {
      modelName: "User",
      fields: {
        image: "avatar",
      },
      additionalFields: {
        role: {
          type: ["ADMIN", "CUSTOMER", "PROVIDER"],
          required: true,
          defaultValue: "CUSTOMER",
          input: true,
        },
        status: {
          type: ["ACTIVE", "SUSPENDED"],
          required: true,
          defaultValue: "ACTIVE",
          input: false,
        },
        phone: {
          type: "string",
          required: false,
        },
      },
    },
    session: {
      modelName: "Session",
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
        strategy: "jwt",
      },
    },
    account: {
      modelName: "Account",
    },
    verification: {
      modelName: "Verification",
    },
    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
      cookies: {
        session_token: {
          name: "foodhub_session_token",
        },
      },
    },
  });

  return {
    auth,
    fromNodeHeaders,
    toNodeHandler,
  };
};

export const getBetterAuthContext = async () => {
  if (!contextPromise) {
    contextPromise = createBetterAuthContext();
  }

  return contextPromise;
};

export const getBetterAuthHandler = async () => {
  const { auth, toNodeHandler } = await getBetterAuthContext();
  return toNodeHandler(auth);
};

export const getBetterAuthSession = async (headers: IncomingHttpHeaders) => {
  const { auth, fromNodeHeaders } = await getBetterAuthContext();
  return (auth.api as { getSession: (input: { headers: Headers }) => Promise<unknown> }).getSession({
    headers: fromNodeHeaders(headers),
  });
};

export const callBetterAuthEndpoint = async (
  input: TCallBetterAuthEndpointInput,
): Promise<TCallBetterAuthEndpointResult> => {
  const url = new URL(`/api/v1/auth/core${input.path}`, env.BETTER_AUTH_URL).toString();

  const headers: Record<string, string> = {};

  const cookieHeader = input.requestHeaders.cookie;
  if (typeof cookieHeader === "string" && cookieHeader.length > 0) {
    headers.cookie = cookieHeader;
  }

  const userAgent = input.requestHeaders["user-agent"];
  if (typeof userAgent === "string" && userAgent.length > 0) {
    headers["user-agent"] = userAgent;
  }

  const origin = input.requestHeaders.origin;
  if (typeof origin === "string" && origin.length > 0) {
    headers.origin = origin;
  } else {
    headers.origin = env.CLIENT_URL;
  }

  if (input.body) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(url, {
    method: input.method,
    headers,
    body: input.body ? JSON.stringify(input.body) : undefined,
  });

  const body = (await response.json().catch(() => null)) as unknown;

  const responseHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  const setCookies = responseHeaders.getSetCookie?.() ?? [];

  return {
    status: response.status,
    body,
    setCookies,
  };
};
