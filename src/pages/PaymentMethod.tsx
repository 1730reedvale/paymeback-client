import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Use the Vite proxy: no host/port here, just the /api prefix
const API_BASE = "/api";

// For now, a hardcoded dev user id. Replace with real auth later.
const DEV_USER_ID = "user_dev_1";

export default function PaymentMethodPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/create-setup-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        setClientSecret(data.clientSecret);
        setCustomerId(data.customerId);
      } catch (e: any) {
        console.error("Create SetupIntent failed:", e);
        setError(e.message || "Failed to fetch");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="card-list">
        <div className="card">
          <div className="title">Error</div>
          <div className="sub">{error}</div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="card-list">
        <div className="card"><div className="title">Loading payment form…</div></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
      <CardSetup customerId={customerId!} />
    </Elements>
  );
}

function CardSetup({ customerId }: { customerId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    setMsg(null);
    setErr(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.origin + "/plans",
      },
    });

    if (error) {
      setSaving(false);
      setErr(error.message || "Failed to save payment method.");
      return;
    }

    const paymentMethodId = String(setupIntent?.payment_method || "");
    try {
      const res = await fetch(`${API_BASE}/save-payment-method`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEV_USER_ID,
          customerId,
          paymentMethodId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setSaving(false);
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);

      setMsg(`Saved! Payment method ${paymentMethodId} attached to customer ${customerId}.`);
    } catch (e: any) {
      setSaving(false);
      setErr(e.message || "Failed to persist to server.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-list" style={{ maxWidth: 520 }}>
      <div className="card">
        <div>
          <div className="title">Add a payment method</div>
          <div className="sub">Your card will be saved for automatic installments.</div>
        </div>
      </div>
      <div className="card">
        <PaymentElement />
      </div>
      <div className="card">
        <button className="primary-btn" disabled={!stripe || saving}>
          {saving ? "Saving..." : "Save payment method"}
        </button>
      </div>
      {msg && <div className="card"><div className="sub">{msg}</div></div>}
      {err && <div className="card"><div className="sub">Error: {err}</div></div>}
    </form>
  );
}
