import { NextResponse } from "next/server";

/**
 * Parses request JSON body and returns null when body is empty/invalid.
 */
export async function getJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Converts thrown unknown errors to API-safe JSON responses.
 */
export function toErrorResponse(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}
