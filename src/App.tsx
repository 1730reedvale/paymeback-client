// src/App.tsx
// @ts-nocheck
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// SAFE layout (no anchor wrappers, no click-to-home)
import AppLayout from "./layouts/AppLayout.js";

// New Home
import HomePage from "./home/HomePage";

// Existing pages
import Plans from "./pages/Plans.js";
import PaymentPlans from "./pages/PaymentPlans.js";
import Debts from "./pages/Debts.js";
import History from "./pages/History.js";
import Friends from "./pages/Friends.js";
import Settings from "./pages/Settings.js";
import PaymentMethod from "./pages/PaymentMethod.js";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Home */}
        <Route index element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Primary sections */}
        <Route path="/plans" element={<Plans />} />
        <Route path="/payment-plans" element={<PaymentPlans />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/history" element={<History />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/payment-method" element={<PaymentMethod />} />
        <Route path="/settings" element={<Settings />} />

        {/* Fallbacks */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

