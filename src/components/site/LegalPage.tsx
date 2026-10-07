import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";

export type LegalSection = { heading: string; paragraphs?: string[]; bullets?: string[] };

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Last updated {updated}</p>
        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 50}>
              <h2 className="text-2xl">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {s.bullets ? (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
