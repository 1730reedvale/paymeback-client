import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
const APP_FEE_RATE = 0.025;
const EST_PROCESSOR_RATE = 0.029;
const EST_PROCESSOR_FIXED = 0.30;
// Use the Vite proxy to reach backend: /api -> http://localhost:4242
const API_BASE = "/api";
// Dev-only user id until auth is added
const DEV_USER_ID = "user_dev_1";
export default function PaymentPlans() {
    const [form, setForm] = useState({
        counterparty: "",
        total: 500,
        mode: "amount",
        amountPerPayment: 100,
        numPayments: undefined,
        frequency: "biweekly",
        startDate: todayISO(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
        note: "",
    });
    const [saving, setSaving] = useState(false);
    const [serverMsg, setServerMsg] = useState(null);
    const [serverErr, setServerErr] = useState(null);
    const schedule = useMemo(() => generateSchedule(form), [form]);
    const totals = useMemo(() => computeTotals(form, schedule), [form, schedule]);
    async function createPlan() {
        setSaving(true);
        setServerMsg(null);
        setServerErr(null);
        try {
            const res = await fetch(`${API_BASE}/create-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: DEV_USER_ID,
                    counterparty: form.counterparty,
                    total: form.total,
                    mode: form.mode,
                    amountPerPayment: form.amountPerPayment,
                    numPayments: form.numPayments,
                    frequency: form.frequency,
                    startDate: form.startDate,
                    timezone: form.timezone,
                    note: form.note,
                }),
            });
            const data = await res.json().catch(() => ({}));
            setSaving(false);
            if (!res.ok)
                throw new Error(data?.error?.message || `HTTP ${res.status}`);
            setServerMsg(`Plan created: ${data.plan?.planId}. ${data.plan?.installments?.length} payments scheduled.`);
        }
        catch (e) {
            setSaving(false);
            setServerErr(e.message || "Failed to create plan.");
        }
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "segmented", style: { marginBottom: 14 }, children: _jsx("button", { className: "tab active", children: "Create Payment Plan" }) }), _jsxs("div", { className: "card-list", style: { maxWidth: 980 }, children: [_jsxs("div", { className: "card", children: [_jsxs("div", { children: [_jsx("div", { className: "title", children: "Plan Basics" }), _jsx("div", { className: "sub", children: "Define who owes what and when repayments begin." })] }), _jsx("div", { style: { width: 12 } }), _jsxs("div", { style: { display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(180px, 1fr))" }, children: [_jsx(Labeled, { label: "Counterparty", children: _jsx("input", { placeholder: "Name / email / phone", value: form.counterparty ?? "", onChange: (e) => setForm(f => ({ ...f, counterparty: e.target.value })), style: inputStyle }) }), _jsx(Labeled, { label: "Total Amount", children: _jsx("input", { type: "number", min: 0, value: form.total, onChange: (e) => setForm(f => ({ ...f, total: num(e.target.value) })), style: inputStyle }) }), _jsx(Labeled, { label: "Start Date", children: _jsx("input", { type: "date", value: form.startDate, onChange: (e) => setForm(f => ({ ...f, startDate: e.target.value })), style: inputStyle }) }), _jsx(Labeled, { label: "Frequency", children: _jsxs("select", { value: form.frequency, onChange: (e) => setForm(f => ({ ...f, frequency: e.target.value })), style: inputStyle, children: [_jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "biweekly", children: "Every other week" }), _jsx("option", { value: "monthly", children: "Monthly" })] }) })] })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { children: [_jsx("div", { className: "title", children: "Amount vs. Number of Payments" }), _jsx("div", { className: "sub", children: "Pick a fixed installment amount or the number of payments." })] }), _jsx("div", { style: { width: 12 } }), _jsxs("div", { className: "row", children: [_jsxs("select", { value: form.mode, onChange: (e) => setForm(f => ({ ...f, mode: e.target.value })), style: inputStyle, children: [_jsx("option", { value: "amount", children: "Fixed amount" }), _jsx("option", { value: "count", children: "# of payments" })] }), form.mode === "amount" ? (_jsxs(_Fragment, { children: [_jsx("label", { className: "dim", children: "Amount each" }), _jsx("input", { type: "number", min: 0, value: form.amountPerPayment ?? 100, onChange: (e) => setForm(f => ({ ...f, amountPerPayment: num(e.target.value) })), style: inputStyle })] })) : (_jsxs(_Fragment, { children: [_jsx("label", { className: "dim", children: "# payments" }), _jsx("input", { type: "number", min: 1, value: form.numPayments ?? 5, onChange: (e) => setForm(f => ({ ...f, numPayments: num(e.target.value) })), style: inputStyle })] }))] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "title", children: "Note (optional)" }), _jsx("input", { placeholder: "Context for this plan (e.g., Trip split, laptop loan, etc.)", value: form.note ?? "", onChange: (e) => setForm(f => ({ ...f, note: e.target.value })), style: { ...inputStyle, width: "100%" } })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { children: [_jsx("div", { className: "title", children: "Preview Schedule" }), _jsx("div", { className: "sub", children: "Generated from your inputs. Final installment auto-adjusts to hit the exact total." })] }), _jsx("div", { style: { width: 12 } }), _jsx("div", { style: { width: "100%" }, children: schedule.length === 0 ? (_jsx("div", { className: "dim", children: "Enter details to preview installments." })) : (_jsxs(_Fragment, { children: [_jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: schedule.map((i, idx) => (_jsxs("li", { className: "spread", style: { padding: "8px 0" }, children: [_jsx("span", { className: "dim", children: formatDate(i.dueDate) }), _jsxs("strong", { children: ["$", i.amount.toFixed(2)] })] }, idx))) }), _jsx("div", { className: "hr" }), _jsxs("div", { className: "spread", children: [_jsx("span", { className: "dim", children: "Payments" }), _jsx("strong", { children: schedule.length })] }), _jsxs("div", { className: "spread", children: [_jsx("span", { className: "dim", children: "Total scheduled" }), _jsxs("strong", { children: ["$", totals.totalScheduled.toFixed(2)] })] }), _jsxs("div", { className: "spread", children: [_jsx("span", { className: "dim", children: "Remainder" }), _jsxs("strong", { children: ["$", totals.remainder.toFixed(2)] })] })] })) })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { children: [_jsx("div", { className: "title", children: "Fees (transparent)" }), _jsxs("div", { className: "sub", children: ["PayMeBack takes ", _jsx("strong", { children: "2.5%" }), " per transaction. Processing fees are estimated."] })] }), _jsx("div", { style: { width: 12 } }), _jsxs("div", { style: { width: "100%" }, children: [_jsxs("div", { className: "spread", children: [_jsx("span", { className: "dim", children: "Our app fee (2.5% of total)" }), _jsxs("strong", { children: ["$", totals.appFee.toFixed(2)] })] }), _jsxs("div", { className: "spread", children: [_jsxs("span", { className: "dim", children: ["Est. processing fees (2.9% + $0.30 \u00D7 ", schedule.length, ")"] }), _jsxs("strong", { children: ["$", totals.processorFee.toFixed(2)] })] }), _jsx("div", { className: "hr" }), _jsxs("div", { className: "spread", children: [_jsx("span", { className: "dim", children: "Total to be collected" }), _jsxs("strong", { children: ["$", (form.total + totals.appFee + totals.processorFee).toFixed(2)] })] })] })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "row", children: [_jsx("button", { className: "primary-btn", onClick: createPlan, disabled: saving || !schedule.length, children: saving ? "Creating…" : "✓ Create Plan" }), _jsx(Link, { to: "/payment-method", children: _jsx("button", { className: "primary-btn", children: "\uD83D\uDCB3 Add / Manage Payment Method" }) })] }), serverMsg && _jsx("div", { className: "sub", style: { marginTop: 8 }, children: serverMsg }), serverErr && _jsxs("div", { className: "sub", style: { marginTop: 8 }, children: ["Error: ", serverErr] })] })] })] }));
}
/** ---- Helpers & Calculations ---- */
function generateSchedule(input) {
    const { total, mode, amountPerPayment, numPayments, frequency, startDate } = input;
    if (!total || total <= 0)
        return [];
    const start = toDate(startDate);
    if (!start)
        return [];
    let payments = 0;
    let amount = 0;
    if (mode === "amount") {
        if (!amountPerPayment || amountPerPayment <= 0)
            return [];
        payments = Math.max(1, Math.ceil(round2(total) / round2(amountPerPayment)));
        amount = round2(amountPerPayment);
    }
    else {
        if (!numPayments || numPayments <= 0)
            return [];
        payments = Math.max(1, Math.floor(numPayments));
        amount = round2(total / payments);
    }
    const list = [];
    let runningTotal = 0;
    for (let i = 0; i < payments; i++) {
        const due = addInterval(start, frequency, i);
        let thisAmt = amount;
        if (i === payments - 1)
            thisAmt = round2(total - runningTotal);
        runningTotal = round2(runningTotal + thisAmt);
        list.push({ dueDate: toISO(due), amount: thisAmt });
    }
    return list;
}
function computeTotals(form, schedule) {
    const totalScheduled = round2(schedule.reduce((s, i) => s + i.amount, 0));
    const remainder = round2((form.total || 0) - totalScheduled);
    const appFee = round2((form.total || 0) * APP_FEE_RATE);
    const processorFee = round2((form.total || 0) * EST_PROCESSOR_RATE + schedule.length * EST_PROCESSOR_FIXED);
    return { totalScheduled, remainder, appFee, processorFee };
}
function addInterval(d, freq, stepIndex) {
    const copy = new Date(d.getTime());
    if (freq === "weekly")
        copy.setDate(copy.getDate() + 7 * stepIndex);
    else if (freq === "biweekly")
        copy.setDate(copy.getDate() + 14 * stepIndex);
    else
        copy.setMonth(copy.getMonth() + stepIndex);
    return copy;
}
function toDate(s) { const d = new Date(s + "T00:00:00"); return isNaN(+d) ? null : d; }
function toISO(d) { return d.toISOString().slice(0, 10); }
function round2(n) { return Math.round(n * 100) / 100; }
function num(s) { const n = Number(s); return isNaN(n) ? 0 : n; }
function formatDate(s) {
    const d = new Date(s + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
/** ---- Small labeled input helper ---- */
function Labeled({ label, children }) {
    return (_jsxs("label", { style: { display: "grid", gap: 6 }, children: [_jsx("span", { className: "dim", children: label }), children] }));
}
/** ---- Lightweight input style to match theme ---- */
const inputStyle = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "var(--text)",
    padding: "10px 12px",
    borderRadius: 12,
    outline: "none",
    minWidth: 160,
};
