import React from "react";
import "./styles/theme.css";
import AppLayout from "./layouts/AppLayout";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Debts from "./pages/Debts";
import History from "./pages/History";
import Friends from "./pages/Friends";
import Settings from "./pages/Settings";
import PaymentMethod from "./pages/PaymentMethod";
import PaymentPlans from "./pages/PaymentPlans";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/history" element={<History />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/payment-method" element={<PaymentMethod />} />
        <Route path="/payment-plans" element={<PaymentPlans />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AppLayout>
  );
}
