import { createHash, randomBytes } from "crypto";
import { bytesToBase64Url } from "@/lib/device-session.shared";

export * from "@/lib/device-session.shared";

export async function generateDeviceToken() {
  return bytesToBase64Url(randomBytes(32));
}

export async function generateDeviceCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
}

export async function generateDeviceSecret(length = 48) {
  return bytesToBase64Url(randomBytes(length));
}

export async function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("base64url");
}
