import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
};

/** Logotype typographique : « Dar » en capitales serif + « Lalla » calligraphié. */
export function Logo({ className, compact = false, tone = "dark" }: LogoProps) {
  return (
    <span className={cn("inline-flex select-none flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "flex items-baseline font-serif font-medium transition-all duration-500 ease-luxe",
          compact ? "text-[24px]" : "text-[28px] md:text-[34px]",
          tone === "dark" ? "text-prune-900" : "text-ivoire"
        )}
      >
        <span className="tracking-[0.14em]">DAR</span>
        <span className={cn("ml-1.5 font-script text-[1.12em] tracking-normal", tone === "dark" ? "text-or-600" : "text-or-300")}>
          Lalla
        </span>
      </span>
      <span
        className={cn(
          "overflow-hidden text-[8.5px] font-medium uppercase tracking-[0.42em] transition-all duration-500 ease-luxe",
          compact ? "mt-0 max-h-0 opacity-0" : "mt-1 max-h-4 opacity-100",
          tone === "dark" ? "text-or-700" : "text-or-300"
        )}
      >
        Location de caftans
      </span>
    </span>
  );
}
