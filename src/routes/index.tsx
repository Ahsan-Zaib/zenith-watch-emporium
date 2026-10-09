import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  Clock,
  Gem,
  Instagram,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { FAQS } from "@/lib/faq";
import { formatPrice } from "@/lib/format";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductRail } from "@/components/site/ProductRail";
import { Newsletter } from "@/components/site/Newsletter";
import { Stars } from "@/components/site/Stars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurélien Genève — Luxury Swiss Watches Since 1908" },
      {
        name: "description",
        content:
          "Discover hand-assembled Swiss timepieces in gold, titanium and steel. Automatics, chronographs, divers and diamond-set dress watches with a 5-year warranty.",
      },
      { property: "og:title", content: "Aurélien Genève — Luxury Swiss Watches Since 1908" },
      {
        property: "og:description",
        content: "Hand-assembled Swiss timepieces with free insured worldwide delivery over $1,000.",
      },
    ],
  }),
  component: HomePage,
});

const GALLERY = [
  "/images/watches/aurum-chrono.jpg",
  "/images/watches/obsidian-diver.jpg",
  "/images/watches/celeste-diamond.jpg",
  "/images/watches/skeleton-royale.jpg",
  "/images/watches/rose-eclipse.jpg",
  "/images/watches/sport-titan.jpg",
];

const REVIEWS = [
  {
    name: "Daniel Reinhardt",
    role: "Collector, Zürich",
    rating: 5,
    text: "I own pieces from three of the big houses. The finishing on the Série Royale holds up against all of them, at a fraction of the price.",
  },
  {
    name: "Amelia Kwan",
    role: "Architect, Singapore",
    rating: 5,
    text: "The Céleste Diamond is understated in exactly the right way. It reads as jewellery in the evening and as an instrument at work.",
  },
  {
    name: "Marcus Lindqvist",
    role: "Pilot, Stockholm",
    rating: 5,
    text: "Bought the Sport Titan GMT for flying. Two years on, it has lost four seconds a week and looks new.",
  },
];

