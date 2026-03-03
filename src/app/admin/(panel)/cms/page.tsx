import { AdminCmsEditor } from "@/components/admin-cms-editor";
import { defaultPages, type EditablePage } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  let pages: EditablePage[];

  try {
    const [home, contato, blogs] = await Promise.all([
      prisma.pageContent.findUnique({ where: { slug: "home" } }),
      prisma.pageContent.findUnique({ where: { slug: "contato" } }),
      prisma.pageContent.findUnique({ where: { slug: "blogs" } })
    ]);

    pages = [
      home
        ? { slug: "home", title: home.title, content: home.content }
        : { slug: "home", ...defaultPages.home },
      contato
        ? { slug: "contato", title: contato.title, content: contato.content }
        : { slug: "contato", ...defaultPages.contato },
      blogs
        ? { slug: "blogs", title: blogs.title, content: blogs.content }
        : { slug: "blogs", ...defaultPages.blogs }
    ];
  } catch {
    pages = [
      { slug: "home", ...defaultPages.home },
      { slug: "contato", ...defaultPages.contato },
      { slug: "blogs", ...defaultPages.blogs }
    ];
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-sand-900">Page Editor</h1>
        <p className="mt-1 text-sm text-sand-600">
          Edit public pages with live draft preview, then publish when the copy is ready.
        </p>
      </div>
      <AdminCmsEditor initialPages={pages} />
    </section>
  );
}
