import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
};

export function SectionHeading({ eyebrow, title, description, className, align = "center" }: SectionHeadingProps) {
  return (
    <Reveal className={cn(align === "center" ? "mx-auto text-center" : "text-left", "max-w-2xl", className)}>
      {eyebrow && <p className="eyebrow mb-4 text-or-700">{eyebrow}</p>}
      <h2 className="display text-balance text-[34px] text-prune-900 md:text-[46px]">{title}</h2>
      {description && <p className="mt-5 text-[15px] leading-relaxed text-taupe md:text-base">{description}</p>}
    </Reveal>
  );
}
