import React, { useState, useCallback } from "react";
import Icon from "./Icon";
import BottomBar from "./BottomBar";
import FlatList from "./FlatList";
import EntryCard from "./EntryCard";
import Calendar from "./Calendar";
import DiaryEditor from "./DiaryEditor";
import { getTranslatedTopicTitle } from "../constants/initialData";

export default function Diary({ data, setData, title, tab, setTab, selected, setSelected, goHome, t, currentLang, showConfirm, showPrompt, showAlert, triggerOverlay, onSaved }) {
  const openEntry = (entry) => {
    setSelected(entry);
    setTab("editor");
    setPhotoOverviewOpen(false);
  };

  const [photoOverviewOpen, setPhotoOverviewOpen] = useState(false);
  const [selectedOverviewPhoto, setSelectedOverviewPhoto] = useState(null);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  
  const visibleEntries = bookmarkedOnly ? data.entries.filter((entry) => entry.bookmarked) : data.entries;
  
  const toggleBookmark = useCallback((entryId) => {
    setData((current) => ({
      ...current,
      entries: current.entries.map((entry) => entry.id === entryId
        ? { ...entry, bookmarked: !entry.bookmarked }
        : entry),
    }));
  }, [setData]);

  return (
    <main className="screen diary-screen">
      <header className="diary-header">
        <div className="native-segmented">
          <button className={tab === "entries" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("entries"); setPhotoOverviewOpen(false); }}>{t("entries")}</button>
          <button className={tab === "calendar" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("calendar"); setPhotoOverviewOpen(false); }}>{t("calendar")}</button>
          <button className={tab === "editor" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("editor"); setPhotoOverviewOpen(false); }}>{t("diary")}</button>
        </div>
        <div className="diary-topic-title">{photoOverviewOpen ? t("photo_overview") : getTranslatedTopicTitle(title, t)}</div>
      </header>
      
      {photoOverviewOpen ? (
        <PhotoOverview
          t={t}
          entries={data.entries}
          onSelectPhoto={(photo, entry) => setSelectedOverviewPhoto({ photo, entry })}
        />
      ) : (
        <div className="diary-content">
          {tab === "entries" && (
            visibleEntries.length === 0 && bookmarkedOnly ? (
              <div className="bookmark-empty" role="status">
                <svg className="bookmark-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3.5A1.5 1.5 0 0 1 7.5 2h9A1.5 1.5 0 0 1 18 3.5V22l-6-4.15L6 22V3.5Z" />
                </svg>
                <p>{t("no_bookmarks")}</p>
                <button onClick={() => setBookmarkedOnly(false)}>{t("show_all_entries")}</button>
              </div>
            ) : (
              <EntryList entries={visibleEntries} openEntry={openEntry} toggleBookmark={toggleBookmark} t={t} currentLang={currentLang} />
            )
          )}
          {tab === "calendar" && <Calendar entries={data.entries} openEntry={openEntry} toggleBookmark={toggleBookmark} t={t} currentLang={currentLang} />}
          {tab === "editor" && <DiaryEditor entry={selected} data={data} setData={setData} close={() => setTab("entries")} t={t} currentLang={currentLang} showConfirm={showConfirm} showPrompt={showPrompt} showAlert={showAlert} triggerOverlay={triggerOverlay} onSaved={onSaved} />}
        </div>
      )}

      {tab !== "editor" && !photoOverviewOpen && (
        <BottomBar>
          <button onClick={goHome}><Icon name="ic_menu_white_24dp.png" /></button>
          <button onClick={() => { setSelected(null); setTab("editor"); }}><Icon name="ic_mode_edit_white_24dp.png" /></button>
          <button onClick={() => setPhotoOverviewOpen(true)}><Icon name={tab === "calendar" ? "ic_photo_camera_white_24dp.png" : "ic_photo_white_24dp.png"} /></button>
          {tab === "entries" && (
            <button
              className={`bookmark-filter ${bookmarkedOnly ? "active" : ""}`}
              onClick={() => setBookmarkedOnly((value) => !value)}
              aria-label="Show bookmarked entries"
              aria-pressed={bookmarkedOnly}
            >
              <svg className="bookmark-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3.5A1.5 1.5 0 0 1 7.5 2h9A1.5 1.5 0 0 1 18 3.5V22l-6-4.15L6 22V3.5Z" />
              </svg>
            </button>
          )}
          {tab === "entries" && <span className="entry-count">{t("entries_count", visibleEntries.length)}</span>}
        </BottomBar>
      )}

      {selectedOverviewPhoto && (
        <PhotoViewerModal
          t={t}
          currentLang={currentLang}
          item={selectedOverviewPhoto}
          close={() => setSelectedOverviewPhoto(null)}
          viewEntry={openEntry}
        />
      )}
    </main>
  );
}

function EntryList({ entries, openEntry, toggleBookmark, t, currentLang }) {
  const grouped = entries.reduce((result, entry) => {
    const month = String(new Date(`${entry.date}T00:00:00`).getMonth() + 1);
    if (!result[month]) result[month] = [];
    result[month].push(entry);
    return result;
  }, {});
  let flatIdx = 0;
  return (
    <section className="entry-list">
      {Object.entries(grouped).map(([month, monthEntries]) => (
        <div key={month}>
          <div className="entry-month anim-stagger-item" style={{ "--stagger-i": flatIdx }}>{month}</div>
          <FlatList
            data={monthEntries}
            keyExtractor={(entry) => entry.id}
            renderItem={({ item }) => {
              const i = ++flatIdx;
              return (
                <EntryCard
                  entry={item}
                  openEntry={openEntry}
                  toggleBookmark={toggleBookmark}
                  t={t}
                  currentLang={currentLang}
                  index={i}
                />
              );
            }}
          />
        </div>
      ))}
    </section>
  );
}

function PhotoOverview({ entries, onSelectPhoto, t }) {
  const allPhotos = [];
  entries.forEach((entry) => {
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach((photo, index) => {
        allPhotos.push({ photo, entry, index });
      });
    }
  });

  return (
    <div className="photo-overview-screen">
      <div className="photo-grid">
        {allPhotos.length === 0 ? (
          <div className="no-photos-msg">{t("no_photos")}</div>
        ) : (
          allPhotos.map((item, idx) => (
            <button key={idx} className="grid-photo-btn" onClick={() => onSelectPhoto(item.photo, item.entry)}>
              <img src={item.photo} alt={`Grid item ${idx + 1}`} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function PhotoViewerModal({ item, close, viewEntry, t, currentLang }) {
  const dateText = currentLang === "ja"
    ? new Date(`${item.entry.date}T00:00:00`).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }) + " (" + new Date(`${item.entry.date}T00:00:00`).toLocaleDateString("ja-JP", { weekday: "short" }) + ")"
    : new Date(`${item.entry.date}T00:00:00`).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  return (
    <div className="viewer-scrim" onClick={close}>
      <div className="viewer-container" onClick={(e) => e.stopPropagation()}>
        <header className="viewer-header">
          <span>{dateText} {item.entry.time} - {item.entry.title || t("no_title")}</span>
          <button className="viewer-close-btn" onClick={close}>×</button>
        </header>
        <div className="viewer-body">
          <img src={item.photo} alt="Large layout preview" />
        </div>
        <footer className="viewer-footer">
          <button className="viewer-action-btn" onClick={() => viewEntry(item.entry)}>{t("view_diary_entry")}</button>
        </footer>
      </div>
    </div>
  );
}
