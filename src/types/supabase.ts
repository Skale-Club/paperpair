import { User } from "@supabase/supabase-js";

export type SupabaseUser = User & {
  app_metadata: {
    role?: "admin" | "user";
  };
};