function HomePage() {
  const { data: products = [] } = useQuery(productsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());

  const featured = products.filter((p) => p.is_featured).slice(0, 3);
  const newArrivals = products.filter((p) => p.is_new).slice(0, 3);
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 3);
  const discounted = products
    .filter((p) => p.original_price && Number(p.original_price) > Number(p.price))
    .slice(0, 3);
  const offer = discounted[0];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/hero-watch.jpg"
          alt="Aurora chronograph in gold on dark stone"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">CRAFTED FOR DISTINCTION</p>
            <h1 className="mt-6 text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              Wear Your Legacy

              <span className="block text-gold-gradient">Immaculately.</span>
            </h1>
            <p className="mt-7 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore a refined collection of watches selected for those who appreciate exceptional style
               and timeless design. From sophisticated classics to modern statement pieces, discover a timepiece made to complement every occasion.
              </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="shine-on-hover inline-flex items-center gap-2 rounded-full bg-gold-gradient px-10 py-4 text-xs tracking-[0.22em] uppercase text-primary-foreground transition-transform duration-500 hover:scale-[1.03]"
              >
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/new-arrivals"
                className="rounded-full border border-border px-10 py-4 text-xs tracking-[0.22em] uppercase transition-colors duration-500 hover:border-primary hover:text-primary"
              >
                New arrivals
              </Link>
            </div>
            <div className="mt-14 flex flex-wrap gap-8 text-xs text-muted-foreground">
              {[
                ["3", "Years of Trust, One Timepiece at a Time."],
                ["21", "days of testing"],
                ["5", "year warranty"],
              ].map(([n, label]) => (
                <div key={label}>
                  <p className="font-display text-3xl text-primary">{n}</p>
                  <p className="mt-1 tracking-[0.16em] uppercase">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Explore"
          title="Collections"
          description="Five families, each built around a different way of measuring a life."
          linkTo="/shop"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <Link
                to="/shop"
                className="lux-card group relative block h-64 overflow-hidden rounded-lg"
              >
                <img
                  src={c.image_url ?? "/images/watches/noir-classic.jpg"}
                  alt={c.name}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-60 transition-all duration-[1400ms] group-hover:scale-110 group-hover:opacity-80"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl">{c.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <ProductRail
        eyebrow="Curated"
        title="Featured timepieces"
        description="The references our watchmakers would choose for themselves."
        products={featured}
        linkTo="/shop"
      />

      <ProductRail
        eyebrow="Just Landed"
        title="New arrivals"
        products={newArrivals}
        linkTo="/new-arrivals"
      />

      {/* LIMITED OFFER */}
      {offer ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal className="lux-card grid items-center gap-10 overflow-hidden rounded-lg p-8 md:grid-cols-2 md:p-12">
            <div>
              <p className="eyebrow">Limited-time offer</p>
              <h2 className="mt-4 text-3xl sm:text-4xl">{offer.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
              <div className="mt-6 flex items-end gap-4">
                <p className="font-display text-4xl text-primary">{formatPrice(offer.price)}</p>
                <p className="text-lg text-muted-foreground line-through">
                  {formatPrice(offer.original_price)}
                </p>
              </div>
              <p className="mt-4 text-xs tracking-[0.18em] uppercase text-primary">
                Use code GOLD10 for a further 10% off
              </p>
              <Link
                to="/product/$slug"
                params={{ slug: offer.slug }}
                className="shine-on-hover mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-9 py-3.5 text-xs tracking-[0.2em] uppercase text-primary-foreground"
              >
                Claim this offer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <img
              src={offer.images[0] ?? "/images/watches/aurum-chrono.jpg"}
              alt={offer.name}
              width={1024}
              height={1024}
              loading="lazy"
              className="animate-float rounded-lg object-cover"
            />
          </Reveal>
        </section>
      ) : null}

      <ProductRail
        eyebrow="Collector Favourites"
        title="Best sellers"
        products={bestSellers}
        linkTo="/best-sellers"
      />

      <ProductRail
        eyebrow="Reduced"
        title="Discounted timepieces"
        description="Selected references at reduced pricing while stock lasts."
        products={discounted}
        linkTo="/sale"
      />

      {/* WHY US */}
      <section className="border-y border-border surface-gradient">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Why Aurélien"
            title="Built to outlive its owner"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Gem, title: "In-house calibres", text: "Movements designed, assembled and regulated under one roof in Genève." },
              { Icon: ShieldCheck, title: "5-year warranty", text: "International coverage on every movement, honoured in 40 countries." },
              { Icon: Truck, title: "Insured delivery", text: "Free express shipping over $1,000, fully insured and signed for." },
              { Icon: Clock, title: "Lifetime servicing", text: "We service every watch we have ever made, however old." },
            ].map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 90} className="lux-card rounded-lg p-7">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Owners" title="What collectors say" align="center" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 100} className="lux-card rounded-lg p-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
                <Stars rating={r.rating} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading eyebrow="@aurelien.geneve" title="From the atelier" align="center" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GALLERY.map((src, i) => (
            <Reveal key={src} delay={i * 60}>
              <div className="group relative aspect-square overflow-hidden rounded">
                <img
                  src={src}
                  alt="Aurélien timepiece"
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <span className="absolute inset-0 grid place-items-center bg-background/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Instagram className="h-5 w-5 text-primary" />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Good to know" title="Frequently asked" linkTo="/faq" linkLabel="All questions" />
        <div className="mt-10 space-y-4">
          {FAQS.slice(0, 4).map((item, i) => (
            <Reveal key={item.q} delay={i * 80} className="lux-card rounded-lg p-6">
              <h3 className="text-lg">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Newsletter />

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <Reveal className="flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase text-muted-foreground">
          <Award className="h-4 w-4 text-primary" />
          Geneva Seal certified · Chronometer tested · Ethically sourced gold
        </Reveal>
      </section>
    </>
  );
}
