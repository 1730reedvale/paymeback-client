import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar.js";
import "./Layout.css"; // optional; ignore if you don't have it
/**
 * A clean layout that does NOT wrap anything in <a href="/"> and
 * does NOT auto-navigate to Home on click. It simply renders the
 * NavBar and the routed content (Outlet or children).
 */
export default function AppLayout({ children }) {
    return (_jsxs("div", { className: "pm-app-shell", style: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }, children: [_jsx("aside", { className: "pm-sidebar", 
                // Block any parent handlers that might force navigation to "/"
                onClick: (e) => { e.stopPropagation(); }, onMouseDown: (e) => { e.stopPropagation(); }, children: _jsx(NavBar, {}) }), _jsx("main", { className: "pm-main", style: { overflow: "auto" }, children: typeof Outlet === "function" ? _jsx(Outlet, {}) : children })] }));
}
