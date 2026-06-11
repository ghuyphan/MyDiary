import React from "react";

export default function NativeDialog({ title, close, children }) {
  return (
    <div
      className="dialog-scrim ios-form-scrim"
      onMouseDown={close}
      onKeyDown={(event) => event.key === "Escape" && close()}
      role="presentation"
    >
      <section
        className="native-dialog ios-form-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ios-form-content">
          <h3>{title}</h3>
          {children}
        </div>
      </section>
    </div>
  );
}
