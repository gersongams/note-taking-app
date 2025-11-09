"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { apiPost } from "@/lib/api-fetch";
import { formatZodErrors } from "@/lib/utils/format-zod-errors";
import { loginSchema, signUpSchema } from "@/schemas/auth";
import type { ActionState } from "./middleware";

interface AuthTokensResponse {
  tokens?: {
    access?: string;
    refresh?: string;
  };
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedData = loginSchema.parse(rawData);

    const data = await apiPost<AuthTokensResponse>(
      "/api/auth/login/",
      validatedData,
      {
        requireAuth: false,
        redirectOn401: false,
      },
    );

    const cookieStore = await cookies();

    if (data.tokens?.access) {
      cookieStore.set("access_token", data.tokens.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    if (data.tokens?.refresh) {
      cookieStore.set("refresh_token", data.tokens.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return {
      success: "Login successful!",
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { error: formatZodErrors(error) };
    }
    console.error(`Error: on loginAction ${error}`);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function signUpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    console.log(`[SIGNUP_ACTION] Starting signup for email: ${rawData.email}`);

    const validatedData = signUpSchema.parse(rawData);

    console.log(`[SIGNUP_ACTION] Calling API endpoint: /api/auth/register/`);
    const _data = await apiPost("/api/auth/register/", validatedData, {
      requireAuth: false,
      redirectOn401: false,
    });

    console.log(`[SIGNUP_ACTION] Signup successful!`);

    return {
      success: "Account created successfully! Please log in.",
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { error: formatZodErrors(error) };
    }

    console.error(`Error: on signUpAction ${error}`);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
  } catch (_error) {
    // Ignore cookie deletion failures so we can still redirect
  }
  redirect("/auth/login");
}
