import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Vérification des variables
if (!process.env.SUPABASE_URL) {
  console.error("❌ Variable d'environnement SUPABASE_URL manquante !");
}
if (!process.env.SUPABASE_KEY) {
  console.error("❌ Variable d'environnement SUPABASE_KEY manquante !");
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY!,
  {
    auth: { persistSession: false }
  }
);
