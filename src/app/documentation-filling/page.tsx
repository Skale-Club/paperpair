export const dynamic = "force-dynamic";

import { ChatUI } from "@/components/chat-ui";
import { prisma } from "@/lib/prisma";
import { UplDisclaimer } from "@/components/upl-disclaimer";
import { getCurrentUserAndProfile } from "@/lib/current-user-profile";

type SearchParams = {
  template?: string | string[];
};

function parseSelectedTemplateKeys(templateParam: SearchParams["template"]) {
  const raw = Array.isArray(templateParam) ? templateParam : templateParam ? [templateParam] : [];
  return Array.from(new Set(raw.map((value) => value.trim()).filter(Boolean)));
}

export default async function DocumentationFillingPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  let templates: Awaited<ReturnType<typeof prisma.documentTemplate.findMany>>;
  try {
    templates = await prisma.documentTemplate.findMany({
      orderBy: { updatedAt: "desc" }
    });
  } catch {
    templates = [];
  }
  const initialSelectedTemplateKeys = parseSelectedTemplateKeys(resolved.template);

  // Fetch chat history — per D-13, CHAT-04
  type InitialMessage = { id: string; role: "user" | "assistant"; content: string };
  let initialMessages: InitialMessage[] = [];

  const userContext = await getCurrentUserAndProfile();
  if (userContext) {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { userProfileId: userContext.userProfile.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (session) {
        initialMessages = session.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
      }
    } catch {
      initialMessages = [];
    }
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black">
          Adjustment of Status
        </p>
        <h1 className="text-3xl font-semibold text-black">Documentation Filling</h1>
        <p className="max-w-3xl text-zinc-800">
          View the official template, answer the assistant in the bottom-right corner, and generate an automatically filled PDF with the collected data.
        </p>
      </div>

      <UplDisclaimer />

      <ChatUI
        templates={templates}
        initialSelectedTemplateKeys={initialSelectedTemplateKeys}
        initialMessages={initialMessages}
      />
    </section>
  );
}
