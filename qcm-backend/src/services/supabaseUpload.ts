import { supabase } from "../utils/supabase";

export const uploadToSupabase = async (fileBuffer: Buffer, fileName: string) => {
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .upload(fileName, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("❌ Erreur upload Supabase :", error);
    throw new Error("Erreur upload Supabase");
  }

  const { data: publicUrl } = supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
};
