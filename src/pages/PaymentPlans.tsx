import React, { useEffect, useState } from "react";

type Plan = {
  id?: string;
  name?: string;
  amount?: number;
  count?: number;
  status?: string;
  nextDue?: string | Date;
  meta?: Record<string, unknown>;
};

const API_BASE = import.meta.env.VITE_API_BASE as string;

function formatCurrency(n?: number) {
  const v = Number(n ?? 0);
  try {
    return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  } catch {
    return `$${v.toFixed(2)}`;
  }
}

function formatDate(d?: string | Date) {
  if (!d) return "—";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(+dt)) return "—";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PaymentPlans() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!API_BASE) {
          throw new Error("VITE_API_BASE is not set on Netlify");
        }

        // Try common API paths
        const candidates = [`${API_BASE}/api/plans`, `${API_BASE}/plans`];

        let lastErr: any = null;
        for (const url of candidates) {
          try {
            const r = await fetch(url, {
              headers: { "Content-Type": "application/json" },
            });
            if (r.ok) {
              const data = await r.json().catch(() => []);
              const list: Plan[] = Array.isArray(data) ? data : data?.plans ?? [];
              setPlans(list ?? []);
              console.log("Plans loaded from:", url, "count:", list?.length ?? 0);
              lastErr = null;
              break;
            } else {
              lastErr = new Error(`HTTP ${r.status} @ ${url}`);
            }
          } catch (e) {
            lastErr = e;
          }
        }

        if (lastErr) throw lastErr;
      } catch (e: any) {
        console.error("Plans fetch error:", e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Plans</h1>
        {/* Light status line */}
        <div className="text-sm text-white/80">
          {loading && "Loading…"}
          {!loading && error && (
            <span className="text-red-200">Error: {error}</span>
          )}
          {!loading && !error && (
            <span>{plans.length} plan{plans.length === 1 ? "" : "s"} loaded</span>
          )}
        </div>
      </div>

      {/* Empty / error states */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-300/50 bg-red-400/10 text-red-50 p-4 mb-6">
          <div className="font-semibold mb-1">Couldn’t load plans</div>
          <div className="text-sm opacity-90">
            {error}. Confirm your server is reachable at{" "}
            <code className="px-1 bg-white/10 rounded">{API_BASE}</code>
            {" "}and exposes <code className="px-1 bg-white/10 rounded">/api/plans</code>.
          </div>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="rounded-2xl border border-white/20 bg-white/5 text-white/90 p-4 mb-6">
          No plans yet.
        </div>
      )}

      {/* Plans grid */}
      {!loading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p, i) => {
            // Decide color by direction if provided; default green
            const direction =
              typeof p?.meta?.["direction"] === "string"
                ? String(p.meta!["direction"]).toLowerCase()
                : "";
            const isOwed = direction !== "owe";

            const cardColor = isOwed
              ? "bg-green-500/90 border-green-300/60"
              : "bg-orange-400/90 border-orange-300/60";

            const title = (p.name || "").toString().trim() || "Untitled plan";
            const total = p.amount ?? (p.meta as any)?.amount ?? 0;
            const count =
              p.count ??
              (typeof (p.meta as any)?.count === "number"
                ? (p.meta as any).count
                : undefined);

            const perPayment =
              (p as any).amountPerPayment ??
              (p as any).planAmount ??
              (p.meta as any)?.amountPerPayment ??
              (p.meta as any)?.planAmount ??
              (count && total ? Math.round((Number(total) / Number(count)) * 100) / 100 : undefined);

            const nextDue =
              p.nextDue ??
              (p.meta as any)?.nextDue ??
              (p.meta as any)?.next_due ??
              undefined;

            return (
              <div
                key={p.id ?? i}
                className={`rounded-3xl p-6 text-white shadow-sm border ${cardColor}`}
              >
                {/* Name */}
                <div className="text-2xl md:text-3xl font-extrabold leading-tight">
                  {title}
                </div>

                {/* Total amount big */}
                <div className="mt-3 text-4xl font-extrabold leading-tight">
                  {formatCurrency(total)}
                </div>

                {/* Next payment */}
                <div className="mt-4">
                  <div className="text-sm font-medium opacity-90">Next payment</div>
                  <div className="mt-1 text-base font-semibold opacity-95">
                    {formatDate(nextDue as any)}
                  </div>
                </div>

                {/* Per-payment amount */}
                <div className="mt-2 text-sm opacity-90">
                  {formatCurrency(perPayment)}
                </div>

                {/* Remaining (best-effort) */}
                <div className="mt-2 text-xs opacity-90">
                  Payments remaining:{" "}
                  <span className="font-semibold">
                    {deriveRemaining(p, perPayment, total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- helpers for remaining ---------- */
function deriveRemaining(p: Plan, perPayment?: number, total?: number) {
  const m = p.meta || {};
  // explicit
  const explicit =
    (p as any).paymentsRemaining ??
    (m as any)?.paymentsRemaining ??
    (p as any).remaining ??
    (m as any)?.remaining;

  const asNum = Number(explicit);
  if (Number.isFinite(asNum) && asNum >= 0) return asNum;

  // from arrays (if present)
  const arrays: any[] =
    (p as any).payments ??
    (m as any)?.payments ??
    (p as any).installments ??
    (m as any)?.installments ??
    (m as any)?.schedule ??
    [];
  if (Array.isArray(arrays) && arrays.length) {
    const unpaid = arrays.filter(
      (x: any) => !/paid|complete|completed|settled/i.test(String(x?.status || ""))
    ).length;
    if (unpaid > 0) return unpaid;
  }

  // from total/per-payment
  if (Number.isFinite(perPayment) && Number.isFinite(total) && (perPayment as number) > 0) {
    return Math.max(0, Math.round((total as number) / (perPayment as number)));
  }

  // fallback
  return 0;
}
