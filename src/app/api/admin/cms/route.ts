import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin";

const CmsSchema = z.object({
  slug: z.enum(["home", "contato", "blogs"]),
  title: z.string().min(1),
  content: z.string().min(1)
});

export async function GET() {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.pageContent.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = CmsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const page = await prisma.pageContent.upsert({
    where: { slug: parsed.data.slug },
    create: parsed.data,
    update: {
      title: parsed.data.title,
      content: parsed.data.content
    }
  });

  return NextResponse.json({ page });
}
