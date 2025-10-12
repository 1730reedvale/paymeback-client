import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlans } from "../hooks/usePlans";

type Frequency = "weekly" | "biweekly" | "monthly";
type Mode = "amount" | "count";

type PlanInput = {
  counterparty?: string;
  total: number;
  mode: Mode;
  amountPerPayment?: number;
  numPayments?: number;
  frequency: Frequency;
  startDate: string;
  timezone: string;
  note?: string;
};

type Installment = { dueDate: string; amount: number };

const APP_FEE_RATE = 0.025;
const { loading, error, plans, refresh } = usePlans();
const EST_PROCESSOR_RATE = 0.029;
const EST_PROCESSOR_FIXED = 0.30;

// Use the Vite proxy to reach backend: /api -> http://localhost:4242
const API_BASE = "/api";
// Dev-only user id until auth is added
const DEV_USER_ID = "user_dev_1";

{/* TEMP: remove after verify */}
<div style={{marginBottom: 16}}>
  {loading && <div>Loading plans…</div>}
  {error && <div style={{color: "salmon"}}>Error: {error}</div>}
  {!loading && !error && (
    <div style={{fontSize: 12, opacity: 0.7}}>
      {plans.length} plan{plans.length === 1 ? "" : "s"} loaded
      <button onClick={refresh} style={{marginLeft: 8}}>Refresh</button>
    </div>
  )}
</div>

