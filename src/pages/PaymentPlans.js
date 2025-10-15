import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;
function formatCurrency(n) {
    const v = Number(n ?? 0);
    try {
        return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
    }
    catch {
        return `$${v.toFixed(2)}`;
    }
}
function formatDate(d) {
    if (!d)
        return "—";
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(+dt))
        return "—";
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export default function PaymentPlans() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plans, setPlans] = useState([]);
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
                let lastErr = null;
                for (const url of candidates) {
                    try {
                        const r = await fetch(url, {
                            headers: { "Content-Type": "application/json" },
                        });
                        if (r.ok) {
                            const data = await r.json().catch(() => []);
                            const list = Array.isArray(data) ? data : data?.plans ?? [];
                            setPlans(list ?? []);
                            console.log("Plans loaded from:", url, "count:", list?.length ?? 0);
                            lastErr = null;
                            break;
                        }
                        else {
                            lastErr = new Error(`HTTP ${r.status} @ ${url}`);
                        }
                    }
                    catch (e) {
                        lastErr = e;
                    }
                }
                if (lastErr)
                    throw lastErr;
            }
            catch (e) {
                console.error("Plans fetch error:", e);
                setError(e?.message ?? String(e));
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    return (_jsxs("div", { className: "w-full max-w-6xl mx-auto px-6 pb-12", children: [_jsxs("div", { className: "flex items-center justify-between mt-8 mb-6", children: [_jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "Plans" }), _jsxs("div", { className: "text-sm text-white/80", children: [loading && "Loading…", !loading && error && (_jsxs("span", { className: "text-red-200", children: ["Error: ", error] })), !loading && !error && (_jsxs("span", { children: [plans.length, " plan", plans.length === 1 ? "" : "s", " loaded"] }))] })] }), !loading && error && (_jsxs("div", { className: "rounded-2xl border border-red-300/50 bg-red-400/10 text-red-50 p-4 mb-6", children: [_jsx("div", { className: "font-semibold mb-1", children: "Couldn\u2019t load plans" }), _jsxs("div", { className: "text-sm opacity-90", children: [error, ". Confirm your server is reachable at", " ", _jsx("code", { className: "px-1 bg-white/10 rounded", children: API_BASE }), " ", "and exposes ", _jsx("code", { className: "px-1 bg-white/10 rounded", children: "/api/plans" }), "."] })] })), !loading && !error && plans.length === 0 && (_jsx("div", { className: "rounded-2xl border border-white/20 bg-white/5 text-white/90 p-4 mb-6", children: "No plans yet." })), !loading && !error && plans.length > 0 && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: plans.map((p, i) => {
                    // Decide color by direction if provided; default green
                    const direction = typeof p?.meta?.["direction"] === "string"
                        ? String(p.meta["direction"]).toLowerCase()
                        : "";
                    const isOwed = direction !== "owe";
                    const cardColor = isOwed
                        ? "bg-green-500/90 border-green-300/60"
                        : "bg-orange-400/90 border-orange-300/60";
                    const title = (p.name || "").toString().trim() || "Untitled plan";
                    const total = p.amount ?? p.meta?.amount ?? 0;
                    const count = p.count ??
                        (typeof p.meta?.count === "number"
                            ? p.meta.count
                            : undefined);
                    const perPayment = p.amountPerPayment ??
                        p.planAmount ??
                        p.meta?.amountPerPayment ??
                        p.meta?.planAmount ??
                        (count && total ? Math.round((Number(total) / Number(count)) * 100) / 100 : undefined);
                    const nextDue = p.nextDue ??
                        p.meta?.nextDue ??
                        p.meta?.next_due ??
                        undefined;
                    return (_jsxs("div", { className: `rounded-3xl p-6 text-white shadow-sm border ${cardColor}`, children: [_jsx("div", { className: "text-2xl md:text-3xl font-extrabold leading-tight", children: title }), _jsx("div", { className: "mt-3 text-4xl font-extrabold leading-tight", children: formatCurrency(total) }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-sm font-medium opacity-90", children: "Next payment" }), _jsx("div", { className: "mt-1 text-base font-semibold opacity-95", children: formatDate(nextDue) })] }), _jsx("div", { className: "mt-2 text-sm opacity-90", children: formatCurrency(perPayment) }), _jsxs("div", { className: "mt-2 text-xs opacity-90", children: ["Payments remaining:", " ", _jsx("span", { className: "font-semibold", children: deriveRemaining(p, perPayment, total) })] })] }, p.id ?? i));
                }) }))] }));
}
/* ---------- helpers for remaining ---------- */
function deriveRemaining(p, perPayment, total) {
    const m = p.meta || {};
    // explicit
    const explicit = p.paymentsRemaining ??
        m?.paymentsRemaining ??
        p.remaining ??
        m?.remaining;
    const asNum = Number(explicit);
    if (Number.isFinite(asNum) && asNum >= 0)
        return asNum;
    // from arrays (if present)
    const arrays = p.payments ??
        m?.payments ??
        p.installments ??
        m?.installments ??
        m?.schedule ??
        [];
    if (Array.isArray(arrays) && arrays.length) {
        const unpaid = arrays.filter((x) => !/paid|complete|completed|settled/i.test(String(x?.status || ""))).length;
        if (unpaid > 0)
            return unpaid;
    }
    // from total/per-payment
    if (Number.isFinite(perPayment) && Number.isFinite(total) && perPayment > 0) {
        return Math.max(0, Math.round(total / perPayment));
    }
    // fallback
    return 0;
}
