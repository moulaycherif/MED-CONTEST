import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.SUPABASE_URL) {
  console.error("❌ SUPABASE_URL manquant !");
}
if (!process.env.SUPABASE_KEY) {
  console.error("❌ SUPABASE_KEY manquant !");
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);
