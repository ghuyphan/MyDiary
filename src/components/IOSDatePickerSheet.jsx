import React, { useState, useEffect } from "react";
import IOSPickerWheel from "./IOSPickerWheel";

export default function IOSDatePickerSheet({ value, onClose, onSave, t, currentLang }) {
  const years = Array.from({ length: 26 }, (_, i) => String(2010 + i));
  // iOS 7 style: full month names
  const months = currentLang === "ja"
    ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    : ["January", "February", "March", "April", "May", "June",
       "July", "August", "September", "October", "November", "December"];

  const initialDate = new Date(`${value}T00:00:00`);
  const [selectedYear, setSelectedYear] = useState(String(initialDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(months[initialDate.getMonth()]);

  const monthIdx = months.indexOf(selectedMonth);
  const daysInMonth = new Date(parseInt(selectedYear, 10), monthIdx + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  // Safe day state initialization
  const initialDayVal = String(initialDate.getDate());
  const [selectedDay, setSelectedDay] = useState(initialDayVal);

  // Clamping days when month length changes
  useEffect(() => {
    const dayInt = parseInt(selectedDay, 10);
    if (dayInt > daysInMonth) {
      setSelectedDay(String(daysInMonth));
    }
  }, [selectedYear, selectedMonth, daysInMonth, selectedDay]);

  const handleDone = () => {
    const yearStr = selectedYear;
    const monthIndex = months.indexOf(selectedMonth);
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dayStr = String(Math.min(parseInt(selectedDay, 10), daysInMonth)).padStart(2, "0");
    onSave(`${yearStr}-${monthStr}-${dayStr}`);
  };

  return (
    <div className="ios-picker-scrim" onClick={onClose}>
      <div className="ios-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ios-picker-header">
          <button className="ios-picker-cancel-btn" onClick={onClose}>{t("cancel")}</button>
          <span className="ios-picker-title">{currentLang === "ja" ? "日付の選択" : "Select Date"}</span>
          <button className="ios-picker-done-btn" onClick={handleDone}>{t("ok")}</button>
        </div>
        <div className="ios-picker-wheels-container">
          <div className="ios-picker-selection-indicator" />
          <IOSPickerWheel options={months} value={selectedMonth} onChange={setSelectedMonth} />
          <IOSPickerWheel options={days} value={selectedDay} onChange={setSelectedDay} />
          <IOSPickerWheel options={years} value={selectedYear} onChange={setSelectedYear} />
        </div>
      </div>
    </div>
  );
}
