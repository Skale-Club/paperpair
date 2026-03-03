import { decryptSecret, encryptSecret } from "@/lib/secret-crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const USER_AI_KEYS_TABLE = "user_ai_keys";

type UserAiKeyRow = {
  user_id: string;
  encrypted_google_api_key: string;
};

export async function getUserGoogleApiKey(userId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(USER_AI_KEYS_TABLE)
    .select("encrypted_google_api_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user Google API key: ${error.message}`);
  }

  const encrypted = (data as Pick<UserAiKeyRow, "encrypted_google_api_key"> | null)
    ?.encrypted_google_api_key;
  if (!encrypted) {
    return null;
  }

  return decryptSecret(encrypted);
}

export async function upsertUserGoogleApiKey(userId: string, apiKey: string | null) {
  const supabase = createAdminClient();

  if (!apiKey) {
    const { error } = await supabase.from(USER_AI_KEYS_TABLE).delete().eq("user_id", userId);
    if (error) {
      throw new Error(`Failed to remove user Google API key: ${error.message}`);
    }
    return;
  }

  const encrypted = encryptSecret(apiKey.trim());

  const { error } = await supabase
    .from(USER_AI_KEYS_TABLE)
    .upsert(
      {
        user_id: userId,
        encrypted_google_api_key: encrypted
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw new Error(`Failed to save user Google API key: ${error.message}`);
  }
}
