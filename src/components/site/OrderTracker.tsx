import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

export function OrderTracker({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="text-center">
        <p className="text-xs tracking-[0.24em] uppercase text-destructive">Cancelled</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This order was cancelled. Contact us if that wasn't intended.
        </p>
      </div>
    );
  }

  const current = Math.max(0, FLOW.indexOf(status as (typeof FLOW)[number]));

  return (
    <div>
      <p className="text-xs tracking-[0.24em] uppercase text-primary">Order status</p>
      <ol className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
        {FLOW.map((step, i) => {
          const done = i <= current;
          return (
            <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-3 sm:text-center">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-700",
                  done ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </span>
              <span className={cn("text-xs capitalize tracking-[0.14em]", done ? "text-foreground" : "text-muted-foreground")}>
                {step}
              </span>
              {i < FLOW.length - 1 ? (
                <span
                  className={cn(
                    "hidden h-px w-full sm:block",
                    i < current ? "bg-primary/60" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
