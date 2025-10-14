import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
const NAV = [
    { to: "/", label: "Overview", exact: true },
    { to: "/plans", label: "Plans" },
    { to: "/wallet", label: "Wallet" },
    { to: "/history", label: "History" },
    { to: "/contacts", label: "Contacts" },
    { to: "/settings", label: "Settings" },
];
export default function Layout() {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "app-backdrop" }), _jsxs("div", { className: "layout", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "row mb-4", style: { justifyContent: "space-between" }, children: [_jsx("div", { style: { fontWeight: 800, letterSpacing: "0.08em" }, children: "PAYMEBACK" }), _jsx(Badge, { children: "PMB" })] }), _jsx("div", { className: "nav-title", children: "Control the follow-up" }), _jsx("nav", { className: "stack", children: NAV.map((item) => (_jsxs(NavLink, { to: item.to, end: item.exact, className: ({ isActive }) => `nav-item${isActive ? " active" : ""}`, children: [_jsx("span", { "aria-hidden": true, style: {
                                                width: 26,
                                                height: 26,
                                                borderRadius: 8,
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                                            } }), _jsx("span", { children: item.label })] }, item.to))) }), _jsx("div", { style: { marginTop: 28 }, children: _jsx("a", { href: "/create-iou", className: "btn w-full", "aria-label": "Create a new IOU", children: "+ Create a new IOU" }) })] }), _jsxs("main", { className: "stack", children: [_jsxs("header", { className: "header", children: [_jsxs("div", { className: "search", role: "search", children: [_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", opacity: 0.7 }) }), _jsx("input", { "aria-label": "Search plans, contacts, or activity", placeholder: "Search plans, contacts, or activity", style: {
                                                    background: "transparent",
                                                    border: "none",
                                                    outline: "none",
                                                    color: "var(--text-0)",
                                                    width: "100%",
                                                } })] }), _jsx("button", { className: "btn", type: "button", "aria-label": "Logout", children: "Logout" })] }), _jsx("div", { className: "stack", children: _jsx(Outlet, {}) })] })] })] }));
}
function Badge({ children }) {
    return (_jsx("div", { style: {
            fontSize: 12,
            fontWeight: 800,
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(90deg, var(--brand-1), var(--brand-2))",
        }, "aria-hidden": true, children: children }));
}
