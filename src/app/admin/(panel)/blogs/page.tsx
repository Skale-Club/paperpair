import { AdminBlogEditor } from "@/components/admin-blog-editor";
import { fromBlogSlug } from "@/lib/cms";
import { getAdminBlogPosts } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await getAdminBlogPosts();

  const initialPosts = posts.map((post) => ({
    id: post.id,
    handle: fromBlogSlug(post.slug),
    title: post.title,
    content: post.content,
    updatedAt: post.updatedAt.toISOString()
  }));

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sand-900">Blog Publisher</h1>
        <p className="mt-1 text-sm text-sand-600">
          Write updates, preview them instantly, and publish when they are ready for the public blog.
        </p>
      </div>
      <AdminBlogEditor initialPosts={initialPosts} />
    </section>
  );
}
