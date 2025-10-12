import React, { useState } from "react";
import DebtCard, { Debt } from "../components/DebtCard";
import { useEffect } from "react";
import { api } from "../../lib/api";

export default function Home() {
  const tabs = [
    { id: "toMe", label: "Owed to Me" },
    { id: "iOwe", label: "I Owe" },
    { id: "all", label: "All" },
  ];
  const [activeTab, setActiveTab] = useState<string>("toMe");

  const debts: Record<string, Debt[]> = {
    toMe: [
      { name: "Ava Stone", amount: 120, status: "pending", note: "Lunch + Uber" },
      { name: "Mike Tran", amount: 640, status: "overdue", note: "Concert tickets split" },
      { name: "Priya K.", amount: 75, status: "paid", note: "Coffee run" },
    ],
    iOwe: [
      { name: "Dan R.", amount: 250, status: "pending", note: "Airbnb share" },
      { name: "Sofia L.", amount: 48, status: "pending", note: "Groceries" },
    ],
    all: [],
  };
  debts.all = [...debts.toMe, ...debts.iOwe];

  const list = debts[activeTab] ?? [];
  useEffect(() => {
  (async () => {
    try {
      const r = await api("/health");
      console.log("API /health status:", r.status);
      const txt = await r.text().catch(() => "(no body)");
      console.log("API /health body:", txt);
    } catch (e) {
      console.error("API /health error:", e);
    }
  })();
}, []);

  return (
    <>
      <Segmented tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <div className="card-list">
        {list.map((d, i) => (
          <DebtCard key={i} {...d} />
        ))}
      </div>
    </>
  );
}

function Segmented({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="segmented" role="tablist" aria-label="View switcher">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          className={`tab ${active === t.id ? "active" : ""}`}
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
