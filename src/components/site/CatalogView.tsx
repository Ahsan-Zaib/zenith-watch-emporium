import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import {
  categoriesQuery,
  filterProducts,
  productsQuery,
  uniqueValues,
  type ProductFilters,
  type SortKey,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Most popular" },
];

const PAGE_SIZE = 6;

export function CatalogView({
  preset = {},
  initialSearch = "",
  showGenderFilter = true,
}: {
  preset?: ProductFilters;
  initialSearch?: string;
  showGenderFilter?: boolean;
}) {
  const { data: products = [], isLoading } = useQuery(productsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<string>("");
  const [gender, setGender] = useState<string>(preset.gender ?? "");
  const [brand, setBrand] = useState<string>("");
  const [material, setMaterial] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sort, setSort] = useState<SortKey>(preset.sort ?? "featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = useMemo(() => uniqueValues(products, "brand"), [products]);
  const materials = useMemo(() => uniqueValues(products, "material"), [products]);

  const results = useMemo(
    () =>
      filterProducts(products, {
        ...preset,
        search,
        category: category || undefined,
        gender: gender || undefined,
        brand: brand || undefined,
        material: material || undefined,
        maxPrice,
        sort,
      }),
    [products, preset, search, category, gender, brand, material, maxPrice, sort],
  );

  const shown = results.slice(0, visible);
  const activeCount = [category, gender, brand, material].filter(Boolean).length + (maxPrice < 20000 ? 1 : 0);

  function reset() {
    setCategory("");
    setGender(preset.gender ?? "");
    setBrand("");
    setMaterial("");
    setMaxPrice(20000);
    setSearch("");
  }

  const filterPanel = (
    <div className="space-y-8">
      <FilterGroup label="Category">
        <Chip active={!category} onClick={() => setCategory("")}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.name}
          </Chip>
        ))}
      </FilterGroup>

      {showGenderFilter ? (
        <FilterGroup label="Gender">
          {["", "men", "women", "unisex"].map((g) => (
            <Chip key={g || "all"} active={gender === g} onClick={() => setGender(g)}>
              {g === "" ? "All" : g}
            </Chip>
          ))}
        </FilterGroup>
      ) : null}

      <FilterGroup label="Brand">
        <Chip active={!brand} onClick={() => setBrand("")}>
          All
        </Chip>
        {brands.map((b) => (
          <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
            {b}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Case / strap material">
        <Chip active={!material} onClick={() => setMaterial("")}>
          All
        </Chip>
        {materials.map((m) => (
          <Chip key={m} active={material === m} onClick={() => setMaterial(m)}>
            {m}
          </Chip>
        ))}
      </FilterGroup>

      <div>
        <p className="text-[0.7rem] tracking-[0.24em] uppercase text-primary">Max price</p>
        <input
          type="range"
          min={500}
          max={20000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-4 w-full accent-primary"
        />
        <p className="mt-2 text-sm text-muted-foreground">Up to {formatPrice(maxPrice)}</p>
      </div>

      <button
        type="button"
        onClick={reset}
        className="w-full rounded-full border border-border px-4 py-2.5 text-xs tracking-[0.18em] uppercase transition-colors hover:border-primary hover:text-primary"
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, brand or reference…"
          className="w-full rounded-full border border-border bg-card px-5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary lg:max-w-md"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs tracking-[0.16em] uppercase lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-border bg-card px-4 py-2.5 text-xs tracking-[0.14em] uppercase outline-none focus:border-primary"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="lux-card sticky top-32 rounded-lg p-6">{filterPanel}</div>
        </aside>

        <div>
          <p className="mb-6 text-xs tracking-[0.2em] uppercase text-muted-foreground">
            {isLoading ? "Loading collection…" : `${results.length} timepieces`}
          </p>

          {results.length === 0 && !isLoading ? (
            <div className="lux-card rounded-lg p-14 text-center">
              <h3 className="text-2xl">Nothing matches those filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your price range or clearing a filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}>
                  <ProductCard product={p} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          )}

          {visible < results.length ? (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="shine-on-hover rounded-full bg-gold-gradient px-10 py-3 text-xs tracking-[0.22em] uppercase text-primary-foreground transition-transform duration-500 hover:scale-[1.03]"
              >
                Load more
              </button>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing {shown.length} of {results.length}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-60 flex lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto h-full w-[86%] max-w-sm overflow-y-auto border-l border-border surface-gradient p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm tracking-[0.2em] uppercase text-primary">Filters</p>
              <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.24em] uppercase text-primary">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors duration-500",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
