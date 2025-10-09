import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/theme.css";

type Props = { children: React.ReactNode };

export default function AppLayout({ children }: Props) {
  const title = usePageTitle();
  return (
    <div className="app-shell">
      <Sidebar />
      <Header title={title} />
      <main className="main">{children}</main>
    </div>
  );
}

/* ---------- internal UI ---------- */

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo" />
        <div>PayMeBack</div>
      </div>
      <nav className="nav">
        <NavItem to="/home" label="Home" icon="🏠" />
        <NavItem to="/debts" label="Debts" icon="💳" />
        <NavItem to="/history" label="History" icon="🗂️" />
        <NavItem to="/friends" label="Friends" icon="👥" />
        <NavItem to="/plans" label="Plans" icon="📅" />
        <NavItem to="/payment-method" label="Payment Method" icon="💳" />
        <NavItem to="/settings" label="Settings" icon="⚙️" />
      </nav>
    </aside>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")}>
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </NavLink>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="header">
      <div className="left">
        <div className="title">{title}</div>
      </div>
      <div className="right">
        <div className="search">
          🔍
          <input placeholder="Search people, debts, notes…" />
        </div>
        {/* Moved Quick Actions here */}
        <button className="primary-btn" onClick={() => alert("Add Debt")}>＋ Add Debt</button>
        <button className="primary-btn" onClick={() => alert("Record Payment")}>✓ Record Payment</button>
        <Avatar />
      </div>
    </header>
  );
}

function Avatar() {
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: 12,
        background: "radial-gradient(100% 100% at 30% 20%, #79e3cf 0%, #3fbfa9 60%, #0e7564 100%)",
        border: "1px solid rgba(255,255,255,.18)",
        boxShadow: "var(--shadow-soft)",
      }}
      title="Profile"
    />
  );
}

function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/debts")) return "Debts";
  if (pathname.startsWith("/history")) return "History";
  if (pathname.startsWith("/friends")) return "Friends";
  if (pathname.startsWith("/plans")) return "Plans";
  if (pathname.startsWith("/payment-method")) return "Payment Method";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
}
