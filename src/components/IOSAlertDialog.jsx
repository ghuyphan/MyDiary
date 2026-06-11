import React, { useState, useEffect, useRef } from "react";

export default function IOSAlertDialog({ type, title, message, defaultValue = "", onResolve, t }) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (type === "prompt" && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [type]);

  const handleCancel = () => {
    if (type === "alert") {
      onResolve(true);
    } else {
      onResolve(null);
    }
  };

  const handleConfirm = () => {
    if (type === "prompt") {
      onResolve(inputValue);
    } else {
      onResolve(true);
    }
  };

  const isDestructive = message && (
    message.includes("delete") || 
    message.includes("discard") ||
    message.includes("削除") || 
    message.includes("破記") ||
    message.includes("破棄")
  );

  return (
    <div className="ios-alert-scrim" onClick={(e) => e.stopPropagation()}>
      <div className="ios-alert-dialog">
        <div className="ios-alert-content">
          {title && <h3 className="ios-alert-title">{title}</h3>}
          {message && <p className="ios-alert-message">{message}</p>}
          {type === "prompt" && (
            <input
              ref={inputRef}
              className="ios-alert-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              aria-label="Input field"
            />
          )}
        </div>
        <div className="ios-alert-buttons">
          {type !== "alert" && (
            <button className="ios-alert-btn ios-alert-btn-cancel" onClick={handleCancel}>
              {t("cancel")}
            </button>
          )}
          <button 
            className={`ios-alert-btn ios-alert-btn-ok ${isDestructive ? "destructive" : ""}`} 
            onClick={handleConfirm}
          >
            {t("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
