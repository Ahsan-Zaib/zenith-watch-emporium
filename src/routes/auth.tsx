import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — Aurélien Genève" },
      {
        name: "description",
        content: "Sign in to track orders, save a wishlist and check out faster at Aurélien Genève.",
      },
      { property: "og:title", content: "Sign In — Aurélien Genève" },
      { property: "og:description", content: "Access your account, orders and wishlist." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) void navigate({ to: "/account" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setSent(true);
        toast.success("Check your email to confirm your account");
        return;
      }
      void navigate({ to: "/account" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back");
      void navigate({ to: "/account" });
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/account" });
  }

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Client Services</p>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
            {mode === "signin" ? "Welcome back to the maison" : "Create your Aurélien account"}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Track every order, keep a private wishlist, store your delivery details and receive first
            access to limited references before they are announced publicly.
          </p>
          <img
            src="/images/watches/skeleton-royale.jpg"
            alt="Aurélien skeleton movement"
            width={1024}
            height={1024}
            loading="lazy"
            className="mt-10 hidden w-full max-w-sm rounded-lg object-cover lg:block"
          />
        </Reveal>

        <Reveal delay={120} className="lux-card rounded-lg p-8">
          {sent ? (
            <div className="text-center">
              <h2 className="text-2xl">Confirm your email</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                We've sent a confirmation link to {email}. Click it to activate your account, then sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setMode("signin");
                }}
                className="mt-6 text-xs tracking-[0.18em] uppercase text-primary"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="flex rounded-full border border-border p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-full py-2.5 text-xs tracking-[0.18em] uppercase transition-colors duration-500 ${
                      mode === m ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-7 space-y-4">
                {mode === "signup" ? (
                  <Field label="Full name" value={fullName} onChange={setFullName} required />
                ) : null}
                <Field label="Email" type="email" value={email} onChange={setEmail} required />
                <Field label="Password" type="password" value={password} onChange={setPassword} required />
                <button
                  type="submit"
                  disabled={busy}
                  className="shine-on-hover flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient py-3.5 text-xs tracking-[0.2em] uppercase text-primary-foreground disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={google}
                className="w-full rounded-full border border-border py-3.5 text-xs tracking-[0.18em] uppercase transition-colors duration-500 hover:border-primary hover:text-primary"
              >
                Continue with Google
              </button>
            </>
          )}
        </Reveal>
      </div>
    </section>
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
