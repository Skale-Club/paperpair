"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";

export function LogoutButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${className}`}
      {...props}
    >
      Sair
    </button>
  );
}
