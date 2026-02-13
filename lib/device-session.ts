export type DeviceSession = {
  deviceId: string;
  familyId: string;
  tokenHash: string;
};

const COOKIE_NAME = "spareapp_device";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeBase64Url(value: string) {
  const base64 =
    typeof btoa === "function" ? btoa(value) : Buffer.from(value, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  if (typeof atob === "function") {
    return atob(padded);
  }
  return Buffer.from(padded, "base64").toString("utf8");
}

export function encodeDeviceSession(session: DeviceSession) {
  return encodeBase64Url(JSON.stringify(session));
}

export function decodeDeviceSession(value: string | undefined | null): DeviceSession | null {
  if (!value) return null;
  try {
    const decoded = decodeBase64Url(value);
    const parsed = JSON.parse(decoded) as DeviceSession;
    if (!parsed.deviceId || !parsed.familyId || !parsed.tokenHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseCookieHeader(cookieHeader: string | null) {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) continue;
    result[rawKey] = rest.join("=");
  }
  return result;
}

export function getDeviceSessionFromDocument() {
  if (typeof document === "undefined") return null;
  const cookies = parseCookieHeader(document.cookie ?? "");
  return decodeDeviceSession(cookies[COOKIE_NAME]);
}

export function getDeviceSessionFromRequest(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return decodeDeviceSession(cookies[COOKIE_NAME]);
}

export function setDeviceSessionCookie(session: DeviceSession, days = 30) {
  if (typeof document === "undefined") return;
  const value = encodeDeviceSession(session);
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearDeviceSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export async function generateDeviceToken() {
  const bytes = new Uint8Array(32);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    const { randomBytes } = await import("crypto");
    const buffer = randomBytes(32);
    bytes.set(buffer);
  }
  return bytesToBase64Url(bytes);
}

export async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
    return bytesToBase64Url(new Uint8Array(digest));
  }
  const { createHash } = await import("crypto");
  return createHash("sha256").update(data).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
