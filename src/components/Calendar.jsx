import React, { useState } from "react";
import FlatList from "./FlatList";
import Icon from "./Icon";
import EntryCard from "./EntryCard";

export default function Calendar({ entries, openEntry, toggleBookmark, t, currentLang }) {
  const [viewDate, setViewDate] = useState(() => {
    if (entries.length > 0) {
      return new Date(`${entries[0].date}T00:00:00`);
    }
    return new Date();
  });
  const [calendarMode, setCalendarMode] = useState("day");
  const [dragStart, setDragStart] = useState(null);
  const [dayTurn, setDayTurn] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevAction = () => {
    if (calendarMode === "day") {
      const previousDay = new Date(viewDate);
      previousDay.setDate(viewDate.getDate() - 1);
      setDayTurn({ id: Date.now(), direction: "prev", fromDate: new Date(viewDate) });
      setViewDate(previousDay);
    } else {
      setViewDate(new Date(year, month - 1, 1));
    }
  };

  const nextAction = () => {
    if (calendarMode === "day") {
      const followingDay = new Date(viewDate);
      followingDay.setDate(viewDate.getDate() + 1);
      setDayTurn({ id: Date.now(), direction: "next", fromDate: new Date(viewDate) });
      setViewDate(followingDay);
    } else {
      setViewDate(new Date(year, month + 1, 1));
    }
  };

  const formattedMonthName = viewDate.toLocaleDateString(currentLang, { month: "long" });
  const formattedWeekday = viewDate.toLocaleDateString(currentLang, { weekday: "long" });
  const selectedDatePattern = [
    year,
    String(month + 1).padStart(2, "0"),
    String(viewDate.getDate()).padStart(2, "0"),
  ].join("-");
  const selectedEntry = entries.find((item) => item.date === selectedDatePattern);
  const selectedDayEntries = entries.filter((item) => item.date === selectedDatePattern);
  
  const formatDay = (date) => ({
    month: date.toLocaleDateString(currentLang, { month: "long" }),
    date: date.getDate(),
    weekday: date.toLocaleDateString(currentLang, { weekday: "long" }),
  });
  const turnedFromDay = dayTurn ? formatDay(dayTurn.fromDate) : null;

  const weekdays = currentLang === "ja"
    ? ["月", "火", "水", "木", "金", "土", "日"]
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Helper to render the day cells
  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
    const spacers = Array.from({ length: startDayOfWeek }, (_, index) => index);

    return (
      <>
        {spacers.map((val) => <i key={`spacer-${val}`} />)}
        {days.map((day) => {
          const monthStr = String(month + 1).padStart(2, "0");
          const dayStr = String(day).padStart(2, "0");
          const datePattern = `${year}-${monthStr}-${dayStr}`;
          const entry = entries.find((item) => item.date === datePattern);
          const dayDate = new Date(year, month, day);
          const isToday = new Date().toDateString() === dayDate.toDateString();
          const isSelected = viewDate.toDateString() === dayDate.toDateString();

          return (
            <button
              key={day}
              className={`${entry ? "marked" : ""} ${isToday ? "today-cell" : ""} ${isSelected ? "selected-cell" : ""}`}
              onClick={() => {
                setViewDate(dayDate);
              }}
            >
              {day}
              {entry && <span />}
            </button>
          );
        })}
      </>
    );
  };

  return (
    <section
      className={`calendar-view ${calendarMode === "day" ? "calendar-day-mode" : "calendar-month-mode"}`}
      onPointerDown={(event) => {
        if (calendarMode !== "day") return;
        setDragStart(event.clientX);
      }}
      onPointerUp={(event) => {
        if (dragStart === null) return;
        const distance = event.clientX - dragStart;
        if (Math.abs(distance) > 44) {
          if (distance > 0) prevAction();
          else nextAction();
        }
        setDragStart(null);
      }}
      onPointerCancel={() => setDragStart(null)}
    >
      {calendarMode === "day" ? (
        <div className="anime-day-sheet">
          <button className="day-page-hit day-page-prev" onClick={prevAction} aria-label="Previous day" />
          <button
            className="day-page-date"
            onClick={() => selectedEntry && openEntry(selectedEntry)}
            aria-label={selectedEntry ? t("view_diary_entry") : selectedDatePattern}
          >
            <span className="day-page-month">{formattedMonthName}</span>
            <strong>{viewDate.getDate()}</strong>
            <span className="day-page-weekday">{formattedWeekday}</span>
            {selectedEntry && <i className="day-page-entry-dot" />}
          </button>
          <button className="day-page-hit day-page-next" onClick={nextAction} aria-label="Next day" />
          {turnedFromDay && (
            <div
              key={dayTurn.id}
              className={`page-flip-layer page-flip-${dayTurn.direction}`}
              onAnimationEnd={() => {
                setDayTurn(null);
              }}
              aria-hidden="true"
            >
              <div className="day-page-date page-flip-copy">
                <span className="day-page-month">{turnedFromDay.month}</span>
                <strong>{turnedFromDay.date}</strong>
                <span className="day-page-weekday">{turnedFromDay.weekday}</span>
              </div>
              <div className="page-fold-wrapper">
                <i className="page-fold-back" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="month-calendar">
          <div className="calendar-month">
            <button onClick={prevAction}>‹</button>
            <span>
              <small>{year}</small>
              {formattedMonthName}
            </span>
            <button onClick={nextAction}>›</button>
          </div>
          <div className="week-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="day-grid">
            {renderDays()}
          </div>
        </div>
      )}
      <div className="calendar-entries-container">
        {selectedDayEntries.length > 0 ? (
          <FlatList
            data={selectedDayEntries}
            keyExtractor={(entry) => entry.id}
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                openEntry={openEntry}
                toggleBookmark={toggleBookmark}
                t={t}
                currentLang={currentLang}
                index={0}
              />
            )}
          />
        ) : (
          <div className="calendar-no-entries">
            <span>{currentLang === "ja" ? "この日のエントリーはありません" : "No entries on this day"}</span>
          </div>
        )}
      </div>
      <button 
        className={`calendar-mode ${calendarMode === "month" ? "month-mode" : "day-mode"}`}
        onClick={() => setCalendarMode(calendarMode === "month" ? "day" : "month")}
        aria-label="Toggle calendar mode"
      >
        <Icon name="ic_keyboard_arrow_down_black_24dp.png" />
      </button>
    </section>
  );
}
