import React from "react";

export default function Settings() {
  return (
    <div className="card-list">
      <div className="card">
        <div>
          <div className="title">Theme</div>
          <div className="sub">Dark teal / mint (locked)</div>
        </div>
        <button className="primary-btn" onClick={() => alert("Themes coming soon")}>Change</button>
      </div>
      <div className="card">
        <div>
          <div className="title">Notifications</div>
          <div className="sub">Push + Email</div>
        </div>
        <button className="primary-btn" onClick={() => alert("Notification settings")}>Edit</button>
      </div>
    </div>
  );
}
