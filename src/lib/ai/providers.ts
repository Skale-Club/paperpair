import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/secret-crypto";

const TABLE = "ai_provider_keys";

let cachedKeys: Record<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

async function getAdminProviderKey(provider: string): Promise<string | null> {
  const now = Date.now();

  if (cachedKeys && now - cacheTime < CACHE_TTL) {
    return cachedKeys[provider] ?? null;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("provider, encrypted_key")
      .eq("is_active", true);

    if (error || !data) return null;

    const keys: Record<string, string> = {};
    for (const row of data as Array<{ provider: string; encrypted_key: string }>) {
      try {
        keys[row.provider] = decryptSecret(row.encrypted_key);
      } catch {
        // Skip invalid keys
      }
    }

    cachedKeys = keys;
    cacheTime = now;
    return keys[provider] ?? null;
  } catch {
    return null;
  }
}

export function invalidateKeyCache() {
  cachedKeys = null;
  cacheTime = 0;
}

export async function getLanguageModel(modelId: string, userGoogleKey?: string | null) {
  const [providerPrefix, ...rest] = modelId.split("/");
  const modelSlug = rest.join("/");

  switch (providerPrefix) {
    case "google": {
      // Priority: admin key > user's own key
      const key = await getAdminProviderKey("google");
      const finalKey = key || userGoogleKey;

      if (!finalKey) {
        throw new Error("Google AI key not configured. Set it up in admin or your profile settings.");
      }

      const provider = createGoogleGenerativeAI({ apiKey: finalKey });
      return provider(modelSlug);
    }
    case "openai": {
      const key = await getAdminProviderKey("openai");
      if (!key) {
        throw new Error("OpenAI key not configured. Ask admin to set it up.");
      }
      const provider = createOpenAI({ apiKey: key });
      return provider(modelSlug);
    }
    case "openrouter": {
      const key = await getAdminProviderKey("openrouter");
      if (!key) {
        throw new Error("OpenRouter key not configured. Ask admin to set it up.");
      }
      const provider = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: key,
        headers: {
          "HTTP-Referer": "https://paperpair.co",
          "X-Title": "Paperpair",
        },
      });
      return provider(modelSlug);
    }
    default:
      throw new Error(`Unknown provider: ${providerPrefix}`);
  }
}

export async function getTitleModel(userGoogleKey?: string | null) {
  return getLanguageModel("google/gemini-2.0-flash", userGoogleKey);
}
