"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";

export type RevenuePoint = { date: string; label: string; revenue: number; orders: number };

const LINE = "#6F3467"; // prune-600 : contraste suffisant sur blanc
const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });

/** Revenus quotidiens (une seule série, un seul axe). Le nombre de réservations apparaît dans l'infobulle. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <figure>
      <figcaption className="sr-only">
        Revenus quotidiens sur les 30 derniers jours, total {formatPrice(total)}.
      </figcaption>
      <div className="h-[260px] w-full md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE} stopOpacity={0.18} />
                <stop offset="100%" stopColor={LINE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EADFD2" strokeDasharray="0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#EADFD2" }}
              tick={{ fill: "#6E5F5F", fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6E5F5F", fontSize: 11 }}
              tickFormatter={(v: number) => compact.format(v)}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: "#BB8656", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as RevenuePoint;
                return (
                  <div className="rounded-md border border-sable bg-white px-3 py-2 shadow-lg">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-taupe">{p.label}</p>
                    <p className="mt-1 text-[14px] font-medium tabular-nums text-encre">{formatPrice(p.revenue)}</p>
                    <p className="text-[12px] text-taupe">
                      {p.orders} réservation{p.orders > 1 ? "s" : ""}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={LINE}
              strokeWidth={2}
              fill="url(#revFill)"
              activeDot={{ r: 5, fill: LINE, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
