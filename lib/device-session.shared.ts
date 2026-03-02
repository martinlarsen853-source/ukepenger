export type DeviceSession = {
  deviceId: string;
  familyId: string;
  tokenHash: string;
};

const COOKIE_NAME = "spareapp_device";
export const KIOSK_COOKIE_NAME = "uk_kiosk";

export function bytesToBase64Url(bytes: Uint8Array) {
  if (typeof btoa !== "function") {
    throw new Error("Base64 encoding is not available in this runtime.");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlToBytes(value: string) {
  if (typeof atob !== "function") {
    throw new Error("Base64 decoding is not available in this runtime.");
  }
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function decodeBase64Url(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value));
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

export type KioskCookieSession = {
  deviceId: string;
  deviceSecret: string;
};

export function parseKioskCookieValue(value: string | undefined | null): KioskCookieSession | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  const [deviceId, deviceSecret] = decoded.split(":");
  if (!deviceId || !deviceSecret) return null;
  return { deviceId: deviceId.trim(), deviceSecret: deviceSecret.trim() };
}

export function getKioskSessionFromRequest(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return parseKioskCookieValue(cookies[KIOSK_COOKIE_NAME]);
}

export function getKioskCookieValue(deviceId: string, deviceSecret: string) {
  return `${deviceId}:${deviceSecret}`;
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
