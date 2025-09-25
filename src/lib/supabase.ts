import { createClient } from "@supabase/supabase-js";

// 共通のSupabaseクライアントインスタンス
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
