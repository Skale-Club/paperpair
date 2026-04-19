import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPublicCmsPages } from "@/lib/public-content-data";

export default async function ContactPage() {
  const { contato: page } = await getPublicCmsPages();

  return (
    <section className="space-y-6 rounded-xl border border-sand-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-foreground">{page.title}</h1>
      <p className="text-foreground/70">{page.content}</p>

      <form className="grid gap-3 md:max-w-xl">
        <Input placeholder="Your name" />
        <Input type="email" placeholder="Your email" />
        <Textarea rows={5} placeholder="How can we help?" />
        <Button type="submit" className="bg-primary text-white hover:bg-sky-700">Send</Button>
      </form>
    </section>
  );
}
