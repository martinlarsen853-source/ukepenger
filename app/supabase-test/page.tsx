"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  useEffect(() => {
    const loadSession = async () => {
      const session = await supabase.auth.getSession();
      console.log(session);
    };

    loadSession();
  }, []);

  return <div>Supabase client ready</div>;
}
