import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/theme.css";
export default function AppLayout({ children }) {
    const title = usePageTitle();
    return (_jsxs("div", { className: "app-shell", children: [_jsx(Sidebar, {}), _jsx(Header, { title: title }), _jsx("main", { className: "main", children: children })] }));
}
/* ---------- internal UI ---------- */
function Sidebar() {
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "brand", children: [_jsx("div", { className: "logo" }), _jsx("div", { children: "PayMeBack" })] }), _jsxs("nav", { className: "nav", children: [_jsx(NavItem, { to: "/home", label: "Home", icon: "\uD83C\uDFE0" }), _jsx(NavItem, { to: "/debts", label: "Debts", icon: "\uD83D\uDCB3" }), _jsx(NavItem, { to: "/history", label: "History", icon: "\uD83D\uDDC2\uFE0F" }), _jsx(NavItem, { to: "/friends", label: "Friends", icon: "\uD83D\uDC65" }), _jsx(NavItem, { to: "/plans", label: "Plans", icon: "\uD83D\uDCC5" }), _jsx(NavItem, { to: "/payment-method", label: "Payment Method", icon: "\uD83D\uDCB3" }), _jsx(NavItem, { to: "/settings", label: "Settings", icon: "\u2699\uFE0F" })] })] }));
}
function NavItem({ to, label, icon }) {
    return (_jsxs(NavLink, { to: to, className: ({ isActive }) => (isActive ? "active" : ""), children: [_jsx("span", { className: "icon", children: icon }), _jsx("span", { className: "label", children: label })] }));
}
function Header({ title }) {
    return (_jsxs("header", { className: "header", children: [_jsx("div", { className: "left", children: _jsx("div", { className: "title", children: title }) }), _jsxs("div", { className: "right", children: [_jsxs("div", { className: "search", children: ["\uD83D\uDD0D", _jsx("input", { placeholder: "Search people, debts, notes\u2026" })] }), _jsx("button", { className: "primary-btn", onClick: () => alert("Add Debt"), children: "\uFF0B Add Debt" }), _jsx("button", { className: "primary-btn", onClick: () => alert("Record Payment"), children: "\u2713 Record Payment" }), _jsx(Avatar, {})] })] }));
}
function Avatar() {
    return (_jsx("div", { style: {
            width: 36, height: 36, borderRadius: 12,
            background: "radial-gradient(100% 100% at 30% 20%, #79e3cf 0%, #3fbfa9 60%, #0e7564 100%)",
            border: "1px solid rgba(255,255,255,.18)",
            boxShadow: "var(--shadow-soft)",
        }, title: "Profile" }));
}
function usePageTitle() {
    const { pathname } = useLocation();
    if (pathname.startsWith("/debts"))
        return "Debts";
    if (pathname.startsWith("/history"))
        return "History";
    if (pathname.startsWith("/friends"))
        return "Friends";
    if (pathname.startsWith("/plans"))
        return "Plans";
    if (pathname.startsWith("/payment-method"))
        return "Payment Method";
    if (pathname.startsWith("/settings"))
        return "Settings";
    return "Dashboard";
}
