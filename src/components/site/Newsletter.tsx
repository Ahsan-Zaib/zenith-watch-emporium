import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "./Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="lux-card relative overflow-hidden rounded-lg px-6 py-14 text-center sm:px-14">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <p className="eyebrow">The Private List</p>
        <h2 className="mt-4 text-3xl sm:text-4xl">First access to limited references</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Join collectors who hear about new calibres, restocks and private events before anyone else.
          One considered email a month — nothing more.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            toast.success("You're on the list. Welcome to Aurélien.");
            setEmail("");
          }}
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-full border border-border bg-background/60 px-5 py-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            className="shine-on-hover rounded-full bg-gold-gradient px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-primary-foreground"
          >
            Subscribe
          </button>
        </form>
      </Reveal>
    </section>
  );
}
