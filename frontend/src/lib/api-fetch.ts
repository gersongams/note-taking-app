import { redirect } from "next/navigation";
import { getAuthHeaders } from "@/lib/auth";
import { createNetworkError } from "@/lib/network-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  redirectOn401?: boolean;
}

/**
 * Centralized fetch utility for server-side API calls
 * Handles auth headers, 401 redirects, and consistent error handling
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    requireAuth = true,
    redirectOn401 = true,
    headers = {},
    ...fetchOptions
  } = options;

  // Build full URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Get auth headers if required
  const authHeaders = requireAuth ? await getAuthHeaders() : {};

  const requestHeaders = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    if (response.status === 401) {
      if (redirectOn401) {
        redirect("/auth/login");
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const _errorText = await response.text();
      throw new Error(`Request failed: ${response.status}`);
    }

    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType?.includes("application/json")) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`[API_FETCH] Error fetching ${url}:`, error);

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch failed")) {
      console.error(`[API_FETCH] Network error - fetch failed for URL: ${url}`);
      throw createNetworkError(
        "Unable to connect to server. Please check your connection or try again later.",
        error,
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ETIMEDOUT"))
    ) {
      throw createNetworkError(
        "Server is not responding. Please try again later.",
        error,
      );
    }

    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
}
