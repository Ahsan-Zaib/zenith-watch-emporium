import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  size = 14,
  className,
}: {
  rating: number | string;
  size?: number;
  className?: string;
}) {
  const value = Number(rating) || 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={cn(
            "transition-colors",
            i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}
