import React from "react";

export default function NativeTitle({ title, goHome, children }) {
  return (
    <header className="native-title">
      <button className="screen-back" onClick={goHome}>‹</button>
      <span>{title}</span>
      {children}
    </header>
  );
}
