import React from "react";
import Icon from "./Icon";
import { getTranslatedEntryField } from "../constants/initialData";

export const EntryCard = React.memo(function EntryCard({ entry, openEntry, toggleBookmark, t, currentLang, index }) {
  const rawDate = new Date(`${entry.date}T00:00:00`);
  const weekdayText = entry.weekday || rawDate.toLocaleDateString(currentLang, { weekday: "short" });
  return (
    <div className="entry-card anim-stagger-item" style={{ "--stagger-i": index }}>
      <button className="entry-card-main" onClick={() => openEntry(entry)}>
        <div className="entry-card-date">
          <b>{entry.day}</b>
          <span>{weekdayText}.</span>
        </div>
        <div className="entry-copy">
          <strong className="entry-card-title">{getTranslatedEntryField(entry.title, t) || t("no_title")}</strong>
          <span className="entry-card-summary">{getTranslatedEntryField(entry.summary ?? entry.content ?? entry.location ?? "", t)}</span>
        </div>
        <div className="entry-card-icons">
          <div className="entry-card-top-icons">
            <Icon name={`ic_weather_${entry.weather}.png`} className="entry-card-icon" tint />
            <Icon name={`ic_mood_${entry.mood}.png`} className="entry-card-icon" tint />
          </div>
          {entry.photos && entry.photos.length > 0 && (
            <Icon name="ic_attach.png" className="entry-card-attach-icon" tint />
          )}
        </div>
      </button>
      <button
        className={`bookmark-button ${entry.bookmarked ? "active" : ""}`}
        aria-label="Bookmark entry"
        aria-pressed={Boolean(entry.bookmarked)}
        onClick={() => toggleBookmark?.(entry.id)}
      >
        <Icon name="ic_bookmark_border.png" className="entry-card-icon bookmark-icon" tint />
      </button>
    </div>
  );
});

export default EntryCard;
