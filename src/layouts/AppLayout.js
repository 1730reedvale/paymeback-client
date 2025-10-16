// src/layouts/AppLayout.js
import React from "react";
import NavBar from "../components/NavBar.jsx";
import "./Layout.css"; // ok if minimal

export default function AppLayout({ children }) {
  return (
    <div className="pm-app-shell" style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside
        className="pm-sidebar"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <NavBar />
      </aside>

      {/* IMPORTANT: always render the passed-in children (our <Routes/>) */}
      <main className="pm-main" style={{ overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
