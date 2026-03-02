import { bytesToBase64Url, KIOSK_COOKIE_NAME } from "@/lib/device-session.shared";

export { KIOSK_COOKIE_NAME };

export function randomBase64Url(lengthBytes: number) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Crypto API is not available in this runtime.");
  }
  const bytes = new Uint8Array(lengthBytes);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function sha256Base64Url(data: Uint8Array | string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Crypto subtle API is not available in this runtime.");
  }
  const input = (typeof data === "string" ? new TextEncoder().encode(data) : data) as BufferSource;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", input);
  return bytesToBase64Url(new Uint8Array(digest));
}
