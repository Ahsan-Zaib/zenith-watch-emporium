import { createFileRoute, Link } from "@tanstack/react-router";
import { FAQS } from "@/lib/faq";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Aurélien Genève" },
      {
        name: "description",
        content:
          "Answers on Swiss manufacturing, warranty, delivery times, returns, bracelet sizing, servicing and payment security.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Aurélien Genève" },
      { property: "og:description", content: "Everything collectors ask us before ordering." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Good to know"
        title="Frequently asked questions"
        description="If your question isn't answered here, client services will reply within one working day."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 60} className="lux-card rounded-lg p-7">
              <h2 className="text-xl">{item.q}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <Link
            to="/contact"
            className="rounded-full border border-primary px-9 py-3.5 text-xs tracking-[0.2em] uppercase text-primary transition-colors hover:bg-primary/10"
          >
            Ask us directly
          </Link>
        </Reveal>
      </section>
    </>
  );
}
