import React from "react";

export default function Friends() {
  return (
    <>
      <div className="segmented">
        <button className="tab active">All Friends</button>
        <button className="tab">Invites</button>
      </div>
      <div className="card-list">
        <div className="card">
          <div className="meta">
            <div
              className="avatar"
              style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(180deg,#79e3cf,#3fbfa9)" }}
            />
            <div>
              <div className="title">Jordan M.</div>
              <div className="sub">Owes you $40 • 2 open items</div>
            </div>
          </div>
          <button className="primary-btn">Message</button>
        </div>
      </div>
    </>
  );
}
