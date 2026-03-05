import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConditionalShell } from "@/components/conditional-shell";

export const metadata: Metadata = {
  title: "PaperPair | AI Case Manager",
  description: "2026 concurrent I-130 + I-485 filing platform for mixed-status couples"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body style={{ background: "var(--color-bg)" }}>
        <Providers>
          <ConditionalShell>{children}</ConditionalShell>
        </Providers>
      </body>
    </html>
  );
}
