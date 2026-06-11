import React, { useState, useEffect, useCallback } from "react";
import Icon from "./Icon";
import { verifyPin } from "../security/pin";

const KEYPAD_LETTERS = {
  1: "",
  2: "A B C",
  3: "D E F",
  4: "G H I",
  5: "J K L",
  6: "M N O",
  7: "P Q R S",
  8: "T U V",
  9: "W X Y Z",
  0: ""
};

export default function LockScreen({ mode, expectedPin, expectedSecurity, onComplete, onLegacyUnlock, onCancel, t }) {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState(() => {
    if (mode === "unlock") return t("enter_passcode");
    if (mode === "create") return t("create_passcode");
    if (mode === "confirm") return t("confirm_passcode");
    if (mode === "remove") return t("enter_passcode_to_unlock");
    return "";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [tempPin, setTempPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleKeyPress = useCallback((num) => {
    if (pin.length >= 4) return;
    setErrorMsg("");
    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(async () => {
        if (mode === "unlock") {
          const valid = expectedSecurity
            ? await verifyPin(nextPin, expectedSecurity)
            : nextPin === expectedPin;
          if (valid) {
            if (!expectedSecurity && expectedPin && onLegacyUnlock) await onLegacyUnlock(nextPin);
            onComplete(nextPin);
          } else {
            setErrorMsg(t("wrong_passcode"));
            setPin("");
            triggerShake();
          }
        } else if (mode === "remove") {
          const valid = expectedSecurity
            ? await verifyPin(nextPin, expectedSecurity)
            : nextPin === expectedPin;
          if (valid) {
            onComplete();
          } else {
            setErrorMsg(t("wrong_passcode"));
            setPin("");
            triggerShake();
          }
        } else if (tempPin) {
          if (nextPin === tempPin) {
            onComplete(nextPin);
          } else {
            setErrorMsg(t("passcode_not_match"));
            setPin("");
            setTempPin("");
            setMessage(t("create_passcode"));
            triggerShake();
          }
        } else if (mode === "create") {
          setTempPin(nextPin);
          setPin("");
          setMessage(t("confirm_passcode"));
        }
      }, 300);
    }
  }, [pin, expectedPin, expectedSecurity, mode, onComplete, onLegacyUnlock, tempPin, t]);

  const handleBackspace = useCallback(() => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg("");
    }
  }, [pin]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(parseInt(e.key, 10));
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleBackspace, onCancel]);

  return (
    <div className="lock-screen">
      <div className="lock-header">
        <h2>{message}</h2>
        <p style={{ color: "#ff8b80" }}>{errorMsg}</p>
      </div>
      
      <div className={`lock-dots ${isShaking ? "shake" : ""}`}>
        {[0, 1, 2, 3].map((idx) => {
          const isFilled = pin.length > idx;
          return (
            <span
              key={idx}
              className={`lock-dot-circle ${isFilled ? "filled" : ""}`}
            />
          );
        })}
      </div>

      <div className="lock-keyboard">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} className="lock-key" onClick={() => handleKeyPress(num)}>
            <span className="num-val">{num}</span>
            <span className="letters-val">{KEYPAD_LETTERS[num]}</span>
          </button>
        ))}
        {onCancel ? (
          <button className="lock-key action" onClick={onCancel}>{t("cancel")}</button>
        ) : (
          <span className="lock-key empty" />
        )}
        <button className="lock-key" onClick={() => handleKeyPress(0)}>
          <span className="num-val">0</span>
          <span className="letters-val">{KEYPAD_LETTERS[0]}</span>
        </button>
        <button className="lock-key action" onClick={handleBackspace}>
          <Icon name="ic_backspace_black_24dp.png" alt="Backspace" />
        </button>
      </div>
    </div>
  );
}
