"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";

export function LogoutButton({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
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
      className={`transition-colors focus:outline-none ${className}`}
      {...props}
    >
      {children || "Logout"}
    </button>
  );
}
