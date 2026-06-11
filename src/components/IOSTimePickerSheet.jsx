import React, { useState } from "react";
import IOSPickerWheel from "./IOSPickerWheel";

export default function IOSTimePickerSheet({ value, onClose, onSave, t, currentLang }) {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  // Parse initial value (value is "HH:MM", e.g. "08:23" or "20:23")
  const [initialH24, initialM] = value.split(":").map(Number);
  const initialPeriod = initialH24 >= 12 ? "PM" : "AM";
  let initialH12 = initialH24 % 12;
  if (initialH12 === 0) initialH12 = 12;

  const [selectedHour, setSelectedHour] = useState(String(initialH12).padStart(2, "0"));
  const [selectedMinute, setSelectedMinute] = useState(String(initialM).padStart(2, "0"));
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  const handleDone = () => {
    let h12 = parseInt(selectedHour, 10);
    const m = selectedMinute;
    const period = selectedPeriod;

    let h24 = h12;
    if (period === "PM" && h12 !== 12) {
      h24 += 12;
    } else if (period === "AM" && h12 === 12) {
      h24 = 0;
    }

    const h24Str = String(h24).padStart(2, "0");
    onSave(`${h24Str}:${m}`);
  };

  return (
    <div className="ios-picker-scrim" onClick={onClose}>
      <div className="ios-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ios-picker-header">
          <button className="ios-picker-cancel-btn" onClick={onClose}>{t("cancel")}</button>
          <span className="ios-picker-title">{currentLang === "ja" ? "時刻の選択" : "Select Time"}</span>
          <button className="ios-picker-done-btn" onClick={handleDone}>{t("ok")}</button>
        </div>
        <div className="ios-picker-wheels-container">
          <div className="ios-picker-selection-indicator" />
          <IOSPickerWheel options={hours} value={selectedHour} onChange={setSelectedHour} />
          <IOSPickerWheel options={minutes} value={selectedMinute} onChange={setSelectedMinute} />
          <IOSPickerWheel options={periods} value={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
      </div>
    </div>
  );
}
