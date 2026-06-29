import "server-only";
import { cookies } from "next/headers";
import {
  ACTIVE_CONNECTION_COOKIE,
  activeConnectionCookieOptions,
} from "@/lib/connection/constants";

export { ACTIVE_CONNECTION_COOKIE } from "@/lib/connection/constants";

export async function readActiveConnectionCookie(): Promise<string | undefined> {
  const value = (await cookies()).get(ACTIVE_CONNECTION_COOKIE)?.value;
  return value || undefined;
}

export async function setActiveConnectionCookie(connectionId: string): Promise<void> {
  (await cookies()).set(
    ACTIVE_CONNECTION_COOKIE,
    connectionId,
    activeConnectionCookieOptions(),
  );
}

export async function clearActiveConnectionCookie(): Promise<void> {
  (await cookies()).delete(ACTIVE_CONNECTION_COOKIE);
}
