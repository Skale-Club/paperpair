import { createClient } from "@/lib/supabase/server";

export async function isAdminSession(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const role = (user.app_metadata as { role?: string })?.role;
  return role === "admin";
}

export async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
