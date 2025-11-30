import React from "react";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <button className="nav-btn">Now</button>
      <button className="nav-btn">Historic</button>
      <button className="nav-btn active">Appliances</button>
      <button className="nav-btn">Devices</button>
      <button className="nav-btn">Menu</button>
    </nav>
  );
}
