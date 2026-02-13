"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log(data.session);
    };

    checkSession();
  }, []);

  return <div>Supabase client ready</div>;
}
