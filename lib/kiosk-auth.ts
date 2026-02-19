import { getKioskSessionFromRequest } from "@/lib/device-session";
import { getServiceSupabaseClient } from "@/lib/server-supabase";

type DeviceAuthRow = {
  id: string;
  family_id: string;
  device_secret: string | null;
  active: boolean;
  revoked_at: string | null;
};

export type KioskAuthContext = {
  deviceId: string;
  familyId: string;
};

export async function verifyKioskRequest(request: Request): Promise<KioskAuthContext | null> {
  const session = getKioskSessionFromRequest(request);
  if (!session) {
    console.log("Kiosk auth: No session found");
    return null;
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    console.log("Kiosk auth: No supabase client");
    return null;
  }

  const deviceRes = await supabase
    .from("devices")
    .select("id, family_id, device_secret, active, revoked_at")
    .eq("id", session.deviceId)
    .maybeSingle();

  if (deviceRes.error || !deviceRes.data) {
    console.log("Kiosk auth: Device not found", { deviceId: session.deviceId, error: deviceRes.error });
    return null;
  }

  const device = deviceRes.data as DeviceAuthRow;
  
  // Debug: Log validation details
  console.log("Kiosk auth validation:", {
    deviceId: device.id,
    active: device.active,
    revokedAt: device.revoked_at,
    hasDeviceSecret: !!device.device_secret,
    sessionDeviceSecret: session.deviceSecret ? "present" : "missing",
    deviceSecretLength: device.device_secret?.length,
    sessionSecretLength: session.deviceSecret?.length,
    secretsMatch: device.device_secret === session.deviceSecret
  });
  
  if (!device.active || device.revoked_at || !device.device_secret || device.device_secret !== session.deviceSecret) {
    console.log("Kiosk auth: Validation failed");
    return null;
  }

  console.log("Kiosk auth: Success", { deviceId: device.id, familyId: device.family_id });
  return {
    deviceId: device.id,
    familyId: device.family_id,
  };
}
