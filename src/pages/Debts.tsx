import React from "react";
import DebtCard from "../components/DebtCard";

export default function Debts() {
  const sample = [
    { name: "Chris P.", amount: 120, status: "pending" as const, note: "Movie night" },
    { name: "Lana Q.", amount: 980, status: "overdue" as const, note: "Group trip" },
  ];
  return (
    <>
      <div className="segmented">
        <button className="tab active">All Debts</button>
        <button className="tab">Owed to Me</button>
        <button className="tab">I Owe</button>
      </div>
      <div className="card-list">
        {sample.map((d, i) => (
          <DebtCard key={i} {...d} />
        ))}
      </div>
    </>
  );
}
