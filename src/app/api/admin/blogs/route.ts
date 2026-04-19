import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/admin";
import { BLOG_POST_PREFIX, fromBlogSlug, normalizeBlogHandle, toBlogSlug } from "@/lib/cms";

const BlogSchema = z.object({
  handle: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1)
});

export async function GET() {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.pageContent.findMany({
    where: {
      slug: {
        startsWith: BLOG_POST_PREFIX
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return NextResponse.json({
    posts: posts.map((post) => ({
      id: post.id,
      handle: fromBlogSlug(post.slug),
      title: post.title,
      content: post.content,
      updatedAt: post.updatedAt.toISOString()
    }))
  });
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = BlogSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const handle = normalizeBlogHandle(parsed.data.handle);
  const slug = toBlogSlug(handle);

  const post = await prisma.pageContent.upsert({
    where: { slug },
    create: {
      slug,
      title: parsed.data.title.trim(),
      content: parsed.data.content.trim()
    },
    update: {
      title: parsed.data.title.trim(),
      content: parsed.data.content.trim()
    }
  });

  revalidateTag("admin-blogs");
  revalidateTag("public-blogs");

  return NextResponse.json({
    post: {
      id: post.id,
      handle,
      title: post.title,
      content: post.content,
      updatedAt: post.updatedAt.toISOString()
    }
  });
}
