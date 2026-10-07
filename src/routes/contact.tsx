import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Client Services — Aurélien Genève" },
      {
        name: "description",
        content:
          "Speak to Aurélien client services about orders, sizing, servicing or warranty claims.",
      },
      { property: "og:title", content: "Contact Client Services — Aurélien Genève" },
      { property: "og:description", content: "We reply to every message within one working day." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  return (
    <>
      <PageHero
        eyebrow="Client Services"
        title="Contact us"
        description="A real watchmaker or client adviser answers every message, usually within one working day."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal className="space-y-4">
          {[
            { Icon: MapPin, title: "Atelier", lines: ["14 Rue du Rhône", "1204 Genève, Switzerland"] },
            { Icon: Phone, title: "Telephone", lines: ["+41 22 555 19 08", "Mon–Fri, 09:00–18:00 CET"] },
            { Icon: Mail, title: "Email", lines: ["clients@aurelien.example", "service@aurelien.example"] },
            { Icon: Clock, title: "Response time", lines: ["Within one working day", "Same day before 14:00 CET"] },
          ].map(({ Icon, title, lines }) => (
            <div key={title} className="lux-card rounded-lg p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg">{title}</h2>
              {lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-muted-foreground">
                  {l}
                </p>
              ))}
            </div>
          ))}
          <p className="text-xs leading-relaxed text-muted-foreground">
            These contact details are placeholders for the demonstration. Replace them with your real
            address, phone number and email before going live.
          </p>
        </Reveal>

        <Reveal delay={120} className="lux-card rounded-lg p-8">
          <h2 className="text-2xl">Send a message</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent. We'll reply within one working day.");
              setForm({ name: "", email: "", subject: "", message: "" });
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <div className="sm:col-span-2">
              <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
            </div>
            <label className="block sm:col-span-2">
              <span className="text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground">Message</span>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-2 w-full rounded border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="shine-on-hover w-full rounded-full bg-gold-gradient py-3.5 text-xs tracking-[0.2em] uppercase text-primary-foreground"
              >
                Send message
              </button>
            </div>
          </form>
        </Reveal>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
