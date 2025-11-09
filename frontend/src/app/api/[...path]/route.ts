import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params, "GET");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params, "POST");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params, "PUT");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params, "PATCH");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, params, "DELETE");
}

async function proxyRequest(
  request: Request,
  params: Promise<{ path: string[] }>,
  _method: string,
) {
  const { path } = await params;
  const url = new URL(request.url);
  const pathString = path.join("/");

  const backendUrl = `${BACKEND_URL}/api/${pathString}${url.search}`;

  try {
    const authHeaders = await getAuthHeaders();

    let body: string | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.text();
    }

    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 },
    );
  }
}
