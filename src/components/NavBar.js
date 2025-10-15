// src/components/NavBar.js
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const items = [
  { to: "/", label: "Home" },
  { to: "/debts", label: "Debts" },
  { to: "/history", label: "History" },
  { to: "/friends", label: "Friends" },
  { to: "/plans", label: "Plans" },
  { to: "/payment-plans", label: "Payment Plans" },
  { to: "/payment-method", label: "Payment Method" },
  { to: "/settings", label: "Profile" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Prevent any outer anchors from hijacking clicks
  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <nav className="pm-navbar" onClick={stop} onMouseDown={stop}>
      <div className="pm-navbar__brand" role="button" tabIndex={0} onClick={stop} onMouseDown={stop}>
        <span className="pm-navbar__logo">PayMeBack</span>
      </div>

      <ul className="pm-navbar__list">
        {items.map(({ to, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <li key={to} className={"pm-navbar__item" + (active ? " pm-navbar__item--active" : "")}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  "pm-navbar__link" + (isActive || active ? " pm-navbar__link--active" : "")
                }
                onClick={stop}
                onMouseDown={(e) => {
                  // ensure no outer wrapper steals the click
                  stop(e);
                  if (to !== pathname) navigate(to);
                }}
              >
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
