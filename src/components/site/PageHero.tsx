import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border surface-gradient">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
        <Reveal className="max-w-2xl">
          {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
          <h1 className="text-4xl leading-tight sm:text-5xl md:text-6xl">{title}</h1>
          {description ? (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
