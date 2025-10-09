import React from "react";

export type Debt = {
  name: string;
  amount: number;
  status?: "pending" | "paid" | "overdue";
  note?: string;
};

export default function DebtCard({ name, amount, status = "pending", note }: Debt) {
  return (
    <div className="card">
      <div className="meta">
        <div
          className="avatar"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "linear-gradient(180deg,#79e3cf,#3fbfa9)"
          }}
        />
        <div>
          <div className="title">{name}</div>
          <div className="sub">{note}</div>
        </div>
      </div>
      <div className="row">
        <strong>${Number(amount).toLocaleString()}</strong>
        <span className={`chip ${status}`}>{statusLabel(status)}</span>
      </div>
    </div>
  );
}

function statusLabel(s: Debt["status"]) {
  return s === "paid" ? "Paid" : s === "overdue" ? "Overdue" : "Pending";
}
