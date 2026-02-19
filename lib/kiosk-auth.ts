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
  if (!session) return null;

  const supabase = getServiceSupabaseClient();
  if (!supabase) return null;

  const deviceRes = await supabase
    .from("devices")
    .select("id, family_id, device_secret, active, revoked_at")
    .eq("id", session.deviceId)
    .maybeSingle();

  if (deviceRes.error || !deviceRes.data) return null;

  const device = deviceRes.data as DeviceAuthRow;
  if (!device.active || device.revoked_at || !device.device_secret || device.device_secret !== session.deviceSecret) {
    return null;
  }

  return {
    deviceId: device.id,
    familyId: device.family_id,
  };
}
