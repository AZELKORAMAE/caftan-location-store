import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-serif text-[34px] font-light leading-tight text-prune-900 md:text-[40px]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-taupe">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

export function Card({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-sable bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-sable px-5 py-4">
          {title && <h2 className="font-serif text-xl text-prune-900">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  highlight?: boolean;
};

export function StatCard({ label, value, hint, delta, icon: Icon, highlight }: StatCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border p-5", highlight ? "border-prune-900 bg-prune-900 text-ivoire" : "border-sable bg-white")}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[11px] font-medium uppercase tracking-[0.18em]", highlight ? "text-or-300" : "text-taupe")}>{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", highlight ? "bg-white/10 text-or-300" : "bg-champagne text-or-700")}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
      </div>
      <p className={cn("mt-3 font-serif text-[32px] leading-none tabular-nums", highlight ? "text-ivoire" : "text-prune-900")}>{value}</p>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta != null && Number.isFinite(delta) && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              delta >= 0 ? (highlight ? "text-emerald-300" : "text-emerald-700") : highlight ? "text-prune-200" : "text-prune-600"
            )}
          >
            {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(0)} %
          </span>
        )}
        {hint && <span className={highlight ? "text-or-100/70" : "text-taupe"}>{hint}</span>}
      </div>
    </div>
  );
}

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-sable bg-white px-6 py-16 text-center">
      <p className="font-serif text-2xl text-prune-900">{title}</p>
      {text && <p className="mt-2 max-w-sm text-[14px] text-taupe">{text}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
