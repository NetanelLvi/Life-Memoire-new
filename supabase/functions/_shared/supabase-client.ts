
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Initialize Supabase client
export function initSupabaseClient(useServiceRole = false) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error("Missing Supabase environment variables");
  }
  
  // Use service role key when specified for admin operations that bypass RLS
  const key = useServiceRole && SUPABASE_SERVICE_ROLE_KEY ? 
    SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  
  return createClient(SUPABASE_URL, key);
}
