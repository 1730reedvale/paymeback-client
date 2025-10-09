import React from "react";

export default function History() {
  return (
    <>
      <div className="segmented">
        <button className="tab active">All</button>
        <button className="tab">Paid</button>
        <button className="tab">Overdue</button>
      </div>
      <div className="card-list">
        <div className="card">
          <div className="meta">
            <div
              className="avatar"
              style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(180deg,#79e3cf,#3fbfa9)" }}
            />
            <div>
              <div className="title">Paid • Taxi split</div>
              <div className="sub">You received $24 from Avery • Yesterday</div>
            </div>
          </div>
          <div className="row">
            <strong>$24</strong>
            <span className="chip paid">Paid</span>
          </div>
        </div>
      </div>
    </>
  );
}
