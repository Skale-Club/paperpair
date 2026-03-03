import { BLOG_POST_PREFIX, defaultPages } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  let page: { slug: string; title: string; content: string } = {
    slug: "blogs",
    ...defaultPages.blogs
  };
  let posts: { id: string; title: string; content: string; updatedAt: Date }[] = [];

  try {
    const [pageRecord, postRecords] = await Promise.all([
      prisma.pageContent.findUnique({ where: { slug: "blogs" } }),
      prisma.pageContent.findMany({
        where: {
          slug: {
            startsWith: BLOG_POST_PREFIX
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      })
    ]);

    if (pageRecord) {
      page = pageRecord;
    }

    posts = postRecords;
  } catch {
    posts = [];
  }

  return (
    <section className="space-y-8">
      <header className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Blogs</p>
        <h1
          className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
          {page.content}
        </p>
      </header>

      <section className="grid gap-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-500">
            No blog posts have been published yet.
          </div>
        ) : (
          posts.map((post) => {
            const updatedAt = post.updatedAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            });

            return (
              <article
                key={post.id}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                  Published {updatedAt}
                </p>
                <h2
                  className="mt-3 text-2xl font-semibold text-slate-900"
                  style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                >
                  {post.title}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-slate-600 md:text-base">
                  {post.content}
                </p>
              </article>
            );
          })
        )}
      </section>
    </section>
  );
}
