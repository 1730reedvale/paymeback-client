// src/layouts/AppLayout.jsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const S = {
  shell: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1020 0%, #0a1226 100%)",
    color: "#fff",
    fontFamily: "inherit",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  sidebar: {
    padding: "20px 16px",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  brand: {
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "0.3px",
    opacity: 0.92,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    margin: "10px 0 14px 0",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: 6,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    letterSpacing: "0.2px",
    color: "rgba(255,255,255,0.82)",
    transition:
      "background 160ms ease, color 160ms ease, transform 120ms ease",
  },
  linkHover: {
    background: "rgba(255,255,255,0.07)",
    color: "#fff",
    transform: "translateX(2px)",
  },
  linkActive: {
    color: "#fff",
    background:
      "radial-gradient(120% 120% at 0% 0%, rgba(132,94,247,0.25), rgba(0,184,255,0.20) 60%, rgba(0,0,0,0) 100%)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.04) inset, 0 6px 18px rgba(0,0,0,0.35)",
  },
  mainWrap: { display: "grid", gridTemplateRows: "56px 1fr" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.15)",
    backdropFilter: "blur(6px)",
  },
  headerLeft: { fontSize: 14, letterSpacing: "0.25px", opacity: 0.85 },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  btn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "linear-gradient(90deg, rgba(132,94,247,0.25), rgba(0,184,255,0.20))",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: "0.3px",
    cursor: "pointer",
  },
  ghost: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
  },
  main: { overflow: "auto" },
};

const navItems = [
  { to: "/", label: "Home" },
  { to: "/debts", label: "Debts" },
  { to: "/history", label: "History" },
  { to: "/friends", label: "Friends" },
  { to: "/plans", label: "Plans" },
  { to: "/payment-plans", label: "Payment Plans" },
  { to: "/payment-method", label: "Payment Method" },
  { to: "/settings", label: "Profile" },
];

function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside style={S.sidebar} onClick={(e) => e.stopPropagation()}>
      <div style={S.brand}>PayMeBack</div>
      <div style={S.divider} />
      <ul style={S.list}>
        {navItems.map(({ to, label }) => {
          const active =
            pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                style={({ isActive }) => ({
                  ...S.link,
                  ...(isActive || active ? S.linkActive : null),
                })}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, S.linkHover)
                }
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, S.link);
                  if (active)
                    Object.assign(e.currentTarget.style, S.linkActive);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (to !== pathname) navigate(to);
                }}
              >
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default function AppLayout({ children }) {
  const userName =
    (typeof window !== "undefined" &&
      (localStorage.getItem("pm_userName") || "You")) ||
    "You";
  const navigate = useNavigate();

  return (
    <div style={S.shell}>
      <Sidebar />
      <div style={S.mainWrap}>
        <header style={S.header}>
          <div style={S.headerLeft}>Dashboard</div>
          <div style={S.actions}>
            <button style={S.btn} onClick={() => navigate("/plans")}>
              + Create IOU
            </button>
            <div style={{ opacity: 0.85 }}>{userName}</div>
            <button
              style={S.ghost}
              onClick={() => {
                // placeholder: wire to your Auth logout when ready
                localStorage.removeItem("pm_userName");
                navigate("/home");
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main style={S.main}>{children}</main>
      </div>
    </div>
  );
}
