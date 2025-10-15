import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(AppLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/home", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/plans", element: _jsx(Plans, {}) }), _jsx(Route, { path: "/payment-plans", element: _jsx(PaymentPlans, {}) }), _jsx(Route, { path: "/debts", element: _jsx(Debts, {}) }), _jsx(Route, { path: "/history", element: _jsx(History, {}) }), _jsx(Route, { path: "/friends", element: _jsx(Friends, {}) }), _jsx(Route, { path: "/payment-method", element: _jsx(PaymentMethod, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "/index.html", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
