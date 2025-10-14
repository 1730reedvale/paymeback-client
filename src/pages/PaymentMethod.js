import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
// Use the Vite proxy: no host/port here, just the /api prefix
const API_BASE = "/api";
// For now, a hardcoded dev user id. Replace with real auth later.
const DEV_USER_ID = "user_dev_1";
export default function PaymentMethodPage() {
    const [clientSecret, setClientSecret] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/create-setup-intent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok)
                    throw new Error(data?.error?.message || `HTTP ${res.status}`);
                setClientSecret(data.clientSecret);
                setCustomerId(data.customerId);
            }
            catch (e) {
                console.error("Create SetupIntent failed:", e);
                setError(e.message || "Failed to fetch");
            }
        })();
    }, []);
    if (error) {
        return (_jsx("div", { className: "card-list", children: _jsxs("div", { className: "card", children: [_jsx("div", { className: "title", children: "Error" }), _jsx("div", { className: "sub", children: error })] }) }));
    }
    if (!clientSecret) {
        return (_jsx("div", { className: "card-list", children: _jsx("div", { className: "card", children: _jsx("div", { className: "title", children: "Loading payment form\u2026" }) }) }));
    }
    return (_jsx(Elements, { stripe: stripePromise, options: { clientSecret, appearance: { theme: "night" } }, children: _jsx(CardSetup, { customerId: customerId }) }));
}
function CardSetup({ customerId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        if (!stripe || !elements)
            return;
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
            if (!res.ok)
                throw new Error(data?.error?.message || `HTTP ${res.status}`);
            setMsg(`Saved! Payment method ${paymentMethodId} attached to customer ${customerId}.`);
        }
        catch (e) {
            setSaving(false);
            setErr(e.message || "Failed to persist to server.");
        }
    }
    return (_jsxs("form", { onSubmit: onSubmit, className: "card-list", style: { maxWidth: 520 }, children: [_jsx("div", { className: "card", children: _jsxs("div", { children: [_jsx("div", { className: "title", children: "Add a payment method" }), _jsx("div", { className: "sub", children: "Your card will be saved for automatic installments." })] }) }), _jsx("div", { className: "card", children: _jsx(PaymentElement, {}) }), _jsx("div", { className: "card", children: _jsx("button", { className: "primary-btn", disabled: !stripe || saving, children: saving ? "Saving..." : "Save payment method" }) }), msg && _jsx("div", { className: "card", children: _jsx("div", { className: "sub", children: msg }) }), err && _jsx("div", { className: "card", children: _jsxs("div", { className: "sub", children: ["Error: ", err] }) })] }));
}
