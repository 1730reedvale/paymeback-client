// /src/layout/Layout.tsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

type NavItem = { to: string; label: string; exact?: boolean };

const NAV: NavItem[] = [
  { to: "/", label: "Overview", exact: true },
  { to: "/plans", label: "Plans" },
  { to: "/wallet", label: "Wallet" },
  { to: "/history", label: "History" },
  { to: "/contacts", label: "Contacts" },
  { to: "/settings", label: "Settings" },
];

export default function Layout(): JSX.Element {
  return (
    <>
      <div className="app-backdrop" />
      <div className="layout">
        <aside className="sidebar">
          <div className="row mb-4" style={{ justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800, letterSpacing: "0.08em" }}>PAYMEBACK</div>
            <Badge>PMB</Badge>
          </div>

          <div className="nav-title">Control the follow-up</div>
          <nav className="stack">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <span
                  aria-hidden
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  }}
                />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div style={{ marginTop: 28 }}>
            <a href="/create-iou" className="btn w-full" aria-label="Create a new IOU">
              + Create a new IOU
            </a>
          </div>
        </aside>

        <main className="stack">
          <header className="header">
            <div className="search" role="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.7}
                />
              </svg>
              <input
                aria-label="Search plans, contacts, or activity"
                placeholder="Search plans, contacts, or activity"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-0)",
                  width: "100%",
                }}
              />
            </div>

            <button className="btn" type="button" aria-label="Logout">
              Logout
            </button>
          </header>

          <div className="stack">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(90deg, var(--brand-1), var(--brand-2))",
      }}
      aria-hidden
    >
      {children}
    </div>
  );
}
