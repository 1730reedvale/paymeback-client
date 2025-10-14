import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// /src/home/HomePage.jsx
// @ts-nocheck
import { useEffect, useMemo, useState, useCallback } from "react";
const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "https://paymeback-server-1.onrender.com")
    .replace(/\/$/, "");
export default function HomePage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    // ---- robust loader with retry (3 tries, short backoff) ----
    const loadPlans = useCallback(async () => {
        setErr("");
        setLoading(true);
        const tries = 3;
        for (let i = 1; i <= tries; i++) {
            try {
                const res = await fetch(`${API_BASE}/api/plans`, { method: "GET", mode: "cors" });
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setPlans(Array.isArray(data?.plans) ? data.plans : []);
                setLoading(false);
                return;
            }
            catch (e) {
                if (i < tries) {
                    await new Promise((r) => setTimeout(r, 300 * i));
                    continue;
                }
                console.error("Load plans failed:", e);
                setErr("Could not load plans.");
                setPlans([]); // graceful empty
                setLoading(false);
            }
        }
    }, []);
    useEffect(() => {
        let alive = true;
        (async () => {
            await loadPlans();
            if (!alive)
                return;
        })();
        return () => {
            alive = false;
        };
    }, [loadPlans]);
    // ===== Insight Center rollups (ties out with rows) =====
    const wallet = useMemo(() => {
        let incomingRemaining = 0; // you are owed
        let outgoingRemaining = 0; // you owe
        for (const p of plans) {
            const remaining = coercePositive(p.totalRemaining) ||
                coercePositive(p.remaining) ||
                coercePositive(p.amount) * Math.max(1, toNumber(p.totalPayments) || 1);
            const dir = (typeof p.direction === "string" && p.direction.toLowerCase()) ||
                (p.isIncoming ? "incoming" : null) ||
                "incoming"; // default: owed TO you
            if (dir === "outgoing")
                outgoingRemaining += remaining;
            else
                incomingRemaining += remaining;
        }
        const youAreOwed = incomingRemaining;
        const youOwe = outgoingRemaining;
        const netTotal = youAreOwed - youOwe;
        return { youAreOwed, youOwe, netTotal };
    }, [plans]);
    return (_jsxs("div", { className: "stack", children: [_jsx("section", { className: "card", style: styles.heroCard, children: _jsxs("div", { style: styles.heroGrid, children: [_jsxs("div", { style: styles.heroLeft, children: [_jsx("div", { style: styles.heroKicker, children: "INSIGHT CENTER" }), _jsxs("h1", { style: styles.heroTitle, children: ["Keep every IOU on", _jsx("br", {}), "schedule without the", _jsx("br", {}), "awkward follow-up"] }), _jsx("p", { style: styles.heroSub, children: "PayMeBack turns repayments into a calm, transparent workflow. Track balances, share gentle reminders, and celebrate when everyone settles up." }), _jsxs("div", { style: styles.heroActions, children: [_jsx("a", { href: "/create-iou", className: "btn", "aria-label": "Create IOU", children: "Create IOU \u2192" }), _jsx("button", { type: "button", className: "btn", style: styles.btnGhost, children: "Invite contact" })] })] }), _jsxs("div", { style: styles.heroRight, children: [_jsx(MetricTile, { label: "OUTSTANDING IOUs", value: plans.length }), _jsx(MetricTile, { label: "YOU ARE OWED", value: wallet.youAreOwed, money: true }), _jsx(MetricTile, { label: "YOU OWE", value: wallet.youOwe, money: true }), _jsx(MetricTile, { label: "NET TOTAL", value: wallet.netTotal, money: true })] })] }) }), _jsxs("section", { className: "card", children: [_jsx("div", { className: "section-title", children: "Latest Activity" }), loading ? (_jsx("div", { style: { color: "var(--text-1)", fontSize: 16 }, children: "Loading\u2026" })) : (_jsxs("div", { className: "latest-activity", children: [_jsxs("div", { className: "iou-row", style: {
                                    background: "transparent",
                                    border: "1px dashed rgba(255,255,255,0.12)",
                                    fontWeight: 700,
                                    fontSize: 14,
                                }, "aria-hidden": true, children: [_jsx("div", { className: "who", children: "With" }), _jsx("div", { className: "note", children: "Note" }), _jsx("div", { className: "date", children: "Next Payment Date" }), _jsx("div", { className: "amt", children: "Next Payment" }), _jsx("div", { className: "total", children: "Total Remaining" })] }), err || plans.length === 0 ? (_jsx(EmptyState, { err: err, onRetry: loadPlans })) : (plans.map((p) => (_jsx(IOURow, { plan: p }, p.id || `${p.with || p.name || "row"}-${Math.random()}`))))] }))] })] }));
}
/* ===== Hero metric tile (2×2) ===== */
function MetricTile({ label, value, money = false }) {
    return (_jsxs("div", { style: styles.tile, children: [_jsx("div", { style: styles.tileLabel, children: label }), _jsx("div", { style: styles.tileValue, children: money ? `$${formatMoney(toNumber(value))}` : String(value) }), _jsx("div", { style: styles.tileDelta, "aria-hidden": true })] }));
}
/* ===== Activity Row (direction + overdue color logic) ===== */
function IOURow({ plan }) {
    const who = plan.with || plan.counterparty || plan.name || plan.to || plan.from || "Unknown";
    const note = plan.note || plan.title || plan.description || "—";
    const nextPaymentDate = parseDate(plan.nextPaymentDate) || parseDate(plan.date) || null;
    const amount = coercePositive(plan.amount);
    const totalRemaining = coercePositive(plan.totalRemaining) ||
        coercePositive(plan.remaining) ||
        amount * Math.max(1, toNumber(plan.totalPayments) || 1);
    const direction = (typeof plan.direction === "string" && plan.direction.toLowerCase()) ||
        (plan.isIncoming ? "incoming" : null) ||
        "incoming";
    const overdue = nextPaymentDate && stripTime(nextPaymentDate) < stripTime(new Date());
    const GREEN = "#34d399";
    const ORANGE = "#f59e0b";
    const RED = "#ef4444";
    const amtColor = overdue ? RED : direction === "outgoing" ? ORANGE : GREEN;
    const rowBorder = overdue
        ? "1px solid rgba(239,68,68,0.35)"
        : direction === "outgoing"
            ? "1px solid rgba(245,158,11,0.28)"
            : "1px solid rgba(52,211,153,0.28)";
    return (_jsxs("div", { className: "iou-row", style: { fontSize: 16, border: rowBorder, background: "rgba(255,255,255,0.03)" }, title: overdue
            ? "Overdue"
            : direction === "outgoing"
                ? "You owe"
                : "You are owed", children: [_jsx("div", { className: "who", title: who, children: who }), _jsx("div", { className: "note", title: note, children: note }), _jsx("div", { className: "date", children: nextPaymentDate ? fmtDate(nextPaymentDate) : "—" }), _jsxs("div", { className: "amt", style: { color: amtColor }, children: ["$", formatMoney(amount)] }), _jsxs("div", { className: "total", style: { color: overdue ? RED : GREEN }, children: ["$", formatMoney(totalRemaining)] })] }));
}
/* ===== Empty state with retry ===== */
function EmptyState({ err, onRetry }) {
    return (_jsx("div", { style: {
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.12)",
            padding: 18,
            borderRadius: 12,
            color: "var(--text-1)",
            fontSize: 16,
        }, children: err ? (_jsxs(_Fragment, { children: [_jsx("div", { style: { marginBottom: 8 }, children: err }), _jsx("button", { className: "btn", onClick: onRetry, type: "button", "aria-label": "Retry loading plans", children: "Retry" })] })) : (_jsxs(_Fragment, { children: ["No activity yet. Click ", _jsx("b", { children: "+ Create a new IOU" }), " to get started."] })) }));
}
/* ===== Inline styles (hero look with subtle blue/pink glow on tiles) ===== */
const styles = {
    heroCard: { padding: 22 },
    heroGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 },
    heroLeft: {
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 12px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    heroKicker: { color: "var(--muted)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 },
    heroTitle: { margin: "4px 0 10px", fontSize: 36, lineHeight: 1.12, fontWeight: 900 },
    heroSub: { margin: 0, color: "var(--text-1)", fontSize: 15, maxWidth: 720 },
    heroActions: { display: "flex", gap: 10, marginTop: 16 },
    btnGhost: { background: "transparent", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "none" },
    heroRight: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "start" },
    tile: {
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        border: "1px solid rgba(43,107,255,0.28)", // subtle blue ring
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 14px 44px rgba(43,107,255,0.15), 0 0 0 1px rgba(255,87,160,0.08) inset, inset 0 1px 0 rgba(255,255,255,0.04)", // blue/pink hybrid glow
    },
    tileLabel: { color: "var(--muted)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 },
    tileValue: { fontSize: 26, fontWeight: 900 },
    tileDelta: { marginTop: 6, fontSize: 12, opacity: 0.9 },
};
/* ===== helpers ===== */
function toNumber(x) {
    const n = typeof x === "string" ? Number(x) : x;
    return Number.isFinite(n) ? n : 0;
}
function coercePositive(x) {
    const n = toNumber(x);
    return n >= 0 ? n : 0;
}
function parseDate(v) {
    if (!v)
        return null;
    try {
        if (v?._seconds)
            return new Date(v._seconds * 1000);
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }
    catch {
        return null;
    }
}
function stripTime(d) {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    return t;
}
function fmtDate(d) {
    try {
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }
    catch {
        return "—";
    }
}
function formatMoney(x) {
    return toNumber(x).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