export default function PaymentPlans() {
  const [form, setForm] = useState<PlanInput>({
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
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      setServerMsg(`Plan created: ${data.plan?.planId}. ${data.plan?.installments?.length} payments scheduled.`);
    } catch (e: any) {
      setSaving(false);
      setServerErr(e.message || "Failed to create plan.");
    }
  }

  return (
    <>
      <div className="segmented" style={{ marginBottom: 14 }}>
        <button className="tab active">Create Payment Plan</button>
      </div>

      <div className="card-list" style={{ maxWidth: 980 }}>
        {/* Basics */}
        <div className="card">
          <div>
            <div className="title">Plan Basics</div>
            <div className="sub">Define who owes what and when repayments begin.</div>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(180px, 1fr))" }}>
            <Labeled label="Counterparty">
              <input
                placeholder="Name / email / phone"
                value={form.counterparty ?? ""}
                onChange={(e) => setForm(f => ({ ...f, counterparty: e.target.value }))}
                style={inputStyle}
              />
            </Labeled>
            <Labeled label="Total Amount">
              <input
                type="number"
                min={0}
                value={form.total}
                onChange={(e) => setForm(f => ({ ...f, total: num(e.target.value) }))}
                style={inputStyle}
              />
            </Labeled>
            <Labeled label="Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                style={inputStyle}
              />
            </Labeled>
            <Labeled label="Frequency">
              <select
                value={form.frequency}
                onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))}
                style={inputStyle}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every other week</option>
                <option value="monthly">Monthly</option>
              </select>
            </Labeled>
          </div>
        </div>

        {/* Amount vs count */}
        <div className="card">
          <div>
            <div className="title">Amount vs. Number of Payments</div>
            <div className="sub">Pick a fixed installment amount or the number of payments.</div>
          </div>
          <div style={{ width: 12 }} />
          <div className="row">
            <select
              value={form.mode}
              onChange={(e) => setForm(f => ({ ...f, mode: e.target.value as Mode }))}
              style={inputStyle}
            >
              <option value="amount">Fixed amount</option>
              <option value="count"># of payments</option>
            </select>

            {form.mode === "amount" ? (
              <>
                <label className="dim">Amount each</label>
                <input
                  type="number"
                  min={0}
                  value={form.amountPerPayment ?? 100}
                  onChange={(e) => setForm(f => ({ ...f, amountPerPayment: num(e.target.value) }))}
                  style={inputStyle}
                />
              </>
            ) : (
              <>
                <label className="dim"># payments</label>
                <input
                  type="number"
                  min={1}
                  value={form.numPayments ?? 5}
                  onChange={(e) => setForm(f => ({ ...f, numPayments: num(e.target.value) }))}
                  style={inputStyle}
                />
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <div className="title">Note (optional)</div>
          <input
            placeholder="Context for this plan (e.g., Trip split, laptop loan, etc.)"
            value={form.note ?? ""}
            onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>

        {/* Preview */}
        <div className="card">
          <div>
            <div className="title">Preview Schedule</div>
            <div className="sub">Generated from your inputs. Final installment auto-adjusts to hit the exact total.</div>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ width: "100%" }}>
            {schedule.length === 0 ? (
              <div className="dim">Enter details to preview installments.</div>
            ) : (
              <>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {schedule.map((i, idx) => (
                    <li key={idx} className="spread" style={{ padding: "8px 0" }}>
                      <span className="dim">{formatDate(i.dueDate)}</span>
                      <strong>${i.amount.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="hr" />
                <div className="spread">
                  <span className="dim">Payments</span>
                  <strong>{schedule.length}</strong>
                </div>
                <div className="spread">
                  <span className="dim">Total scheduled</span>
                  <strong>${totals.totalScheduled.toFixed(2)}</strong>
                </div>
                <div className="spread">
                  <span className="dim">Remainder</span>
                  <strong>${totals.remainder.toFixed(2)}</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fees */}
        <div className="card">
          <div>
            <div className="title">Fees (transparent)</div>
            <div className="sub">PayMeBack takes <strong>2.5%</strong> per transaction. Processing fees are estimated.</div>
          </div>
          <div style={{ width: 12 }} />
          <div style={{ width: "100%" }}>
            <div className="spread">
              <span className="dim">Our app fee (2.5% of total)</span>
              <strong>${totals.appFee.toFixed(2)}</strong>
            </div>
            <div className="spread">
              <span className="dim">Est. processing fees (2.9% + $0.30 × {schedule.length})</span>
              <strong>${totals.processorFee.toFixed(2)}</strong>
            </div>
            <div className="hr" />
            <div className="spread">
              <span className="dim">Total to be collected</span>
              <strong>${(form.total + totals.appFee + totals.processorFee).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <div className="row">
            <button className="primary-btn" onClick={createPlan} disabled={saving || !schedule.length}>
              {saving ? "Creating…" : "✓ Create Plan"}
            </button>
            <Link to="/payment-method">
              <button className="primary-btn">💳 Add / Manage Payment Method</button>
            </Link>
          </div>
          {serverMsg && <div className="sub" style={{ marginTop: 8 }}>{serverMsg}</div>}
          {serverErr && <div className="sub" style={{ marginTop: 8 }}>Error: {serverErr}</div>}
        </div>
      </div>
    </>
  );
}

/** ---- Helpers & Calculations ---- */
function generateSchedule(input: PlanInput): Installment[] {
  const { total, mode, amountPerPayment, numPayments, frequency, startDate } = input;
  if (!total || total <= 0) return [];
  const start = toDate(startDate);
  if (!start) return [];

  let payments = 0;
  let amount = 0;

  if (mode === "amount") {
    if (!amountPerPayment || amountPerPayment <= 0) return [];
    payments = Math.max(1, Math.ceil(round2(total) / round2(amountPerPayment)));
    amount = round2(amountPerPayment);
  } else {
    if (!numPayments || numPayments <= 0) return [];
    payments = Math.max(1, Math.floor(numPayments));
    amount = round2(total / payments);
  }

  const list: Installment[] = [];
  let runningTotal = 0;

  for (let i = 0; i < payments; i++) {
    const due = addInterval(start, frequency, i);
    let thisAmt = amount;
    if (i === payments - 1) thisAmt = round2(total - runningTotal);
    runningTotal = round2(runningTotal + thisAmt);
    list.push({ dueDate: toISO(due), amount: thisAmt });
  }
  return list;
}

function computeTotals(form: PlanInput, schedule: Installment[]) {
  const totalScheduled = round2(schedule.reduce((s, i) => s + i.amount, 0));
  const remainder = round2((form.total || 0) - totalScheduled);
  const appFee = round2((form.total || 0) * APP_FEE_RATE);
  const processorFee = round2((form.total || 0) * EST_PROCESSOR_RATE + schedule.length * EST_PROCESSOR_FIXED);
  return { totalScheduled, remainder, appFee, processorFee };
}

function addInterval(d: Date, freq: Frequency, stepIndex: number) {
  const copy = new Date(d.getTime());
  if (freq === "weekly") copy.setDate(copy.getDate() + 7 * stepIndex);
  else if (freq === "biweekly") copy.setDate(copy.getDate() + 14 * stepIndex);
  else copy.setMonth(copy.getMonth() + stepIndex);
  return copy;
}

function toDate(s: string) { const d = new Date(s + "T00:00:00"); return isNaN(+d) ? null : d; }
function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function round2(n: number) { return Math.round(n * 100) / 100; }
function num(s: string) { const n = Number(s); return isNaN(n) ? 0 : n; }
function formatDate(s: string) {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

/** ---- Small labeled input helper ---- */
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="dim">{label}</span>
      {children}
    </label>
  );
}

/** ---- Lightweight input style to match theme ---- */
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.12)",
  color: "var(--text)",
  padding: "10px 12px",
  borderRadius: 12,
  outline: "none",
  minWidth: 160,
};
