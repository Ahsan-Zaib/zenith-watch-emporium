import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Gem, Hammer, Leaf } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Maison — Aurélien Genève" },
      {
        name: "description",
        content:
          "Founded in Genève in 1908, Aurélien builds in-house calibres by hand, one watchmaker per movement.",
      },
      { property: "og:title", content: "About the Maison — Aurélien Genève" },
      { property: "og:description", content: "118 years of independent Swiss watchmaking." },
    ],
  }),
  component: AboutPage,
});

const TIMELINE = [
  ["1908", "Henri Aurélien opens a two-bench workshop on Rue du Rhône."],
  ["1954", "The Heritage 1954 introduces our first automatic calibre."],
  ["1988", "The Obsidian dive series is certified to 300 metres."],
  ["2011", "Our skeleton bridges win the Geneva Seal for hand finishing."],
  ["2026", "Direct-to-collector, removing three layers of retail margin."],
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The Maison"
        title="One watchmaker, one movement"
        description="We are independent, family-held and deliberately small. Fewer than 4,000 watches leave Genève each year, and each one is signed by the person who assembled it."
      />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <img
            src="/images/watches/skeleton-royale.jpg"
            alt="Hand-finished skeleton movement"
            width={1024}
            height={1024}
            loading="lazy"
            className="rounded-lg object-cover"
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow">Our craft</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">Finishing you will rarely see</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Bevels are cut by hand under a loupe. Bridges are black-polished on tin plates until they
            read as mirrors. None of it makes a watch keep better time — it is simply the difference
            between an object made to a price and an object made properly.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Every finished watch runs on a nine-position cycle for 21 days. If it drifts beyond
            −2/+4 seconds a day, it returns to the bench rather than the box.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { Icon: Hammer, label: "Hand-bevelled bridges" },
              { Icon: Gem, label: "Ethically sourced gold" },
              { Icon: Award, label: "Geneva Seal certified" },
              { Icon: Leaf, label: "Carbon-neutral shipping" },
            ].map(({ Icon, label }) => (
              <div key={label} className="glass-panel flex items-center gap-3 rounded-lg p-4">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-y border-border surface-gradient">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="History" title="118 years, five moments" align="center" />
          <ol className="mt-12 space-y-8">
            {TIMELINE.map(([year, text], i) => (
              <Reveal key={year} delay={i * 90} className="flex gap-6">
                <span className="font-display text-2xl text-primary">{year}</span>
                <span className="flex-1 border-l border-border pl-6 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl">Visit the collection</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Every reference is available to order directly, with insured worldwide delivery.
          </p>
          <Link
            to="/shop"
            className="shine-on-hover mt-8 inline-block rounded-full bg-gold-gradient px-10 py-3.5 text-xs tracking-[0.22em] uppercase text-primary-foreground"
          >
            Shop all watches
          </Link>
        </Reveal>
      </section>
    </>
  );
}
