"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Navbar } from "@/components/navbar";

/**
 * Renders the public Navbar + content wrapper on non-app routes.
 * On /dashboard/* and /admin/* the children are rendered full-bleed
 * so those layouts can control their own viewport.
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAppRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isAppRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
